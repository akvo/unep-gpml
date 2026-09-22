(ns gpml.util.email
  (:require
   [clojure.string :as string]
   [gpml.boundary.port.chat :as port.chat]
   [gpml.db.stakeholder :as db.stakeholder]
   [gpml.handler.util :as h.util]
   [gpml.util :as util]
   [gpml.util.malli :refer [PresentString check!]]
   [gpml.util.result :refer [failure]]
   [pogonos.core :as pogonos]
   [postal.core :as postal]
   [taoensso.timbre :as timbre])
  (:import
   (javax.mail.internet InternetAddress)))

(def notify-admins-new-channel-request--html-template
  (delay
    (pogonos/parse-resource "gpml/email_templates/notify_admins_new_channel_request.mustache")))

(def base--html-template
  (delay
    (pogonos/parse-resource "gpml/email_templates/base.mustache")))

(def Lines [:sequential {:min 1} :string])

(defn basic-html-email [{:keys [lines]}]
  {:pre [(check! Lines lines)]}
  (pogonos/render @base--html-template {:lines lines}))

(defn text->lines [s]
  {:post [(check! Lines %)]}
  (into []
        (remove string/blank?) ;; handle double \n\n and the like
        (string/split-lines s)))

(defn text->basic-html-email [s]
  (basic-html-email {:lines (text->lines s)}))

;; =========================================================
;; Delivery over SMTP
;; =========================================================

;; Everything above builds the words; everything below hands them to a
;; relay. The `{:Name _ :Email _}` shape that senders and receivers are
;; written in is a leftover from the Mailjet API, kept because it is
;; spelled out at every call site in this namespace and in the handlers.
;; It is translated into postal's vocabulary here, and nowhere else.

(defn- ->address
  "Builds an `InternetAddress` from a `{:Name _ :Email _}` pair.

  Postal will happily parse an address written as `\"Name <a@b.com>\"`,
  but that goes through `InternetAddress/parse`, which splits on commas.
  Display names here come from user-supplied profile fields, so a
  perfectly ordinary `\"Smith, John\"` would parse as two addresses and
  the mail would go somewhere nobody asked for. Handing the name and the
  address over separately keeps the name opaque."
  ^InternetAddress [{:keys [Name Email]}]
  (InternetAddress. ^String Email ^String Name "utf-8"))

(defn make-message [sender receiver subject text html]
  {:from (->address sender)
   :to (->address receiver)
   :subject subject
   ;; multipart/alternative: a client renders the HTML part and falls
   ;; back to the plain text one. The charset has to ride along inside
   ;; the content type, because postal passes `:type` straight to
   ;; `MimeBodyPart.setContent`, which takes no charset of its own.
   :body [:alternative
          {:type "text/plain; charset=utf-8" :content text}
          {:type "text/html; charset=utf-8" :content html}]})

(defn- smtp-server
  "Translates our config into the server map postal expects.

  Two details are easy to get wrong and expensive to discover in
  production:

  Blank credentials become `nil` rather than `\"\"`. Postal derives
  `mail.smtp.auth` from whether `:user` is truthy, so an empty string
  makes it attempt an AUTH handshake against a relay that never asked
  for one, and it asserts that user and pass are either both present or
  both absent.

  The timeouts are strings. Postal forwards any key it does not
  recognise as a `mail.smtp.*` property, and jakarta.mail reads those
  back with `Properties/getProperty`, which returns nil for a value
  stored as a number — leaving the socket with no timeout at all. A
  relay that accepts the connection and then stops talking would hold
  the sending thread forever, which is precisely the failure mode this
  migration is meant to remove."
  [{:keys [host port user pass tls ssl timeout]}]
  {:host host
   :port port
   :user (not-empty user)
   :pass (not-empty pass)
   :tls tls
   :ssl ssl
   :connectiontimeout (str timeout)
   :timeout (str timeout)
   :writetimeout (str timeout)})

(defn get-user-full-name [{:keys [title first_name last_name]}]
  (if (nil? title)
    (format "%s %s" first_name last_name)
    (format "%s. %s %s" title first_name last_name)))

(defn send-email
  "Sends `subject` to every entry of `receivers`, each with its own entry
  of `texts` and `htmls` as the body.

  Mailjet accepted a single API call carrying every personalised message
  and answered with one HTTP status. SMTP has no equivalent, so each
  recipient is delivered separately and gets its own verdict. We report
  success only when every one of them was accepted: a batch that reached
  half its recipients is the case an operator actually needs to hear
  about, and collapsing it into a success is how the previous
  integration managed to drop mail without leaving a trace."
  [config sender subject receivers texts htmls]
  {:pre [(check! [:sequential {:min 1} PresentString]
                 texts

                 [:sequential {:min 1} PresentString]
                 htmls)]}
  (let [messages (mapv make-message (repeat sender) receivers (repeat subject) texts htmls)
        server (smtp-server config)]
    ;; The context is what the JSON appender writes out, so it carries
    ;; the addresses rather than the postal messages: those hold
    ;; `InternetAddress` objects it cannot serialise, and the bodies are
    ;; not worth putting in the logs anyway.
    (timbre/with-context+ {::receivers (mapv :Email receivers)
                           ::subject subject}
      (let [results (mapv (fn [message]
                            ;; Postal only traps exceptions on its sendmail
                            ;; path. Given a server map it lets a refused
                            ;; connection, a failed handshake or a rejected
                            ;; recipient propagate.
                            (try
                              (postal/send-message server message)
                              (catch Exception e
                                (timbre/error e)
                                {:code 99 :message (ex-message e)})))
                          messages)
            errors (remove (comp #{0} :code) results)]
        (if (seq errors)
          (failure {:reason :failed-to-send-email
                    :error-details (mapv :message errors)})
          {:success? true})))))

;; FIXME: this shouldn't be hardcoded here. The relay has to be
;; permitted to send as this address, so a deployment with its own
;; domain cannot use it without editing this file.
(def unep-sender
  {:Name "GlobalPlasticsHub" :Email "no-reply@gpmarinelitter.org"})

(def notify-admins-pending-approval-text
  "Dear %s,

A new %s (%s) is awaiting your approval. Please visit %s/profile to approve or decline the request.

- GlobalPlasticsHub
")

(def notify-secretariat-new-subscription-text
  "Dear GPML Secretariat,

A new subscription request has arrived from %s.

- GlobalPlasticsHub
")

(defn new-resource-comment-text [resource-owner comment-author resource-title app-domain]
  (format "Dear %s,

%s commented on your resource %s. For more details visit your resource's detail page %s.

- GlobalPlasticsHub" resource-owner comment-author resource-title app-domain))

(defn notify-expert-invitation-text [first-name last-name invitation-id app-domain]
  (let [platform-link (str app-domain "/login?invite=" invitation-id)
        user-full-name (get-user-full-name {:first_name first-name :last_name last-name})]
    (format "Dear %s,

You have been invited to join the GlobalPlasticsHub as an expert.

Please, click on the link to accept the invitation: %s" user-full-name platform-link)))

(defn notify-reviewer-pending-review-text [reviewer-name app-domain topic-type topic-title]
  (format "Dear %s,

A new %s (%s) is awaiting your review. Please visit %s/profile to review the resource.

- GlobalPlasticsHub
" reviewer-name topic-type topic-title app-domain))

(defn notify-review-submitted-text [admin-name app-domain topic-type topic-title review-status review-comment]
  (format "Dear %s,

A review has been submitted for %s (%s).

Status: %s
Comment: %s

Please visit %s/profile to publish or reject the resource.

- GlobalPlasticsHub
" admin-name topic-type topic-title review-status review-comment app-domain))

(defn notify-user-review-approved-text [email-config topic-type topic-item]
  (format "Dear user,

Your submission has been published to %s/%s/%s.

- GlobalPlasticsHub
"
          (:app-domain email-config)
          (h.util/get-api-topic-type topic-type topic-item)
          (:id topic-item)))

(defn notify-user-review-rejected-text [email-config topic-type topic-item]
  (format "Dear user,

Your submission (%s) has been rejected.

If you'd like to edit the submission and get the admins to review it
again, please visit this URL: %s/edit-%s/%s

- GlobalPlasticsHub
"
          (h.util/get-title topic-type topic-item)
          (:app-domain email-config)
          (-> (h.util/get-api-topic-type topic-type topic-item)
              (string/replace "_" "-"))
          (:id topic-item)))

(defn notify-user-review-subject [email-config review-status topic-type topic-item]
  (format "[%s] %s %s"
          (:app-name email-config)
          (h.util/get-display-topic-type topic-type topic-item)
          (string/lower-case review-status)))

(defn notify-private-channel-invitation-request-subject [app-name channel-name]
  (format "[%s] Request to Join %s" app-name channel-name))

(defn notify-user-about-chat-private-channel-invitation-request-accepted-subject [app-name channel-name]
  (format "[%s] You've joined %s" app-name channel-name))

(defn notify-private-channel-invitation-request-text [user-name channel-name review-request-link]
  (format "%s wants to join %s

Visit the link below to review the request:

%s

- GlobalPlasticsHub"
          user-name
          channel-name
          review-request-link))

(defn notify-user-about-chat-private-channel-invitation-request-accepted-text [channel-name base-url]
  (format "Your request to join %s channel on the GPML platform was approved.

View the forums in your GPML workspace:

%s/forum

- GlobalPlasticsHub"
          channel-name
          base-url))

(defn notify-user-invitation-text [inviter-name app-domain entity-name]
  (format "Dear user,

%s has invited you to join %s as part of entity %s. Please visit %s/stakeholder-signup and follow instructions to signup.

- GlobalPlasticsHub
" inviter-name app-domain entity-name app-domain))

(defn notify-user-invitation-subject [inviter-name]
  (format "%s has invited you to join GlobalPlasticsHub" inviter-name))

(defn new-resource-comment-subject [comment-author]
  (format "%s commented on your resource" comment-author))

(defn- notify-user-about-plastic-strategy-invitation-subject [app-name]
  (format "[%s] You have been invited to participate in a Plastic Strategy on GPML Platform" app-name))

(defn- notify-user-about-plastic-strategy-invitation-text [app-domain user-full-name country-name]
  (format "Dear %s,

You have been invited to participate in the Plastic Strategy for %s country.

To accept this invitation please visit %s and sign up to GPML Platform.

- GlobalPlasticsHub"
          user-full-name
          country-name
          app-domain))

(defn notify-admins-pending-approval [db email-config new-item]
  (let [admins (db.stakeholder/get-admins db)
        item-type (:type new-item)
        item-title (if (= item-type "stakeholder")
                     (get-user-full-name new-item)
                     (or (:title new-item) (:name new-item) (:tag new-item)))
        subject (format "[%s] New %s needs approval" (:app-name email-config) item-type)
        sender unep-sender
        names (mapv get-user-full-name admins)
        receivers (mapv #(assoc {} :Name %1 :Email (:email %2)) names admins)
        texts (mapv #(format notify-admins-pending-approval-text
                             %1 item-type item-title
                             (:app-domain email-config))
                    names)
        htmls (mapv text->basic-html-email texts)]
    (when (-> receivers count pos?)
      (send-email email-config sender subject receivers texts htmls))))

(defn notify-secretariat-about-new-subscription-req
  "Send email about a new subscription request."
  [email-config dest-email req-email]
  (let [subject (format "[%s] New subscription request" (:app-name email-config))
        sender unep-sender
        receivers [{:Name "GPML Secretariat"
                    :Email dest-email}]
        texts [(format notify-secretariat-new-subscription-text req-email)]
        htmls (mapv text->basic-html-email texts)]
    (send-email email-config sender subject receivers texts htmls)))

(defn notify-about-new-contact
  "Send email about a new contact request."
  [email-config {dest-email :dest-email
                 req-email :email
                 name :name
                 organization :organization
                 msg :message
                 subject :subject}]
  (let [msg-body (format "Name: %s\nEmail: %s\nOrganization: %s\nMessage: \n%s"
                         name
                         req-email
                         organization
                         msg)
        sender unep-sender
        receivers [{:Name "Contact Management"
                    :Email dest-email}]
        texts [msg-body]
        htmls (mapv text->basic-html-email texts)]
    (send-email email-config sender subject receivers texts htmls)))

(defn notify-admins-new-chat-private-channel-invitation-request [email-config admins user channel-id channel-name]
  (let [sender unep-sender
        subject (notify-private-channel-invitation-request-subject
                 (:app-name email-config)
                 channel-name)
        receivers (mapv (fn [admin]
                          {:Name (get-user-full-name admin)
                           :Email (:email admin)})
                        admins)
        texts (mapv (fn [_receiver]
                      (notify-private-channel-invitation-request-text (get-user-full-name user)
                                                                      channel-name
                                                                      ;; Isn't there better reverse routing?
                                                                      (format "%s/profile/admin-section?user_id=%s&channel_id=%s&email=%s&channel_name=%s"
                                                                              (:app-domain email-config)
                                                                              (:id user)
                                                                              (util/encode-url-param channel-id)
                                                                              (util/encode-url-param (:email user))
                                                                              (util/encode-url-param channel-name))))
                    receivers)
        htmls (mapv text->basic-html-email texts)]
    (if-not (-> receivers count pos?)
      (failure {:reason :no-admins})
      (send-email email-config sender subject receivers texts htmls))))

(defn notify-admins-new-channel-request [email-config admins user new-channel]
  {:pre [(check! port.chat/NewChannel new-channel)]}
  (let [sender unep-sender
        subject (format "[%s] Request from %s to create a Chat Channel"
                        (:app-name email-config)
                        (get-user-full-name user))
        receivers (mapv (fn [admin]
                          {:Name (get-user-full-name admin)
                           :Email (:email admin)})
                        admins)
        texts (mapv (fn [_receiver]
                      (format "%s (User ID %s - %s) has requested to create a chat channel with the following details:

Name - %s
Description - %s
Privacy - %s

Feel free to create such a channel."
                              (get-user-full-name user)
                              (:id user)
                              (:email user)
                              (:name new-channel)
                              (or (:description new-channel) "")
                              (:privacy new-channel)))
                    receivers)
        htmls (mapv text->basic-html-email texts) #_(mapv (fn [_receiver]
                                                            (pogonos/render @notify-admins-new-channel-request--html-template {:messageCount
                                                                                                                               :channelURL
                                                                                                                               :channelName
                                                                                                                               :userName
                                                                                                                               :time
                                                                                                                               :message
                                                                                                                               #_:channelURL}))
                                                          receivers)]
    (if-not (-> receivers count pos?)
      (failure {:reason :no-admins})
      (send-email email-config sender subject receivers texts htmls))))

(defn notify-user-about-chat-private-channel-invitation-request-accepted [email-config user channel-name]
  (let [sender unep-sender
        subject (notify-user-about-chat-private-channel-invitation-request-accepted-subject
                 (:app-name email-config)
                 channel-name)
        receivers [{:Name (get-user-full-name user)
                    :Email (:email user)}]
        texts [(notify-user-about-chat-private-channel-invitation-request-accepted-text
                channel-name
                (:app-domain email-config))]
        htmls (mapv text->basic-html-email texts)]
    (send-email email-config sender subject receivers texts htmls)))

(defn notify-user-about-plastic-strategy-invitation [email-config user plastic-strategy]
  (let [sender unep-sender
        subject (notify-user-about-plastic-strategy-invitation-subject (:app-name email-config))
        user-full-name (get-user-full-name user)
        receivers [{:Name user-full-name
                    :Email (:email user)}]
        texts [(notify-user-about-plastic-strategy-invitation-text
                (:app-domain email-config)
                user-full-name
                (get-in plastic-strategy [:country :name]))]
        htmls (mapv text->basic-html-email texts)]
    (send-email email-config sender subject receivers texts htmls)))

(defn notify-user-added-to-plastic-strategy-team-subject [country-name]
  (format "You've been added to Plastic Strategy %s" country-name))

(defn notify-user-added-to-plastic-strategy-team-text [user-full-name country-name app-domain]
  (format "Dear %s,

You now have access to Plastic Strategy %s in the GPML Digital Platform.
It is now accessible through your workspace below
%s/workspace

- GlobalPlasticsHub" user-full-name country-name app-domain))

(defn notify-user-added-to-plastic-strategy-team [email-config user plastic-strategy]
  (let [sender unep-sender
        subject (notify-user-added-to-plastic-strategy-team-subject
                 (get-in plastic-strategy [:country :name]))
        user-full-name (get-user-full-name user)
        receivers [{:Name user-full-name
                    :Email (:email user)}]
        texts [(notify-user-added-to-plastic-strategy-team-text
                user-full-name
                (get-in plastic-strategy [:country :name])
                (:app-domain email-config))]
        htmls (mapv text->basic-html-email texts)]
    (send-email email-config sender subject receivers texts htmls)))

(comment
  ;; A real send against whatever relay the environment points at. Worth
  ;; running once per new relay: the TLS mode is the setting most likely
  ;; to be wrong, and it fails by hanging until the timeout rather than
  ;; by saying anything useful.
  (require 'dev)
  (let [db (dev/db-conn)
        config {:host (System/getenv "EMAIL_HOST")
                :port (parse-long (or (System/getenv "EMAIL_PORT") "587"))
                :user (System/getenv "EMAIL_HOST_USER")
                :pass (System/getenv "EMAIL_HOST_PASSWORD")
                :tls true
                :ssl false
                :timeout 10000
                :app-name (System/getenv "APP_NAME")
                :app-domain (System/getenv "APP_DOMAIN")}]
    (notify-admins-pending-approval db config {:type "stakeholder" :title "Mr" :first_name "Puneeth" :last_name "Chaganti"})))

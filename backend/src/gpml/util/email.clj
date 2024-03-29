(ns gpml.util.email
  (:require
   [clojure.string :as string]
   [gpml.boundary.port.chat :as port.chat]
   [gpml.db.stakeholder :as db.stakeholder]
   [gpml.handler.util :as h.util]
   [gpml.util :as util]
   [gpml.util.http-client :as http-client]
   [gpml.util.json :as json]
   [gpml.util.malli :refer [PresentString check!]]
   [gpml.util.result :refer [failure]]
   [pogonos.core :as pogonos]
   [taoensso.timbre :as timbre]))

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

(defn make-message [sender receiver subject text html]
  {:From sender
   :To [receiver]
   :Subject subject
   :TextPart text
   :HTMLPart html})

(defn get-user-full-name [{:keys [title first_name last_name]}]
  (if (nil? title)
    (format "%s %s" first_name last_name)
    (format "%s. %s %s" title first_name last_name)))

(defn send-email [{:keys [api-key secret-key logger]} sender subject receivers texts htmls]
  {:pre [logger
         (check! [:sequential {:min 1} PresentString]
                 texts

                 [:sequential {:min 1} PresentString]
                 htmls)]}
  (let [messages (mapv make-message (repeat sender) receivers (repeat subject) texts htmls)]
    (timbre/with-context+ {::messages messages}
      (http-client/request logger
                           {:method :post
                            :url "https://api.mailjet.com/v3.1/send"
                            :basic-auth [api-key secret-key]
                            :content-type :json
                            :body (json/->json {:Messages messages})}
                           {:max-retries 1}))))

;; FIXME: this shouldn't be hardcoded here. We'll be moving to
;; mailchimp soon so we'll refactor everything here.
(def unep-sender
  {:Name "UNEP GPML Digital Platform" :Email "no-reply@gpmarinelitter.org"})

(def notify-admins-pending-approval-text
  "Dear %s,

A new %s (%s) is awaiting your approval. Please visit %s/profile to approve or decline the request.

- UNEP GPML Digital Platform
")

(def notify-secretariat-new-subscription-text
  "Dear GPML Secretariat,

A new subscription request has arrived from %s.

- UNEP GPML Digital Platform
")

(defn new-resource-comment-text [resource-owner comment-author resource-title app-domain]
  (format "Dear %s,

%s commented on your resource %s. For more details visit your resource's detail page %s.

- UNEP GPML Digital Platform" resource-owner comment-author resource-title app-domain))

(defn notify-expert-invitation-text [first-name last-name invitation-id app-domain]
  (let [platform-link (str app-domain "/login?invite=" invitation-id)
        user-full-name (get-user-full-name {:first_name first-name :last_name last-name})]
    (format "Dear %s,

You have been invited to join the UNEP GPML Digital Platform as an expert.

Please, click on the link to accept the invitation: %s" user-full-name platform-link)))

(defn notify-reviewer-pending-review-text [reviewer-name app-domain topic-type topic-title]
  (format "Dear %s,

A new %s (%s) is awaiting your review. Please visit %s/profile to review the resource.

- UNEP GPML Digital Platform
" reviewer-name topic-type topic-title app-domain))

(defn notify-review-submitted-text [admin-name app-domain topic-type topic-title review-status review-comment]
  (format "Dear %s,

A review has been submitted for %s (%s).

Status: %s
Comment: %s

Please visit %s/profile to publish or reject the resource.

- UNEP GPML Digital Platform
" admin-name topic-type topic-title review-status review-comment app-domain))

(defn notify-user-review-approved-text [mailjet-config topic-type topic-item]
  (format "Dear user,

Your submission has been published to %s/%s/%s.

- UNEP GPML Digital Platform
"
          (:app-domain mailjet-config)
          (h.util/get-api-topic-type topic-type topic-item)
          (:id topic-item)))

(defn notify-user-review-rejected-text [mailjet-config topic-type topic-item]
  (format "Dear user,

Your submission (%s) has been rejected.

If you'd like to edit the submission and get the admins to review it
again, please visit this URL: %s/edit-%s/%s

- UNEP GPML Digital Platform
"
          (h.util/get-title topic-type topic-item)
          (:app-domain mailjet-config)
          (-> (h.util/get-api-topic-type topic-type topic-item)
              (string/replace "_" "-"))
          (:id topic-item)))

(defn notify-user-review-subject [mailjet-config review-status topic-type topic-item]
  (format "[%s] %s %s"
          (:app-name mailjet-config)
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

- UNEP GPML Digital Platform"
          user-name
          channel-name
          review-request-link))

(defn notify-user-about-chat-private-channel-invitation-request-accepted-text [channel-name base-url]
  (format "Your request to join %s channel on the GPML platform was approved.

View the forums in your GPML workspace:

%s/forum

- UNEP GPML Digital Platform"
          channel-name
          base-url))

(defn notify-user-invitation-text [inviter-name app-domain entity-name]
  (format "Dear user,

%s has invited you to join %s as part of entity %s. Please visit %s/stakeholder-signup and follow instructions to signup.

- UNEP GPML Digital Platform
" inviter-name app-domain entity-name app-domain))

(defn notify-user-invitation-subject [inviter-name]
  (format "%s has invited you to join UNEP GPML Digital Platform" inviter-name))

(defn new-resource-comment-subject [comment-author]
  (format "%s commented on your resource" comment-author))

(defn- notify-user-about-plastic-strategy-invitation-subject [app-name]
  (format "[%s] You have been invited to participate in a Plastic Strategy on GPML Platform" app-name))

(defn- notify-user-about-plastic-strategy-invitation-text [app-domain user-full-name country-name]
  (format "Dear %s,

You have been invited to participate in the Plastic Strategy for %s country.

To accept this invitation please visit %s and sign up to GPML Platform.

- UNEP GPML Digital Platform"
          user-full-name
          country-name
          app-domain))

(defn notify-admins-pending-approval [db mailjet-config new-item]
  (let [admins (db.stakeholder/get-admins db)
        item-type (:type new-item)
        item-title (if (= item-type "stakeholder")
                     (get-user-full-name new-item)
                     (or (:title new-item) (:name new-item) (:tag new-item)))
        subject (format "[%s] New %s needs approval" (:app-name mailjet-config) item-type)
        sender unep-sender
        names (mapv get-user-full-name admins)
        receivers (mapv #(assoc {} :Name %1 :Email (:email %2)) names admins)
        texts (mapv #(format notify-admins-pending-approval-text
                             %1 item-type item-title
                             (:app-domain mailjet-config))
                    names)
        htmls (mapv text->basic-html-email texts)]
    (when (-> receivers count pos?)
      (send-email mailjet-config sender subject receivers texts htmls))))

(defn notify-secretariat-about-new-subscription-req
  "Send email about a new subscription request."
  [mailjet-config dest-email req-email]
  (let [subject (format "[%s] New subscription request" (:app-name mailjet-config))
        sender unep-sender
        receivers [{:Name "GPML Secretariat"
                    :Email dest-email}]
        texts [(format notify-secretariat-new-subscription-text req-email)]
        htmls (mapv text->basic-html-email texts)]
    (send-email mailjet-config sender subject receivers texts htmls)))

(defn notify-about-new-contact
  "Send email about a new contact request."
  [mailjet-config {dest-email :dest-email
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
    (send-email mailjet-config sender subject receivers texts htmls)))

(defn notify-admins-new-chat-private-channel-invitation-request [mailjet-config admins user channel-id channel-name]
  (let [sender unep-sender
        subject (notify-private-channel-invitation-request-subject
                 (:app-name mailjet-config)
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
                                                                              (:app-domain mailjet-config)
                                                                              (:id user)
                                                                              (util/encode-url-param channel-id)
                                                                              (util/encode-url-param (:email user))
                                                                              (util/encode-url-param channel-name))))
                    receivers)
        htmls (mapv text->basic-html-email texts)]
    (if-not (-> receivers count pos?)
      (failure {:reason :no-admins})
      (let [{:keys [status body]} (send-email mailjet-config sender subject receivers texts htmls)]
        (if (and status (<= 200 status 299))
          {:success? true}
          (failure {:reason :failed-to-send-email
                    :error-details body
                    :status status}))))))

(defn notify-admins-new-channel-request [mailjet-config admins user new-channel]
  {:pre [(check! port.chat/NewChannel new-channel)]}
  (let [sender unep-sender
        subject (format "[%s] Request from %s to create a Chat Channel"
                        (:app-name mailjet-config)
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
      (let [{:keys [status body]} (send-email mailjet-config sender subject receivers texts htmls)]
        (if (and status (<= 200 status 299))
          {:success? true}
          (failure {:reason :failed-to-send-email
                    :error-details body
                    :status status}))))))

(defn notify-user-about-chat-private-channel-invitation-request-accepted [mailjet-config user channel-name]
  (let [sender unep-sender
        subject (notify-user-about-chat-private-channel-invitation-request-accepted-subject
                 (:app-name mailjet-config)
                 channel-name)
        receivers [{:Name (get-user-full-name user)
                    :Email (:email user)}]
        texts [(notify-user-about-chat-private-channel-invitation-request-accepted-text
                channel-name
                (:app-domain mailjet-config))]
        htmls (mapv text->basic-html-email texts)
        {:keys [status body]} (send-email mailjet-config sender subject receivers texts htmls)]
    (if (and status (<= 200 status 299))
      {:success? true}
      (failure {:reason :failed-to-send-email
                :error-details body
                :status status}))))

(defn notify-user-about-plastic-strategy-invitation [mailjet-config user plastic-strategy]
  (let [sender unep-sender
        subject (notify-user-about-plastic-strategy-invitation-subject (:app-name mailjet-config))
        user-full-name (get-user-full-name user)
        receivers [{:Name user-full-name
                    :Email (:email user)}]
        texts [(notify-user-about-plastic-strategy-invitation-text
                (:app-domain mailjet-config)
                user-full-name
                (get-in plastic-strategy [:country :name]))]
        htmls (mapv text->basic-html-email texts)
        {:keys [status body]} (send-email mailjet-config sender subject receivers texts htmls)]
    (if (and status (<= 200 status 299))
      {:success? true}
      (failure {:reason :failed-to-send-email
                :error-details body
                :status status}))))

(defn notify-user-added-to-plastic-strategy-team-subject [country-name]
  (format "You've been added to Plastic Strategy %s" country-name))

(defn notify-user-added-to-plastic-strategy-team-text [user-full-name country-name app-domain]
  (format "Dear %s,

You now have access to Plastic Strategy %s in the GPML Digital Platform.
It is now accessible through your workspace below
%s/workspace

- UNEP GPML Digital Platform" user-full-name country-name app-domain))

(defn notify-user-added-to-plastic-strategy-team [mailjet-config user plastic-strategy]
  (let [sender unep-sender
        subject (notify-user-added-to-plastic-strategy-team-subject
                 (get-in plastic-strategy [:country :name]))
        user-full-name (get-user-full-name user)
        receivers [{:Name user-full-name
                    :Email (:email user)}]
        texts [(notify-user-added-to-plastic-strategy-team-text
                user-full-name
                (get-in plastic-strategy [:country :name])
                (:app-domain mailjet-config))]
        htmls (mapv text->basic-html-email texts)
        {:keys [status body]}
        (send-email mailjet-config sender subject receivers texts htmls)]
    (if (and status (<= 200 status 299))
      {:success? true}
      (failure {:reason :failed-to-send-email
                :error-details body
                :status status}))))

(comment
  (require 'dev)
  (let [db (dev/db-conn)
        config {:api-key (System/getenv "MAILJET_API_KEY")
                :secret-key (System/getenv "MAILJET_SECRET_KEY")
                :app-name (System/getenv "APP_NAME")
                :app-domain (System/getenv "APP_DOMAIN")}]
    (notify-admins-pending-approval db config {:type "stakeholder" :title "Mr" :first_name "Puneeth" :last_name "Chaganti"})))

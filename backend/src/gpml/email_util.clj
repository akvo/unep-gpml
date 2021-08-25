(ns gpml.email-util
  (:require [clj-http.client :as client]
            [jsonista.core :as j]
            [gpml.db.stakeholder :as db.stakeholder]))

(defn make-message [sender receiver subject text html]
  {:From sender :To [receiver] :Subject subject :TextPart text :HTMLPart html})

(defn get-user-full-name [{:keys [title first_name last_name ]}]
  (if (nil? title)
    (format "%s %s" first_name last_name)
    (format "%s. %s %s" title first_name last_name)))

(defn send-email [{:keys [api-key secret-key]} sender subject receivers texts htmls]
  (let [messages (map make-message (repeat sender) receivers (repeat subject) texts htmls)]
    (client/post "https://api.mailjet.com/v3.1/send"
                 {:basic-auth [api-key secret-key]
                  :content-type :json
                  :throw-exceptions false
                  :body (j/write-value-as-string {:Messages messages})})))

(def unep-sender
  {:Name "UNEP GPML Digital Platform" :Email "no-reply@gpmarinelitter.org"})

(def notify-admins-pending-approval-text
  "Dear %s,

A new %s (%s) is awaiting your approval. Please visit %s/profile to approve or decline the request.

- UNEP GPML Digital Platform
")

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

(defn notify-user-invitation-text [inviter-name app-domain entity-name]
  (format "Dear user,

%s has invited you to join %s as part of entity %s. Please visit %s/stakeholder-signup and follow instructions to signup.

- UNEP GPML Digital Platform
" inviter-name app-domain entity-name app-domain))

(defn notify-user-invitation-subject [inviter-name]
  (format "%s has invited you to join UNEP GPML Digital Platform" inviter-name))

(defn notify-admins-pending-approval [db mailjet-config new-item]
  (let [admins (db.stakeholder/get-admins db)
        item-type (:type new-item)
        item-title (if (= item-type "stakeholder")
                     (get-user-full-name new-item)
                     (or (:title new-item) (:name new-item)))
        subject (format "[%s] New %s needs approval" (:app-name mailjet-config) item-type)
        sender unep-sender
        names (map get-user-full-name admins)
        receivers (map #(assoc {} :Name %1 :Email (:email %2)) names admins)
        texts (->> names (map #(format notify-admins-pending-approval-text
                                       %1 item-type item-title
                                       (:app-domain mailjet-config))))
        htmls (repeat nil)]
    (when (> (count receivers) 0)
      (send-email mailjet-config sender subject receivers texts htmls))))

(comment
  (require 'dev)
  (let [db (dev/db-conn)
        config {:api-key (System/getenv "MAILJET_API_KEY")
                :secret-key (System/getenv "MAILJET_SECRET_KEY")
                :app-name (System/getenv "APP_NAME")
                :app-domain (System/getenv "APP_DOMAIN")}]
    (notify-admins-pending-approval db config {:type "stakeholder" :title "Mr" :first_name "Puneeth" :last_name "Chaganti"}))
  )

(ns gpml.util.email
  (:require [clj-http.client :as client]
	    [clojure.string :as str]
	    [gpml.db.stakeholder :as db.stakeholder]
	    [gpml.handler.util :as util]
	    [jsonista.core :as j]))

(defn make-message [sender receiver subject text html]
  {:From sender :To [receiver] :Subject subject :TextPart text :HTMLPart html})

(defn get-user-full-name [{:keys [title first_name last_name]}]
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
	  (util/get-api-topic-type topic-type topic-item)
	  (:id topic-item)))

(defn notify-user-review-rejected-text [mailjet-config topic-type topic-item]
  (format "Dear user,

Your submission (%s) has been rejected.

If you'd like to edit the submission and get the admins to review it
again, please visit this URL: %s/edit-%s/%s

- UNEP GPML Digital Platform
"
	  (util/get-title topic-type topic-item)
	  (:app-domain mailjet-config)
	  (-> (util/get-api-topic-type topic-type topic-item)
	      (str/replace "_" "-"))
	  (:id topic-item)))

(defn notify-user-review-subject [mailjet-config review-status topic-type topic-item]
  (format "[%s] %s %s"
	  (:app-name mailjet-config)
	  (util/get-display-topic-type topic-type topic-item)
	  (str/lower-case review-status)))

(defn notify-private-channel-invitation-request-subject
  [app-name channel-name]
  (format "[%s] Invitation request for private channel %s" app-name channel-name))

(defn notify-private-channel-invitation-request-text
  [admin-name user-name user-email channel-name]
  (format "Dear %s

%s user with email %s, is requesting access to the private channel %s.

- UNEP GPML Digital Platform"
	  admin-name
	  user-name
	  user-email
	  channel-name))

(defn notify-user-invitation-text [inviter-name app-domain entity-name]
  (format "Dear user,

%s has invited you to join %s as part of entity %s. Please visit %s/stakeholder-signup and follow instructions to signup.

- UNEP GPML Digital Platform
" inviter-name app-domain entity-name app-domain))

(defn notify-user-invitation-subject [inviter-name]
  (format "%s has invited you to join UNEP GPML Digital Platform" inviter-name))

(defn new-resource-comment-subject [comment-author]
  (format "%s commented on your resource" comment-author))

(defn notify-admins-pending-approval [db mailjet-config new-item]
  (let [admins (db.stakeholder/get-admins db)
	item-type (:type new-item)
	item-title (if (= item-type "stakeholder")
		     (get-user-full-name new-item)
		     (or (:title new-item) (:name new-item) (:tag new-item)))
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

(defn notify-secretariat-about-new-subscription-req
  "Send email about a new subscription request
   The plural format for texts and receivers is because the sending shared email function expects a list of messages
   to be sent. That is why we provide an infinite sequence for non-used `htmls` option. Besides, we make `sender` and
   `texts` a collection of a single element, since in this case we are sending a single message."
  [mailjet-config dest-email req-email]
  (let [subject (format "[%s] New subscription request" (:app-name mailjet-config))
	sender unep-sender
	receivers [{:Name "GPML Secretariat"
		    :Email dest-email}]
	texts [(format notify-secretariat-new-subscription-text req-email)]
	htmls (repeat nil)]
    (send-email mailjet-config sender subject receivers texts htmls)))

(defn notify-about-new-contact
  "Send email about a new contact request
   The plural format for texts and receivers is because the sending shared email function expects a list of messages
   to be sent. That is why we provide an infinite sequence for non-used `htmls` option. Besides, we make `sender` and
   `texts` a collection of a single element, since in this case we are sending a single message."
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
	htmls (repeat nil)]
    (send-email mailjet-config sender subject receivers texts htmls)))

(defn notify-admins-new-chat-private-channel-invitation-request
  [mailjet-config admins user channel-name]
  (let [sender unep-sender
	subject (notify-private-channel-invitation-request-subject
		 (:app-name mailjet-config)
		 channel-name)
	receivers (map
		   (fn [admin] {:Name (get-user-full-name admin)
				:Email (:email admin)})
		   admins)
	texts (map (fn [receiver]
		     (notify-private-channel-invitation-request-text (:Name receiver)
								     (get-user-full-name user)
								     (:email user)
								     channel-name))
		   receivers)
	htmls (repeat nil)
	{:keys [status body]} (send-email mailjet-config sender subject receivers texts htmls)]
    (if (<= 200 status 299)
      {:success? true}
      {:success? false
       :reason :failed-to-send-email
       :error-details body})))

(comment
  (require 'dev)
  (let [db (dev/db-conn)
	config {:api-key (System/getenv "MAILJET_API_KEY")
		:secret-key (System/getenv "MAILJET_SECRET_KEY")
		:app-name (System/getenv "APP_NAME")
		:app-domain (System/getenv "APP_DOMAIN")}]
    (notify-admins-pending-approval db config {:type "stakeholder" :title "Mr" :first_name "Puneeth" :last_name "Chaganti"})))

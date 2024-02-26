(ns gpml.service.chat
  (:require
   [duct.logger :refer [log]]
   [gpml.boundary.adapter.chat.ds-chat :as ds-chat]
   [gpml.boundary.port.chat :as port.chat]
   [gpml.db.rbac-util :as db.rbac-util]
   [gpml.db.stakeholder :as db.sth]
   [gpml.service.file :as srv.file]
   [gpml.util.email :as util.email]
   [gpml.util.thread-transactions :as tht]))

(defn- set-stakeholder-chat-account-details [{:keys [db]} {:keys [chat-account-id user-id]}]
  {:pre [chat-account-id user-id]}
  (let [chat-account-status "active"
        affected (db.sth/update-stakeholder (:spec db)
                                            {:id user-id
                                             :chat_account_id chat-account-id
                                             :chat_account_status chat-account-status})]
    (if (= affected 1)
      {:success? true
       :stakeholder {:id user-id
                     :chat-account-id chat-account-id
                     :chat-account-status chat-account-status}}
      {:success? false
       :reason :failed-to-update-stakeholder})))

(defn create-user-account [{:keys [db chat-adapter logger] :as config} user-id]
  (let [transactions [{:txn-fn
                       (fn get-stakeholder
                         [{:keys [user-id] :as context}]
                         (let [search-opts {:filters {:ids [user-id]}}
                               result (db.sth/get-stakeholder (:spec db) search-opts)]
                           (if (:success? result)
                             (assoc context :stakeholder (:stakeholder result))
                             (if (= (:reason result) :not-found)
                               (do
                                 (log logger :info :user-not-found {:user-id user-id})
                                 (assoc context
                                        :success? false
                                        :reason :not-found))
                               (assoc context
                                      :success? false
                                      :reason (:reason result)
                                      :error-details (:error-details result))))))}
                      {:txn-fn
                       (fn create-chat-user-account
                         [{:keys [stakeholder] :as context}]
                         (let [{:keys [email id]} stakeholder
                               chat-user-id (ds-chat/make-unique-user-identifier)
                               result (port.chat/create-user-account (:chat-adapter config)
                                                                     ;; gpml.boundary.adapter.chat.ds-chat/NewUser
                                                                     {:uniqueUserIdentifier chat-user-id
                                                                      :externalUserId (str id)
                                                                      :isModerator false
                                                                      :email email
                                                                      :username email})]
                           (if (:success? result)
                             (assoc context
                                    :chat-user-account (:user result)
                                    :chat-user-id chat-user-id)
                             (assoc context
                                    :success? false
                                    :reason (:reason result)
                                    :error-details (:error-details result)))))
                       :rollback-fn
                       (fn rollback-create-chat-user-account
                         [{:keys [chat-user-account] :as context}]
                         (port.chat/delete-user-account chat-adapter (:id chat-user-account) {})
                         context)}
                      {:txn-fn
                       (fn update-stakeholder [{:keys [user-id chat-user-id] :as context}]
                         {:pre [user-id chat-user-id]}
                         (let [result (set-stakeholder-chat-account-details config
                                                                            {:chat-account-id chat-user-id
                                                                             :user-id user-id})]
                           (if (:success? result)
                             (assoc context :stakeholder (:stakeholder result))
                             (assoc context
                                    :success? false
                                    :reason (:reason result)
                                    :error-details (:error-details result)))))}]
        context {:success? true
                 :user-id user-id}]
    (tht/thread-transactions logger transactions context)))

(defn set-user-account-active-status [{:keys [db chat-adapter logger]} user active?]
  (let [transactions [{:txn-fn
                       (fn set-chat-user-account-active-stauts
                         [{:keys [user] :as context}]
                         (let [chat-account-id (:chat_account_id user)
                               result (port.chat/set-user-account-active-status chat-adapter
                                                                                chat-account-id
                                                                                active?
                                                                                {})]
                           (if (:success? result)
                             context
                             (assoc context
                                    :success? false
                                    :reason (:reason result)
                                    :error-details (:error-details result)))))
                       :rollback-fn
                       (fn rollback-set-chat-user-account-active-status
                         [{:keys [user] :as context}]
                         (port.chat/set-user-account-active-status chat-adapter
                                                                   (:chat_account_id user)
                                                                   (= (keyword (:chat_account_status user)) :active)
                                                                   {})
                         context)}
                      {:txn-fn
                       (fn update-stakeholder-chat-account-status
                         [{:keys [user] :as context}]
                         (let [affected (db.sth/update-stakeholder (:spec db)
                                                                   {:id (:id user)
                                                                    :chat_account_status active?})] ;; XXX check sql type
                           (if (= affected 1)
                             context
                             (assoc context
                                    :success? false
                                    :reason :failed-to-update-stakeholder-chat-account-status
                                    :error-details {:error-source :persistence
                                                    :error-cause :unexpected-number-of-affected-rows}))))}]
        context {:success? true
                 :user user}]
    (tht/thread-transactions logger transactions context)))

(defn- add-users-pictures-urls [config users]
  (map
   (fn [user]
     (if-not (seq (:picture_file user))
       user
       (let [{object-key :object_key visibility :visibility} (:picture_file user)
             result (srv.file/get-file-url config {:object-key object-key
                                                   :visibility (keyword visibility)})]
         (if (:success? result)
           (assoc user :picture (:url result))
           user))))
   users))

(defn get-channel-details [{:keys [db chat-adapter logger] :as config} channel-id]
  (let [transactions
        [{:txn-fn
          (fn tx-get-channel [context]
            (let [result (port.chat/get-all-channels chat-adapter {})]
              (if (:success? result)
                (assoc context :channel (first (:channels result)))
                (assoc context
                       :success? false
                       :reason :failed-to-get-channel
                       :error-details {:result result}))))}
         {:txn-fn
          (fn tx-get-channel-discussions [{:keys [channel] :as context}]
            (let [result (port.chat/get-channel-discussions chat-adapter (:id channel))]
              (if (:success? result)
                (assoc-in context [:channel :discussions] (:discussions result))
                (assoc context
                       :success? false
                       :reason :failed-to-get-channel-discussions
                       :error-details {:result result}))))}
         {:txn-fn
          (fn tx-get-channel-users [{:keys [channel] :as context}]
            (let [chat-accounts-ids (map :id (:users channel))
                  search-opts {:related-entities #{:organisation :picture-file}
                               :filters {:chat-accounts-ids chat-accounts-ids}}
                  result (try
                           {:success? true
                            :stakeholders (db.sth/get-stakeholders (:spec db)
                                                                   search-opts)}
                           (catch Exception t
                             {:success? false
                              :reason :exception
                              :error-details {:msg (ex-message t)}}))]
              (if (:success? result)
                (assoc-in context [:channel :users] (->> (:stakeholders result)
                                                         (add-users-pictures-urls config)))
                (assoc context
                       :success? false
                       :reason :failed-to-get-channel-users
                       :error-details {:result result}))))}]
        context {:success? true
                 :channel-id channel-id}]
    (tht/thread-transactions logger transactions context)))

(defn send-private-channel-invitation-request [{:keys [db mailjet-config]} user channel-id channel-name]
  (let [super-admins (db.rbac-util/get-super-admins-details (:spec db) {})]
    (util.email/notify-admins-new-chat-private-channel-invitation-request mailjet-config
                                                                          super-admins
                                                                          user
                                                                          channel-id
                                                                          channel-name)))

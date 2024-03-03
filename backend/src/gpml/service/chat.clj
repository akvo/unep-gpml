(ns gpml.service.chat
  (:require
   [duct.logger :refer [log]]
   [gpml.boundary.adapter.chat.ds-chat :as ds-chat]
   [gpml.boundary.port.chat :as port.chat]
   [gpml.db.rbac-util :as db.rbac-util]
   [gpml.db.stakeholder :as db.sth]
   [gpml.service.file :as srv.file]
   [gpml.util.email :as util.email]
   [gpml.util.malli :refer [check!]]
   [gpml.util.thread-transactions :as tht]))

(defn- select-successful-user-creation-keys
  "Exists to ensure type homogeinity across code branches"
  [m]
  {:post [(check! [:map {:closed true}
                   [:id any?]
                   [:chat-account-id any?]
                   [:chat-account-status any?]
                   [:chat-account-auth-token any?]]
                  %)]}
  (select-keys m [:id :chat-account-id :chat-account-status :chat-account-auth-token]))

(defn- set-stakeholder-chat-account-details [{:keys [db]} {:keys [chat-account-id user-id chat-account-auth-token]}]
  {:pre [chat-account-id user-id chat-account-auth-token]}
  (let [chat-account-status "active"
        affected (db.sth/update-stakeholder (:spec db)
                                            {:id user-id
                                             :chat_account_id chat-account-id
                                             :chat_account_status chat-account-status
                                             :chat_account_auth_token chat-account-auth-token})]
    (if (= affected 1)
      {:success? true
       :stakeholder (select-successful-user-creation-keys {:id user-id
                                                           :chat-account-auth-token chat-account-auth-token
                                                           :chat-account-id chat-account-id
                                                           :chat-account-status chat-account-status})}
      {:success? false
       :reason :failed-to-update-stakeholder})))

(defn create-user-account [{:keys [db chat-adapter logger] :as config} user-id]
  ;; XXX or failure-with, success-with sth + [:username :user-id :is-moderator :access-token]
  (let [transactions [{:txn-fn
                       (fn get-stakeholder [{:keys [user-id] :as context}]
                         (let [search-opts {:filters {:ids [user-id]}}
                               {:keys [stakeholder] :as result} (db.sth/get-stakeholder (:spec db) search-opts)]
                           (if (:success? result)
                             (assoc context
                                    :stakeholder stakeholder
                                    :no-updates-needed (and (-> stakeholder :chat-account-id some?)
                                                            (-> stakeholder :chat-account-auth-token some?)))
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
                       (fn create-chat-user-account [{:keys [stakeholder] :as context}]
                         (if (:chat-account-id stakeholder)
                           (do
                             (log logger :info :chat-account-already-exists {:chat-account-id (:chat-account-id stakeholder)})
                             (assoc context
                                    :chat-account-auth-token (:chat-account-auth-token stakeholder)
                                    :chat-account-id (:chat-account-id stakeholder)))
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
                                      :chat-account-auth-token (-> result :user :access-token (doto (assert :access-token)))
                                      :chat-account-id chat-user-id)
                               (assoc context
                                      :success? false
                                      :reason (:reason result)
                                      :error-details (:error-details result))))))
                       :rollback-fn
                       (fn rollback-create-chat-user-account [{:keys [chat-account-id] :as context}]
                         (port.chat/delete-user-account chat-adapter chat-account-id {})
                         context)}
                      {:txn-fn
                       (fn update-stakeholder [{:keys [user-id chat-account-id chat-account-auth-token] :as context}]
                         {:pre [user-id]}
                         (if (:no-updates-needed context)
                           (update context :stakeholder select-successful-user-creation-keys)
                           (let [result (set-stakeholder-chat-account-details config
                                                                              {:chat-account-id chat-account-id
                                                                               :chat-account-auth-token chat-account-auth-token
                                                                               :user-id user-id})]
                             (if (:success? result)
                               (assoc context :stakeholder (:stakeholder result))
                               (assoc context
                                      :success? false
                                      :reason (:reason result)
                                      :error-details (:error-details result))))))}]
        context {:success? true
                 :user-id user-id}]
    (tht/thread-transactions logger transactions context)))

(defn set-user-account-active-status [{:keys [db chat-adapter logger]} user active?]
  (let [transactions [{:txn-fn
                       (fn set-chat-user-account-active-stauts [{:keys [user] :as context}]
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
                       (fn rollback-set-chat-user-account-active-status [{:keys [user] :as context}]
                         (port.chat/set-user-account-active-status chat-adapter
                                                                   (:chat_account_id user)
                                                                   (= (keyword (:chat_account_status user)) :active)
                                                                   {})
                         context)}
                      {:txn-fn
                       (fn update-stakeholder-chat-account-status [{:keys [user] :as context}]
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
            (let [result (port.chat/get-channel chat-adapter channel-id)]
              (if (:success? result)
                (assoc context :channel (:channel result))
                (assoc context
                       :success? false
                       :reason :failed-to-get-channel
                       :error-details {:result result}))))}
         {:txn-fn
          (fn tx-get-channel-discussions [context]
            (let [result (port.chat/get-channel-discussions chat-adapter channel-id)]
              (if (:success? result)
                (assoc-in context [:channel :discussions] (:discussions result))
                (assoc context
                       :success? false
                       :reason :failed-to-get-channel-discussions
                       :error-details {:result result}))))}
         {:txn-fn
          (fn tx-get-channel-users [{:keys [channel] :as context}]
            (let [chat-accounts-ids (->> channel
                                         :members
                                         :data
                                         (mapv :unique-user-identifier))
                  search-opts {:related-entities #{:organisation :picture-file}
                               :filters {:chat-accounts-ids chat-accounts-ids}}
                  result (try
                           (if (seq chat-accounts-ids)
                             {:success? true
                              :stakeholders (db.sth/get-stakeholders (:spec db)
                                                                     ;; how do these work?
                                                                     ;; XXX should trigger --~(when (seq (get-in params [:filters :chat-accounts-ids])) " AND s.chat_account_id IN (:v*:filters.chat-accounts-ids)")
                                                                     search-opts)}
                             (do
                               (log logger :warn :empty-chat-accounts-ids)
                               {:success? true
                                :stakeholders []}))
                           (catch Exception t
                             (log logger :error :could-not-get-stakeholders t)
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

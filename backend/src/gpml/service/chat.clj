(ns gpml.service.chat
  (:require
   [duct.logger :refer [log]]
   [gpml.boundary.adapter.chat.ds-chat :as ds-chat]
   [gpml.boundary.port.chat :as port.chat]
   [gpml.db :as db]
   [gpml.db.rbac-util :as db.rbac-util]
   [gpml.db.stakeholder :as db.sth]
   [gpml.service.file :as srv.file]
   [gpml.util.email :as util.email]
   [gpml.util.malli :refer [check!]]
   [gpml.util.thread-transactions :as tht]
   [taoensso.timbre :as timbre]))

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
  (mapv (fn [user]
          (if-not (seq (:picture_file user))
            user
            (let [{object-key :object_key visibility :visibility} (:picture_file user)
                  result (srv.file/get-file-url config {:object-key object-key
                                                        :visibility (keyword visibility)})]
              (if (:success? result)
                (assoc user :picture (:url result))
                user))))
        users))

(defn find-users-by-chat-account-id [db chat-account-ids]
  (db.sth/get-stakeholders (:spec db)
                           {:related-entities #{:organisation :picture-file}
                            :filters {:chat-accounts-ids chat-account-ids}}))

(defn present-user [user]
  ;; Avoids returning sensitive data
  (-> user
      (select-keys [:role :tags :picture_file :first_name :picture_id :org :id :picture :organisation_role :last_name :country])))

(defn- tx-get-channel-users [{:keys [db hikari chat-adapter logger] :as config}
                             {:keys [channel] :as context}]
  {:pre [db hikari chat-adapter logger channel
         (check! [:map
                  [:id some?]]
                 channel)]}
  (let [;; Unused for now. Maybe we can use it to insert missing users due to plausible sync issues:
        _chat-account-ids-from-dsc (->> channel
                                        :members
                                        :data
                                        (mapv :unique-user-identifier))
        chat-account-ids-from-db (mapv :chat-account-id
                                       (:result (db/execute! hikari {:select :stakeholder.chat_account_id
                                                                     :from :stakeholder
                                                                     :join [:chat_channel_membership
                                                                            [:=
                                                                             :stakeholder.id
                                                                             :chat_channel_membership.stakeholder_id]]
                                                                     :where [:= :chat_channel_id (:id channel)]})))
        chat-account-ids chat-account-ids-from-db
        result (try
                 (if (seq chat-account-ids)
                   {:success? true
                    :stakeholders (find-users-by-chat-account-id db chat-account-ids)}
                   (do
                     (timbre/with-context+ {:channel channel}
                       (log logger :warn :empty-chat-account-ids))
                     {:success? true
                      :stakeholders []}))
                 (catch Exception t
                   (timbre/with-context+ {:chat-account-ids chat-account-ids}
                     (log logger :error :could-not-get-stakeholders t))
                   {:success? false
                    :reason :exception
                    :error-details {:msg (ex-message t)}}))]
    (-> (if (:success? result)
          (assoc-in context [:channel :users] (->> (:stakeholders result)
                                                   (add-users-pictures-urls config)
                                                   (mapv present-user)))
          (assoc context
                 :success? false
                 :reason :failed-to-get-channel-users
                 :error-details {:result result}))
        ;; No longer needed / can be confusing to include it:
        (update :channel dissoc :members))))

(defn get-channel-details [{:keys [db hikari chat-adapter logger] :as config} channel-id]
  {:pre [db hikari chat-adapter logger channel-id]}
  (let [transactions
        [(fn tx-get-channel [context]
           (let [result (port.chat/get-channel chat-adapter channel-id)]
             (if (:success? result)
               (assoc context :channel (:channel result))
               (assoc context
                      :success? false
                      :reason :failed-to-get-channel
                      :error-details {:result result}))))
         (fn tx-get-channel-discussions [context]
           (let [result (port.chat/get-channel-discussions chat-adapter channel-id)]
             (if (:success? result)
               (assoc-in context [:channel :discussions] (:discussions result))
               (assoc context
                      :success? false
                      :reason :failed-to-get-channel-discussions
                      :error-details {:result result}))))
         (partial tx-get-channel-users config)
         (fn enrich-messages-users [context]
           (try
             (update-in context [:channel :messages :messages] (fn [messages]
                                                                 (mapv (fn [{:keys [chat-account-id] :as message}]
                                                                         {:pre [chat-account-id]}
                                                                         (let [[user] (find-users-by-chat-account-id db [chat-account-id])]
                                                                           (-> message
                                                                               (dissoc :chat-account-id)
                                                                               (assoc :user (present-user user)))))
                                                                       messages)))
             (catch Exception t
               (log logger :error :could-not-get-stakeholders t)
               {:success? false
                :reason :exception
                :error-details {:msg (ex-message t)}})))]
        context {:success? true
                 :channel-id channel-id}]
    (tht/thread-transactions logger transactions context)))

(defn get-channels [{:keys [db hikari chat-adapter logger] :as config} channel-type]
  {:pre [db hikari chat-adapter logger
         (check! [:or
                  [:enum :public :private :all]
                  :string] ;; a :chat_account_id
                 channel-type)]}
  (let [transactions
        [(fn get-channels [context]
           (let [result (if (string? channel-type)
                          (port.chat/get-user-joined-channels chat-adapter channel-type)
                          (case channel-type
                            :all (port.chat/get-all-channels chat-adapter :_)
                            :public (port.chat/get-public-channels chat-adapter :_)
                            :private (port.chat/get-private-channels chat-adapter :_)))]
             (if (:success? result)
               (assoc context :channels (:channels result))
               (assoc context
                      :success? false
                      :reason :failed-to-get-channels
                      :error-details {:result result}))))
         (fn add-users [context]
           (try
             (update context :channels (fn [channels]
                                         (mapv (fn [{:keys [id] :as channel}]
                                                 {:pre [id]}
                                                 (let [{:keys [success? channel]} (tx-get-channel-users config {:channel channel})]
                                                   (if (false? success?)
                                                     (throw (ex-info "Abort" {}))
                                                     channel)))
                                               channels)))
             (catch Exception e
               (log logger :error :could-not-add-users e)
               {:success? false})))]
        context {:success? true}]
    (tht/thread-transactions logger transactions context)))

(comment
  (get-channels (dev/config-component) :all))

(defn send-private-channel-invitation-request [{:keys [db mailjet-config]} user channel-id channel-name]
  (let [super-admins (db.rbac-util/get-super-admins-details (:spec db) {})]
    (util.email/notify-admins-new-chat-private-channel-invitation-request mailjet-config
                                                                          super-admins
                                                                          user
                                                                          channel-id
                                                                          channel-name)))

(defn- assoc-private
  "Checks that the channel exists, and assocs `:private?` to the `context` if so."
  [{:keys [chat-adapter]}
   channel-id
   context]
  (let [{:keys [success?] :as result} (port.chat/get-channel chat-adapter channel-id)]
    (if-not success?
      result
      (assoc context :private? (-> result :channel
                                   (find :privacy)
                                   (doto (assert "`:privacy` should be in the `:channel object`"))
                                   val
                                   (= port.chat/private))))))

(defn join-channel [{:keys [db hikari chat-adapter logger] :as config}
                    channel-id
                    {user-id :id
                     unique-user-identifier :chat-channel-id
                     :as _user}]
  {:pre [db hikari chat-adapter logger user-id]}
  (let [transactions
        [(partial assoc-private config channel-id)

         (fn check-membership [context]
           (if (:exists (:result (db/execute-one! hikari {:select [[[:exists {:select :*
                                                                              :from :chat_channel_membership
                                                                              :where [:and
                                                                                      [:= :stakeholder_id user-id]
                                                                                      [:= :chat_channel_id channel-id]]}]]]})))
             {:success? false
              :reason   :user-already-belongs-to-channel}
             context))

         {:txn-fn (fn add-to-dsc [context]
                    (if-not (-> context
                                (find :private?)
                                (doto (assert "`:private?` should be in the context"))
                                val)
                      context
                      (if unique-user-identifier
                        (port.chat/add-user-to-private-channel chat-adapter unique-user-identifier channel-id)
                        {:success? false})))
          :rollback-fn (fn remove-from-dsc [context]
                         (if-not (-> context (find :private?) (doto (assert "`:private?` should be in the context")) val)
                           context
                           (if unique-user-identifier
                             (port.chat/remove-user-from-channel chat-adapter unique-user-identifier channel-id :_)
                             {:success? false})))}

         {:txn-fn (fn add-to-tables [_context]
                    (db/execute-one! hikari {:insert-into :chat_channel_membership
                                             :values [{:stakeholder_id user-id
                                                       :chat_channel_id channel-id}]}))
          :rollback-fn (fn remove-from-tables [_context]
                         (db/execute-one! hikari {:delete-from :chat_channel_membership
                                                  :where [:and
                                                          [:= :stakeholder_id user-id]
                                                          [:= :chat_channel_id channel-id]]}))}]
        context (create-user-account config user-id)]
    (tht/thread-transactions logger transactions context)))

(defn leave-channel [{:keys [db hikari chat-adapter logger] :as config}
                     channel-id
                     {user-id :id
                      unique-user-identifier :chat-channel-id
                      :as _user}]
  {:pre [db hikari chat-adapter logger user-id]}
  (let [transactions
        [(fn check-membership [_context]
           (if (:exists (:result (db/execute-one! hikari {:select [[[:exists {:select :*
                                                                              :from :chat_channel_membership
                                                                              :where [:and
                                                                                      [:= :stakeholder_id user-id]
                                                                                      [:= :chat_channel_id channel-id]]}]]]})))
             {:success? true}
             {:success? false
              :reason   :user-does-not-belong-to-channel}))

         {:txn-fn (fn remove-from-tables [_context]
                    (db/execute-one! hikari {:delete-from :chat_channel_membership
                                             :where [:and
                                                     [:= :stakeholder_id user-id]
                                                     [:= :chat_channel_id channel-id]]}))
          :rollback-fn (fn add-to-tables [_context]
                         (db/execute-one! hikari {:insert-into :chat_channel_membership
                                                  :values [{:stakeholder_id user-id
                                                            :chat_channel_id channel-id}]}))}

         (partial assoc-private config channel-id)

         {:txn-fn (fn remove-from-dsc [context]
                    (if-not (-> context (find :private?) (doto (assert "`:private?` should be in the context")) val)
                      context
                      (if unique-user-identifier
                        (port.chat/remove-user-from-channel chat-adapter unique-user-identifier channel-id :_)
                        {:success? false})))
          :rollback-fn (fn add-to-dsc [context]
                         (if-not (-> context (find :private?) (doto (assert "`:private?` should be in the context")) val)
                           context
                           (if unique-user-identifier
                             (port.chat/add-user-to-private-channel chat-adapter unique-user-identifier channel-id)
                             {:success? false})))}]
        context (create-user-account config user-id)]
    (tht/thread-transactions logger transactions context)))

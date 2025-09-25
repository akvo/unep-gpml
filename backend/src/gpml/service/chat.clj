(ns gpml.service.chat
  (:require
   [clojure.set :as set]
   [duct.logger :refer [log]]
   [gpml.boundary.adapter.chat.ds-chat :as ds-chat]
   [gpml.boundary.port.chat :as port.chat]
   [gpml.db :as db]
   [gpml.db.rbac-util :as db.rbac-util]
   [gpml.db.stakeholder :as db.sth]
   [gpml.service.file :as srv.file]
   [gpml.util.email :as util.email]
   [gpml.util.malli :refer [PresentString check! failure-with map->snake success-with]]
   [gpml.util.result :refer [failure]]
   [gpml.util.thread-transactions :refer [saga]]
   [taoensso.timbre :as timbre]))

(def CreatedUser
  [:map {:closed true}
   [:id any?]
   [:chat-account-id port.chat/UniqueUserIdentifier]
   [:chat-account-status any?]
   [:chat-account-auth-token any?]])

(def CreatedUserSnakeCase
  (map->snake CreatedUser))

(defn- select-successful-user-creation-keys
  "Exists to ensure type homogeinity across code branches"
  [m]
  {:post [(check! CreatedUser %)]}
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
      (failure {:reason :failed-to-update-stakeholder}))))

(defn create-user-account
  "Idempotent - also returns success if the stakeholder and/or chat account already existed."
  [{:keys [db chat-adapter logger] :as config} user-id]
  {:post [(check! [:or
                   (success-with :stakeholder CreatedUser)
                   (failure-with :reason any?)]
                  %)]}
  (saga logger {:success? true
                :user-id user-id}
    (fn get-stakeholder [{:keys [user-id] :as context}]
      (let [{:keys [stakeholder] :as result} (db.sth/get-stakeholder logger
                                                                     (:spec db)
                                                                     {:filters {:ids [user-id]}
                                                                      :related-entities #{:picture-file}})]
        (if (:success? result)
          (assoc context
                 :stakeholder stakeholder
                 :no-updates-needed (and (-> stakeholder :chat-account-id some?)
                                         (-> stakeholder :chat-account-auth-token some?)))
          (if (= (:reason result) :not-found)
            (do
              (log logger :info :user-not-found {:user-id user-id})
              (failure context
                       :reason :not-found))
            (failure context
                     :reason (:reason result)
                     :error-details (:error-details result))))))

    {:txn-fn
     (fn create-chat-user-account [{:keys [stakeholder] :as context}]
       (if (:chat-account-id stakeholder)
         (do
           (log logger :info :chat-account-already-exists {:chat-account-id (:chat-account-id stakeholder)})
           (assoc context
                  :chat-account-auth-token (:chat-account-auth-token stakeholder)
                  :chat-account-id (:chat-account-id stakeholder)))
         (let [{:keys [first-name last-name email picture-file id]} stakeholder
               chat-user-id (ds-chat/make-unique-user-identifier)
               username (or (some-> first-name not-empty (cond-> (seq last-name) (str " " last-name)))
                            email)
               {picture-url :url} (when picture-file
                                    (srv.file/get-file-url config picture-file))
               result (port.chat/create-user-account (:chat-adapter config)
                                                     ;; gpml.boundary.adapter.chat.ds-chat/NewUser
                                                     (cond-> {:uniqueUserIdentifier chat-user-id
                                                              :externalUserId (str id)
                                                              :isModerator false
                                                              :email email
                                                              :username username}
                                                       picture-url (assoc :profilePic picture-url)))]
           (if (:success? result)
             (assoc context
                    :chat-account-auth-token (-> result :user :access-token (doto (assert :access-token)))
                    :chat-account-id chat-user-id)
             (failure context
                      :reason (:reason result)
                      :error-details (:error-details result))))))
     :rollback-fn
     (fn rollback-create-chat-user-account [{:keys [chat-account-id]}]
       (port.chat/delete-user-account chat-adapter chat-account-id {}))}

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
            (failure context
                     :reason (:reason result)
                     :error-details (:error-details result))))))))

(defn set-user-account-active-status [{:keys [db chat-adapter logger]} user active?]
  (saga logger {:success? true
                :user user}
    (fn check_chat_account_id [context]
      (if (:chat_account_id user)
        context
        (failure context
                 :reason "User doesn't have a `:chat_account_id`.")))

    {:txn-fn
     (fn set-chat-user-account-active-status [{:keys [user] :as context}]
       (let [chat-account-id (:chat_account_id user)
             result (port.chat/set-user-account-active-status chat-adapter
                                                              chat-account-id
                                                              active?
                                                              {})]
         (if (:success? result)
           context
           (failure context
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
                                                  :chat_account_status (if active?
                                                                         "active"
                                                                         "inactive")})]
         (if (= affected 1)
           context
           (failure context
                    :reason :failed-to-update-stakeholder-chat-account-status
                    :error-details {:error-source :persistence
                                    :error-cause :unexpected-number-of-affected-rows}))))}))

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

;; Avoids returning sensitive data
(defn present-user [user]
  {:post [(check! port.chat/PresentedUser %)]}
  (-> user
      (select-keys [:picture_file :first_name :picture_id :org :id :picture :last_name :chat_user_id])
      (update :org select-keys [:name])))

(defn enrich-db-users-with-dsc-id [dsc-members db-users]
  (let [dsc-id-lookup (into {}
                            (map (juxt :unique-user-identifier :id) dsc-members))]
    (map
     (fn [db-user]
       (if-let [chat-user-id (get dsc-id-lookup (:chat_account_id db-user))]
         (assoc db-user :chat_user_id chat-user-id)
         db-user)) ; If no corresponding dsc user id is found, return the original user map
     db-users)))

(defn- tx-get-channel-users-in-db [{:keys [db hikari logger] :as config}
                                   {:keys [channel] :as context}]
  (let [chat-account-ids (mapv :chat-account-id
                               (:result (db/execute! hikari {:select :stakeholder.chat_account_id
                                                             :from :stakeholder
                                                             :join [:chat_channel_membership
                                                                    [:=
                                                                     :stakeholder.id
                                                                     :chat_channel_membership.stakeholder_id]]
                                                             :where [:= :chat_channel_id (:id channel)]})))
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
                   (failure {:reason :exception
                             :error-details {:msg (ex-message t)}})))]
    (-> (if (:success? result)
          (assoc-in context [:channel :users] (->> (:stakeholders result)
                                                   (add-users-pictures-urls config)
                                                   (mapv present-user)))
          (failure context
                   :reason :failed-to-get-channel-users
                   :error-details {:result result}))
        ;; No longer needed / can be confusing to include it:
        (update :channel dissoc :members :stakeholders))))

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
                   (failure {:reason :exception
                             :error-details {:msg (ex-message t)}})))]
    (-> (if (:success? result)
          (assoc-in context [:channel :users] (->> (:stakeholders result)
                                                   (enrich-db-users-with-dsc-id (get-in context [:channel :members :data]))
                                                   (filter :chat_user_id) ; Exclude users without chat_user_id
                                                   (add-users-pictures-urls config)
                                                   (mapv present-user)))
          (failure context
                   :reason :failed-to-get-channel-users
                   :error-details {:result result}))
        ;; No longer needed / can be confusing to include it:
        (update :channel dissoc :members :stakeholders))))

(defn get-channel-details [{:keys [db hikari chat-adapter logger] :as config} channel-id]
  {:pre [db hikari chat-adapter logger channel-id]}
  (saga logger {:success? true
                :channel-id channel-id}
    (fn tx-get-channel [context]
      (let [result (port.chat/get-channel chat-adapter channel-id false)]
        (if (:success? result)
          (assoc context :channel (:channel result))
          (failure context
                   :reason :failed-to-get-channel
                   :error-details {:result result}))))
    ;; Disable get channel discussions as it is not included in the response schema.
    ;; Reduce unnecessary API calls.
    ; (fn tx-get-channel-discussions [context]
    ;   (let [result (port.chat/get-channel-discussions chat-adapter channel-id)]
    ;     (if (:success? result)
    ;       (assoc-in context [:channel :discussions] (:discussions result))
    ;       (failure context
    ;                :reason :failed-to-get-channel-discussions
    ;                :error-details {:result result}))))
    (fn tx-get-channel-conversations [context]
      (let [result (port.chat/get-channel-conversations chat-adapter channel-id)]
        (if (:success? result)
          (assoc-in context [:channel :conversations] (:conversations result))
          (failure context
                   :reason :failed-to-get-channel-conversations
                   :error-details {:result result}))))
    (partial tx-get-channel-users config)
    (fn enrich-messages-users [context]
      (try
        (-> context
            (update-in [:channel :messages :messages] (fn [messages]
                                                        ;; We used to request a limit of "1",
                                                        ;; but other features made it request "20",
                                                        ;; so now we only take what's needed.
                                                        (vec (take 1 messages))))
            (update-in [:channel :messages :messages] (fn [messages]
                                                        (mapv (fn [{:keys [chat-account-id] :as message}]
                                                                {:pre [chat-account-id]}
                                                                (let [[user] (find-users-by-chat-account-id db [chat-account-id])]
                                                                  (-> message
                                                                      (dissoc :chat-account-id)
                                                                      (assoc :user (present-user user)))))
                                                              messages))))
        (catch Exception t
          (log logger :error :could-not-get-stakeholders t)
          (failure {:reason :exception
                    :error-details {:msg (ex-message t)}}))))))

(defn get-channels [{:keys [db hikari chat-adapter logger] :as config} channel-type]
  {:pre [db hikari chat-adapter logger
         (check! [:or
                  [:enum :public :private :all]
                  :string] ;; a :chat_account_id
                 channel-type)]}
  (saga logger {:success? true}

    (fn validate-channel-type [context]
      (if channel-type
        context
        (failure context :reason :user-has-no-chat-account)))

    (if (string? channel-type)
      (fn get-channels-for-user [context]
        (let [{sql-res :result sql-success? :success?}
              (db/execute! hikari {:select :chat_channel_membership.chat_channel_id
                                   :from :chat_channel_membership
                                   :join [:stakeholder
                                          [:=
                                           :stakeholder.id
                                           :chat_channel_membership.stakeholder_id]]
                                   :where [:= :stakeholder.chat_account_id channel-type]})

              extra-channel-ids (into #{} (map :chat-channel-id) sql-res)
              result (when sql-success?
                       (port.chat/get-user-joined-channels chat-adapter channel-type extra-channel-ids))]
          (if (:success? result)
            (assoc context :channels (into []
                                           ;; DSC can return more channels than those registered in our DB,
                                           ;; especially for public channels (DSC has no API concepts of joining a public channel,
                                           ;; and yet their API can return specific users has members of those).
                                           ;; Remove those:
                                           (filter (fn [{:keys [id] :as channel}]
                                                     {:pre [(check! port.chat/Channel channel
                                                                    some? id)]}
                                                     (contains? extra-channel-ids id)))
                                           (:channels result)))
            (failure context
                     :reason :failed-to-get-channels
                     :error-details {:result (if sql-success?
                                               result
                                               sql-res)}))))

      (fn get-channels-generic [context]
        (let [result
              (case channel-type
                :all (port.chat/get-all-channels chat-adapter :_)
                :public (port.chat/get-public-channels chat-adapter :_)
                :private (port.chat/get-private-channels chat-adapter :_)
                (throw (ex-info "get-channels-generic missing clause" {:channel-type channel-type})))]
          (if (:success? result)
            (assoc context :channels (:channels result))
            (failure context
                     :reason :failed-to-get-channels
                     :error-details {:result result})))))

    (fn add-plastic-strategies-ids [context]
      (let [{:keys [success?]
             ids :result
             :as result} (db/execute! hikari {:select :chat_channel_id
                                              :from :plastic_strategy
                                              :where [:not= :chat_channel_id nil]})]
        (if success?
          (assoc context :plastic-strategies-ids (into #{}
                                                       (map :chat-channel-id)
                                                       ids))
          result)))

    (fn remove-channels-associated-to-plastic-strategies [{:keys [plastic-strategies-ids]
                                                           :as context}]
      {:pre [(check! set? plastic-strategies-ids)]}
      (update context :channels (fn [channels]
                                  (into []
                                        (remove (fn [{:keys [id] :as channel}]
                                                  {:pre [(check! some? id
                                                                 port.chat/Channel channel)]}
                                                  (contains? plastic-strategies-ids id)))
                                        channels))))

    (fn add-users [context]
      (try
        (update context :channels (fn [channels]
                                    (mapv (fn [{:keys [id] :as channel}]
                                            {:pre [id]}
                                            (let [{:keys [success? channel]} (tx-get-channel-users-in-db config {:channel channel})]
                                              (if (false? success?)
                                                (throw (ex-info "Abort" {}))
                                                channel)))
                                          channels)))
        (catch Exception e
          (log logger :error :could-not-add-users e)
          (failure {:reason :could-not-add-users}))))))

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
  (let [{:keys [success?] :as result} (port.chat/get-channel chat-adapter channel-id false)]
    (if-not success?
      result
      (assoc context :private? (-> result :channel
                                   (find :privacy)
                                   (doto (assert "`:privacy` should be in the `:channel` object"))
                                   val
                                   (= port.chat/private))))))

(def HasChatAccountId [:map [:chat_account_id some?]])

(defn user-belongs-to-channel? [hikari user-id channel-id]
  (:exists (:result (db/execute-one! hikari {:select [[[:exists {:select :*
                                                                 :from :chat_channel_membership
                                                                 :where [:and
                                                                         [:= :stakeholder_id user-id]
                                                                         [:= :chat_channel_id channel-id]]}]]]}))))

(defn join-channel [{:keys [db hikari chat-adapter logger] :as config}
                    channel-id
                    {user-id :id
                     :as _user}]
  {:pre [db hikari chat-adapter logger channel-id user-id]}
  (saga logger (create-user-account config user-id)
    (partial assoc-private config channel-id)

    (fn check-membership [context]
      (if-not (user-belongs-to-channel? hikari user-id channel-id)
        context
        (do
          (log logger :info :user-already-belongs-to-channel {:user-id user-id
                                                              :channel-id channel-id})
          (failure {:reason :user-already-belongs-to-channel}))))

    ;; NOTE: we grab the unique-user-identifier from :stakeholder, not from the `user` arg,
    ;; since the it's the `create-user-account` call that may have created the `:chat-account-id`
    {:txn-fn (fn add-to-dsc [{{unique-user-identifier :chat-account-id} :stakeholder
                              :as context}]
               {:pre [unique-user-identifier]}
               (if-not (-> context
                           (find :private?)
                           (doto (assert "`:private?` should be in the context"))
                           val)
                 context
                 (if unique-user-identifier
                   (port.chat/add-user-to-private-channel chat-adapter unique-user-identifier channel-id)
                   (failure {:reason :user-does-not-have-chat-account-id}))))
     :rollback-fn (fn remove-from-dsc [{{unique-user-identifier :chat-account-id} :stakeholder
                                        :as context}]
                    {:pre [unique-user-identifier]}
                    (if-not (-> context (find :private?) (doto (assert "`:private?` should be in the context")) val)
                      context
                      (if unique-user-identifier
                        (port.chat/remove-user-from-channel chat-adapter unique-user-identifier channel-id :_)
                        (failure {:reason :user-does-not-have-chat-account-id}))))}

    {:txn-fn (fn add-to-tables [_context]
               (db/execute-one! hikari {:insert-into :chat_channel_membership
                                        :values [{:stakeholder_id user-id
                                                  :chat_channel_id channel-id}]}))
     :rollback-fn (fn remove-from-tables [_context]
                    (db/execute-one! hikari {:delete-from :chat_channel_membership
                                             :where [:and
                                                     [:= :stakeholder_id user-id]
                                                     [:= :chat_channel_id channel-id]]}))}))

(defn leave-channel [{:keys [db hikari chat-adapter logger] :as config}
                     channel-id
                     {user-id :id
                      unique-user-identifier :chat_account_id
                      :as user}]
  {:pre [db hikari chat-adapter logger channel-id user-id
         (check! HasChatAccountId user)
         unique-user-identifier]}
  (saga logger {}
    (fn check-membership [_context]
      (if (:exists (:result (db/execute-one! hikari {:select [[[:exists {:select :*
                                                                         :from :chat_channel_membership
                                                                         :where [:and
                                                                                 [:= :stakeholder_id user-id]
                                                                                 [:= :chat_channel_id channel-id]]}]]]})))
        {:success? true}
        (failure {:reason :user-does-not-belong-to-channel})))

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
                   (failure {:reason :could-not-remove-user-from-dsc}))))
     :rollback-fn (fn add-to-dsc [context]
                    (if-not (-> context (find :private?) (doto (assert "`:private?` should be in the context")) val)
                      context
                      (if unique-user-identifier
                        (port.chat/add-user-to-private-channel chat-adapter unique-user-identifier channel-id)
                        (failure {:reason :could-not-add-user-back-to-dsc}))))}))

(defn delete-channel [{:keys [hikari chat-adapter logger]}
                      channel-id]
  {:pre [hikari chat-adapter logger channel-id]
   :post [(check! [:or
                   (success-with)
                   (failure-with)]
                  %)]}
  (saga logger {}
    (fn remove-from-tables [_context]
      (db/execute-one! hikari {:delete-from :chat_channel_membership
                               :where [:= :chat_channel_id channel-id]}))

    (fn remove-from-dsc [_context]
      (port.chat/delete-public-channel chat-adapter channel-id))

    (constantly {:success? true})))

(def PinnedLinkType
  [:enum "video" "pdf" "calendar" "doc" "form" "other"])

(def NewPinnedLink
  [:map
   {:closed true}
   [:title PresentString]
   [:url PresentString]
   [:type PinnedLinkType]])

(def PinnedLink
  (into NewPinnedLink
        [[:id :int]
         [:created-by-stakeholder-id :int]
         [:updated-by-stakeholder-id [:maybe :int]]
         [:chat-channel-id PresentString]]))

(def EnhancedUserId
  [:or
   :int
   [:enum :admin]])

(defn can-bypass-authorization? [as-admin? private?]
  {:pre [(check! :boolean as-admin?
                 :boolean private?)]}
  (or as-admin?
      (false? private?)))

(defn get-pinned-links [{:keys [hikari chat-adapter logger] :as config}
                        channel-id
                        user-id]
  {:pre [hikari chat-adapter logger channel-id
         (check! EnhancedUserId user-id)]
   :post [(check! [:or
                   (success-with :pinned-links [:sequential PinnedLink])
                   (failure-with :reason any?)]
                  %)]}
  (saga logger {:success? true
                :as-admin? (= :admin user-id)}

    (partial assoc-private config channel-id)

    (fn get-pinned-link-with-authorization [{:keys [as-admin?
                                                    private?]
                                             :as context}]

      (let [bypass-authorization? (can-bypass-authorization? as-admin? private?)
            {:keys [success?]
             pinned-links :result
             :as result} (db/execute! hikari (cond-> {:select :chat_channel_pinned_link.*
                                                      :from :chat_channel_pinned_link
                                                      :where (cond-> [:and
                                                                      [:= :chat_channel_pinned_link.chat_channel_id channel-id]]
                                                               (not bypass-authorization?)
                                                               (conj [:= :chat_channel_membership.stakeholder_id user-id]))}
                                               (not bypass-authorization?)
                                               (assoc :join [:chat_channel_membership
                                                             [:=
                                                              :chat_channel_membership.chat_channel_id
                                                              :chat_channel_pinned_link.chat_channel_id]])))]
        (if-not success?
          result
          (assoc context :pinned-links pinned-links))))))

(defn get-discussions [{:keys [hikari chat-adapter logger] :as config}
                       channel-id
                       user-id]
  {:pre [hikari chat-adapter logger channel-id
         (check! EnhancedUserId user-id)]
   :post [(check! [:or
                   (success-with :discussions [:sequential port.chat/Discussion])
                   (failure-with :reason any?)]
                  %)]}
  (saga logger {:success? true
                :as-admin? (= :admin user-id)}

    (partial assoc-private config channel-id)

    (fn maybe-authorize [{:keys [as-admin?
                                 private?]
                          :as context}]
      (cond
        (can-bypass-authorization? as-admin? private?)
        context

        (user-belongs-to-channel? hikari user-id channel-id)
        context

        :else
        (failure context
                 :reason :user-does-not-belong-to-channel)))

    (fn add-discussions [context]
      (let [{:keys [success? discussions]
             :as result} (port.chat/get-channel-discussions chat-adapter channel-id)]
        (if-not success?
          result
          (assoc context :discussions discussions))))))

(defn create-pinned-link [{:keys [hikari chat-adapter logger] :as config}
                          channel-id
                          creator-id
                          new-pinned-link]
  {:pre [hikari chat-adapter logger channel-id creator-id
         (check! NewPinnedLink new-pinned-link)]
   :post [(check! [:or
                   (success-with :pinned-link PinnedLink)
                   (failure-with :reason any?)]
                  %)]}
  (saga logger {:success? true}
    (partial assoc-private config channel-id) ;; check that the channel exists

    (fn create-chat-channel-pinned-link [_context]
      (db/execute-one! hikari {:insert-into :chat_channel_pinned_link
                               :values [(merge {:created_by_stakeholder_id creator-id
                                                :chat_channel_id channel-id}
                                               new-pinned-link)]
                               :returning [:*]}))

    (fn present-pinned-link [context]
      (set/rename-keys context {:result :pinned-link}))))

(defn update-pinned-link [{:keys [hikari chat-adapter logger]}
                          channel-id
                          pinned-link-id
                          updater-id
                          pinned-link-updates]
  {:pre [hikari chat-adapter logger channel-id updater-id
         (check! NewPinnedLink pinned-link-updates)]
   :post [(check! [:or
                   (success-with :pinned-link PinnedLink)
                   (failure-with :reason any?)]
                  %)]}
  (saga logger {:success? true}
    (fn check-record-exists [context]
      (if (:exists (:result (db/execute-one! hikari {:select [[[:exists {:select :*
                                                                         :from :chat_channel_pinned_link
                                                                         :where [:and
                                                                                 [:= :id pinned-link-id]
                                                                                 [:= :chat_channel_id channel-id]]}]]]})))
        context
        (failure {:reason :pinned-link-not-found})))

    (fn update-chat-channel-pinned-link [_context]
      (db/execute-one! hikari {:update :chat_channel_pinned_link
                               :set (merge {:updated_by_stakeholder_id updater-id}
                                           pinned-link-updates)
                               :where [:= :chat_channel_id channel-id]
                               :returning [:*]}))

    (fn present-pinned-link [context]
      (set/rename-keys context {:result :pinned-link}))))

(defn delete-pinned-link [{:keys [hikari chat-adapter logger]}
                          channel-id
                          pinned-link-id
                          admin-id]
  {:pre [hikari chat-adapter logger channel-id admin-id]
   :post [(check! [:or
                   (success-with)
                   (failure-with :reason any?)]
                  %)]}
  (log logger :info :deleting-pinned-link {:channel-id channel-id
                                           :pinned-link-id pinned-link-id
                                           :admin-id admin-id})
  (let [{:keys [success?]
         {affected :next.jdbc/update-count} :result
         :as result} (db/execute-one! hikari {:delete-from :chat_channel_pinned_link
                                              :where [:and
                                                      [:= :id pinned-link-id]
                                                      [:= :chat_channel_id channel-id]]})]
    (cond
      (not success?)
      result

      (zero? affected)
      (failure {:reason :pinned-link-not-found})

      :else
      result)))

(defn request-channel-creation [{:keys [db mailjet-config]} user new-channel]
  {:post [(check! [:or
                   (success-with)
                   (failure-with :reason any?)]
                  %)]}
  (let [super-admins (db.rbac-util/get-super-admins-details (:spec db) {})]
    (util.email/notify-admins-new-channel-request mailjet-config
                                                  super-admins
                                                  user
                                                  new-channel)))

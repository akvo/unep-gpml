(ns gpml.handler.chat
  (:require
   [camel-snake-kebab.core :refer [->snake_case]]
   [camel-snake-kebab.extras :as cske]
   [gpml.boundary.port.chat :as port.chat]
   [gpml.db.stakeholder :as db.stakeholder]
   [gpml.handler.resource.permission :as h.r.permission]
   [gpml.handler.responses :as r]
   [gpml.service.chat :as svc.chat]
   [gpml.util.email :as email]
   [gpml.util.http-client :as http-client]
   [gpml.util.json :as json]
   [gpml.util.malli :refer [failure-with map->snake success-with]]
   [integrant.core :as ig]
   [malli.util :as mu]))

(defn- present-error [result]
  (select-keys result [:error-details :user-id :success? :reason]))

(defn- create-user-account [config {:keys [user] :as _req}]
  (let [result (svc.chat/create-user-account config (:id user))]
    (if (:success? result)
      (r/ok (cske/transform-keys ->snake_case (select-keys result [:success? :stakeholder])))
      (-> result present-error r/server-error))))

(defn- set-user-account-active-status [config {:keys [user parameters]}]
  (let [chat-account-status (-> parameters :body :active)
        result (svc.chat/set-user-account-active-status config user chat-account-status)]
    (if (:success? result)
      (r/ok (select-keys result [:success?]))
      (-> result present-error r/server-error))))

(defn- get-user-joined-channels [config {{:keys [chat_account_id]} :user}]
  {:pre [chat_account_id]}
  (let [result (svc.chat/get-channels config chat_account_id)]
    (if (:success? result)
      (r/ok (cske/transform-keys ->snake_case (select-keys result [:success? :channels])))
      (-> result present-error r/server-error))))

(defn- get-private-channels [config _req]
  ;; NOTE: no particular authorization required (business requirement)
  (let [result (svc.chat/get-channels config :private)]
    (if (:success? result)
      (r/ok (cske/transform-keys ->snake_case (select-keys result [:success? :channels])))
      (-> result present-error r/server-error))))

(defn- get-public-channels [config _req]
  ;; NOTE: no particular authorization required (business requirement)
  (let [result (svc.chat/get-channels config :public)]
    (if (:success? result)
      (r/ok (cske/transform-keys ->snake_case (select-keys result [:success? :channels])))
      (-> result present-error r/server-error))))

(defn- send-private-channel-invitation-request [config {:keys [user parameters]}]
  (if-not (h.r.permission/operation-allowed?
           config
           {:user-id (:id user)
            :entity-type :application
            :custom-permission :send-private-chat-channel-invitation-request
            :root-context? true})
    (r/forbidden {:message "Unauthorized"})
    (let [channel-name (get-in parameters [:body :channel_name])
          channel-id (get-in parameters [:body :channel_id])
          result (svc.chat/send-private-channel-invitation-request config
                                                                   user
                                                                   channel-id
                                                                   channel-name)]
      (if (:success? result)
        (r/ok (select-keys result [:success?]))
        (-> result present-error r/server-error)))))

(defn- leave-channel [config {:keys [user parameters]}]
  (let [{:keys [channel_id]} (:body parameters)
        result (svc.chat/leave-channel config channel_id user)]
    (if (:success? result)
      (r/ok (select-keys result [:success?]))
      (-> result present-error r/server-error))))

(defn- add-user-to-private-channel [{:keys [db mailjet-config] :as config} parameters]
  (let [{:keys [channel_id channel_name user_id]} (:body parameters)
        target-user (db.stakeholder/get-stakeholder-by-id (:spec db) {:id user_id})]
    (if-not (seq target-user)
      (r/server-error {:success? false
                       :reason :user-not-found})
      (let [result (svc.chat/join-channel config channel_id target-user)]
        (if (:success? result)
          (do
            (email/notify-user-about-chat-private-channel-invitation-request-accepted mailjet-config
                                                                                      target-user
                                                                                      channel_name)
            (r/ok (select-keys result [:success?])))
          (-> result present-error r/server-error))))))

(defmethod ig/init-key :gpml.handler.chat/dcs-user-routes
  [_ {:keys [middleware config]}]
  {:pre [(vector? middleware)
         (seq config)]}
  ["/user"
   ["/account"
    {:post {:summary    "Create a chat user account"
            :middleware middleware
            :swagger    {:tags ["chat"]}
            :handler    (fn do-create-user-account [req]
                          (create-user-account config req))
            :responses  {200 {:body (success-with :stakeholder svc.chat/CreatedUserSnakeCase)}
                         500 {:body (failure-with)}}}
     :put  {:summary    "Update chat user account status"
            :middleware middleware
            :swagger    {:tags ["chat"]}
            :handler    (fn do-set-user-account-active-status [req]
                          (set-user-account-active-status config req))
            :parameters {:body [:map
                                [:active
                                 {:optional false}
                                 boolean?]]}
            :responses {200 {:body (success-with)}
                        500 {:body (failure-with :reason any?)}}}}]
   ["/channel"
    {:get {:summary    "Get all user joined channels"
           :middleware middleware
           :swagger    {:tags ["chat"]}
           :handler    (fn do-get-user-joined-channels [req]
                         (get-user-joined-channels config req))
           :responses {200 {:body (success-with :channels [:sequential port.chat/ChannelWithUsersSnakeCase])}
                       500 {:body (failure-with :reason any?)}}}}]])

(def ChannelIdPath {:path [:map
                           [:id
                            {:swagger {:description "The channel ID."
                                       :type "string"
                                       :allowEmptyValue false}}
                            [:string {:min 1}]]]})

(def ChannelIdPathAlt {:path [:map
                              [:channel_id
                               {:swagger {:description "The channel ID."
                                          :type "string"
                                          :allowEmptyValue false}}
                               [:string {:min 1}]]]})

(def UserIdPath {:path [:map
                        [:user-id
                         {:swagger {:description "The user ID."
                                    :type "integer"}}
                         [:int]]]})

(def PinnedLinkIdPath {:path [:map
                              [:pinned-link-id
                               {:swagger {:description "The Pinned Link ID."
                                          :type "integer"}}
                               [:int]]]})

(def DiscussionIdPath {:path [:map
                              [:discussion_id
                               {:swagger {:description "The discussion ID."
                                          :type "string"
                                          :allowEmptyValue false}}
                               [:string {:min 1}]]]})

(defmethod ig/init-key :gpml.handler.chat/dcs-channel-routes
  [_ {:keys [middleware]
      {:keys [logger hikari chat-adapter] :as config} :config}]
  {:pre [(vector? middleware)
         (seq config)
         hikari
         logger]}
  ["/channel"
   ["/request-new"
    {:post {:summary    "Creates a request for a channel to be created by admins."
            :middleware middleware
            :swagger    {:tags ["chat"]}
            :handler    (fn [{:keys [user]
                              {new-channel :body} :parameters}]
                          {:pre [user new-channel]}
                          (let [result (svc.chat/request-channel-creation config user new-channel)]
                            (if (:success? result)
                              (r/ok (select-keys result [:success?]))
                              (-> result present-error r/server-error))))
            :parameters {:body (map->snake port.chat/NewChannel)}
            :responses {200 {:body (success-with)}
                        500 {:body (failure-with :reason any?)}}}}]
   ["/delete-discussion/{id}/discussion/{discussion_id}"
    {:delete {:summary    "Deletes the given discussion. Requires admin permissions."
              :middleware middleware
              :swagger    {:tags ["chat"]}
              :handler    (fn [{{:keys [id]} :user
                                {{channel-id    :id
                                  discussion-id :discussion_id} :path} :parameters}]
                            {:pre [id channel-id discussion-id]}
                            (if (h.r.permission/super-admin? config id)
                              (let [result (port.chat/delete-channel-discussion chat-adapter channel-id discussion-id)]
                                (if (:success? result)
                                  (r/ok (select-keys result [:success?]))
                                  (-> result present-error r/server-error)))
                              (r/forbidden {:message "Unauthorized"})))
              :parameters {:path (mu/merge (:path DiscussionIdPath) (:path ChannelIdPath))}
              :responses {200 {:body (success-with)}
                          500 {:body (failure-with)}}}}]

   ["/create-discussion/{id}"
    {:post {:summary    "Creates a discussion within this channel. Requires admin permissions."
            :middleware middleware
            :swagger    {:tags ["chat"]}
            :handler    (fn [{{:keys [id]} :user
                              {{discussion-name :name} :body
                               {channel-id      :id}   :path} :parameters}]
                          {:pre [id channel-id]}
                          (if (h.r.permission/super-admin? config id)
                            (let [result (port.chat/create-channel-discussion chat-adapter channel-id {:name discussion-name})]
                              (if (:success? result)
                                (r/ok (update result :discussion #(cske/transform-keys ->snake_case %)))
                                (-> result present-error r/server-error)))
                            (r/forbidden {:message "Unauthorized"})))
            :parameters (assoc ChannelIdPath
                               :body [:map
                                      [:name :string]])
            :responses {200 {:body (success-with :discussion port.chat/DiscussionSnakeCase)}
                        500 {:body (failure-with)}}}}]
   ["/leave"
    {:post {:summary    "Remove the callee user from the channel"
            :middleware middleware
            :swagger    {:tags ["chat"]}
            :handler    (fn do-leave-channel [req]
                          (leave-channel config req))
            :parameters {:body [:map
                                [:channel_id
                                 {:swagger {:type "string"
                                            :allowEmptyValue false}}
                                 [:string {:min 1}]]]}
            :responses {200 {:body (success-with)}
                        500 {:body (failure-with :reason any?)}}}}]
   ["/all"
    {:get {:summary    "Get all channels in the server"
           :swagger    {:tags ["chat"]}
           :handler    (fn do-get-all-channels [_req]
                         ;; NOTE: no particular authorization required (business requirement)
                         (let [result (svc.chat/get-channels config :all)]
                           (if (:success? result)
                             (r/ok (cske/transform-keys ->snake_case (select-keys result [:success? :channels])))
                             (-> result present-error r/server-error))))
           :responses {200 {:body (success-with :channels [:sequential port.chat/ChannelWithUsersSnakeCase])}
                       500 {:body (failure-with)}}}}]
   ["/discussions/{channel_id}"
    {:get {:summary    "Get a channel's discussions. The user must be able to view the channel in order to access this endpoint."
           :middleware middleware
           :swagger    {:tags ["chat"] :security [{:id_token []}]}
           :handler    (fn [{{{channel-id :channel_id}   :path} :parameters
                             {user-id :id} :user}]
                         {:pre [channel-id user-id]}
                         (let [enhanced-user-id (if (h.r.permission/super-admin? config user-id)
                                                  :admin
                                                  user-id)
                               result (svc.chat/get-discussions config channel-id enhanced-user-id)]
                           (if (:success? result)
                             (r/ok (select-keys (cske/transform-keys ->snake_case result)
                                                [:success? :discussions]))
                             (-> result present-error r/server-error))))
           :parameters ChannelIdPathAlt
           :responses {200 {:body (success-with :discussions [:sequential port.chat/DiscussionSnakeCase])}
                       500 {:body (failure-with :reason any?)}}}}]
   ["/pinned-link/{channel_id}"
    {:get {:summary    "Get a channel's pinned links. The user must be able to view the channel in order to access this endpoint."
           :middleware middleware
           :swagger    {:tags ["chat"] :security [{:id_token []}]}
           :handler    (fn [{{{channel-id :channel_id}   :path} :parameters
                             {user-id :id} :user}]
                         {:pre [channel-id user-id]}
                         (let [enhanced-user-id (if (h.r.permission/super-admin? config user-id)
                                                  :admin
                                                  user-id)
                               result (svc.chat/get-pinned-links config channel-id enhanced-user-id)]
                           (if (:success? result)
                             (r/ok (select-keys (cske/transform-keys ->snake_case result)
                                                [:success? :pinned_links]))
                             (-> result present-error r/server-error))))
           :parameters ChannelIdPathAlt
           :responses {200 {:body (success-with :pinned_links [:sequential (map->snake svc.chat/PinnedLink)])}
                       500 {:body (failure-with :reason any?)}}}}]
   ["/details"
    ["/{id}"
     {:get {:summary    "Get extended channel info, including members and the last few messages."
            :middleware middleware
            :swagger    {:tags ["chat"] :security [{:id_token []}]}
            :handler    (fn get-channel-details [{{:keys [path]} :parameters
                                                  {user-id :id} :user}]
                          (let [result (svc.chat/get-channel-details config (:id path))]
                            (if (:success? result)
                              (let [allowed? (or (-> result :channel (find :privacy) (doto (assert "Should contain `:privacy` field")) val (= port.chat/public))
                                                 (some (fn [{other-id :id :as other-user}]
                                                         {:pre [(contains? other-user :id)]}
                                                         (= other-id
                                                            user-id))
                                                       (-> result :channel (find :users) (doto (assert ":users entry not found")) val))
                                                 (h.r.permission/super-admin? config user-id))]
                                (if-not allowed?
                                  (r/forbidden {:message "Unauthorized"})
                                  (r/ok (cske/transform-keys ->snake_case result))))
                              (-> result present-error r/server-error))))
            :parameters ChannelIdPath
            :responses {200 {:body (success-with :channel port.chat/ExtendedChannelSnakeCase)}
                        500 {:body (failure-with)}}}}]]
   ["/private"
    [""
     {:get  {:summary    "Get all private channels in the server"
             :middleware middleware
             :swagger    {:tags ["chat"]}
             :handler    (fn do-get-private-channels [req]
                           (get-private-channels config req))
             :responses {200 {:body (success-with :channels [:sequential port.chat/ChannelWithUsersSnakeCase])}
                         500 {:body (failure-with)}}}
      :post {:summary    "Send private channel invitation request"
             :middleware middleware
             :swagger    {:tags ["chat"]}
             :handler    (fn do-send-private-channel-invitation-request [req]
                           (send-private-channel-invitation-request config req))
             :parameters {:body [:map
                                 [:channel_id
                                  {:optional false
                                   :swagger {:description "The channel id"
                                             :type "string"
                                             :allowEmptyValue false}}
                                  [:string {:min 1}]]
                                 [:channel_name
                                  {:optional false
                                   :swagger {:description "The channel name"
                                             :type "string"
                                             :allowEmptyValue false}}
                                  [:string {:min 1}]]]}
             :responses {200 {:body (success-with)}
                         500 {:body (failure-with)}}}}]
    ["/add-user"
     {:post {:summary    "Allows admins to add another user to a private channel."
             :middleware middleware
             :swagger    {:tags ["chat"]}
             :handler    (fn do-add-user-to-private-channel [{parameters :parameters user :user}]
                           (if-not (h.r.permission/super-admin? config (:id user))
                             (r/forbidden {:message "Unauthorized"})
                             (add-user-to-private-channel config parameters)))
             :parameters {:body [:map
                                 [:channel_id
                                  {:optional false
                                   :swagger {:type "string"
                                             :allowEmptyValue false}}
                                  [:string {:min 1}]]
                                 [:channel_name
                                  {:optional false
                                   :swagger {:type "string"
                                             :allowEmptyValue false}}
                                  [:string {:min 1}]]
                                 [:user_id
                                  {:optional false
                                   :swagger {:description "The user's identifier in GPML"
                                             :type "integer"
                                             :allowEmptyValue false}}
                                  [:fn
                                   {:error/message "Not a valid user identifier. It should be a positive integer."}
                                   pos-int?]]]}
             :responses {200 {:body (success-with)}
                         500 {:body (failure-with :reason any?)}}}}]]
   ["/public"
    {:get {:summary    "Get all public channels in the server"
           :middleware middleware
           :swagger    {:tags ["chat"]}
           :handler    (fn do-get-public-channels [req]
                         (get-public-channels config req))
           :responses {200 {:body (success-with :channels [:sequential port.chat/ChannelWithUsersSnakeCase])}
                       500 {:body (failure-with)}}}
     :post {:summary    "Joins this public channel. Implicitly creates a chat account for the user,
so you don't need to call the POST /api/chat/user/account endpoint beforehand."
            :middleware middleware
            :swagger    {:tags ["chat"]}
            :handler    (fn [{{{channel-id :channel_id} :body} :parameters
                              :keys [user]}]
                          {:pre [user channel-id]}
                          (let [result (svc.chat/join-channel config channel-id user)]
                            (if (:success? result)
                              (r/ok (select-keys result [:success?]))
                              (-> result present-error r/server-error))))
            :parameters {:body [:map
                                [:channel_id
                                 {:optional false
                                  :swagger {:description "The channel id"
                                            :type "string"
                                            :allowEmptyValue false}}
                                 [:string {:min 1}]]]}
            :responses {200 {:body (success-with)}
                        500 {:body (failure-with :reason any?)}}}}]])

(defmethod ig/init-key :gpml.handler.chat/channel-admin-routes
  [_ {:keys [middleware]
      {:keys [logger hikari chat-adapter db] :as config} :config}]
  {:pre [(vector? middleware)
         (seq config)
         hikari
         db
         logger]}
  (let [tags ["chat" "admin"]]
    ["/admin"
     ["/channel"
      {:post {:summary    "Creates a channel. Requires admin permissions."
              :middleware middleware
              :swagger    {:tags tags}
              :handler    (fn [{{{:keys [privacy] :as channel} :body} :parameters}]
                            {:pre [channel privacy]}
                            (let [result (condp = privacy
                                           port.chat/public  (port.chat/create-public-channel chat-adapter channel)
                                           port.chat/private (port.chat/create-private-channel chat-adapter channel))]
                              (if (:success? result)
                                (r/ok (update result :channel #(cske/transform-keys ->snake_case %)))
                                (-> result present-error r/server-error))))
              :parameters {:body port.chat/NewChannel}
              :responses {200 {:body (success-with :channel port.chat/CreatedChannelSnakeCase)}
                          500 {:body (failure-with)}}}}]
     ["/channel/{id}/add-user/{user-id}"
      {:post {:summary    "Adds a user to a channel, ensuring idempotently that the user has a chat account. Requires admin permissions."
              :middleware middleware
              :swagger    {:tags tags}
              :handler    (fn [{{{channel-id :id
                                  user-id :user-id} :path} :parameters}]
                            {:pre [channel-id user-id]}
                            (let [target-user (db.stakeholder/get-stakeholder-by-id (:spec db) {:id user-id})]
                              (if-not (seq target-user)
                                (r/server-error {:success? false
                                                 :reason :user-not-found})
                                (let [result (svc.chat/join-channel config channel-id target-user)]
                                  (if (:success? result)
                                    (r/ok (select-keys result [:success?]))
                                    (-> result present-error r/server-error))))))
              :parameters {:path (mu/merge (:path ChannelIdPath) (:path UserIdPath))}
              :responses {200 {:body (success-with)}
                          500 {:body (failure-with :reason any?)}}}}]
     ["/channel/{id}/pinned-link"
      {:post {:summary    "Creates a pinned link within this channel. Requires admin permissions."
              :middleware middleware
              :swagger    {:tags tags}
              :handler    (fn [{{:keys [id]} :user
                                {new-pinned-link :body
                                 {channel-id      :id}   :path} :parameters
                                {admin-id :id} :user}]
                            {:pre [id channel-id admin-id]}
                            (let [result (svc.chat/create-pinned-link config channel-id admin-id new-pinned-link)]
                              (if (:success? result)
                                (r/ok (select-keys (cske/transform-keys ->snake_case result)
                                                   [:success? :pinned_link]))
                                (-> result present-error r/server-error))))
              :parameters (assoc ChannelIdPath
                                 :body (map->snake svc.chat/NewPinnedLink))
              :responses {200 {:body (success-with :pinned_link (map->snake svc.chat/PinnedLink))}
                          500 {:body (failure-with :reason any?)}}}}]
     ["/channel/{id}/pinned-link/{pinned-link-id}"
      {:delete {:summary    "Deletes a pinned link within this channel. Requires admin permissions."
                :middleware middleware
                :swagger    {:tags tags}
                :handler    (fn [{{:keys [id]} :user
                                  {{pinned-link-id :pinned-link-id
                                    channel-id      :id}   :path} :parameters
                                  {admin-id :id} :user}]
                              {:pre [id channel-id pinned-link-id admin-id]}
                              (let [result (svc.chat/delete-pinned-link config channel-id pinned-link-id admin-id)]
                                (if (:success? result)
                                  (r/ok (select-keys result [:success?]))
                                  (-> result present-error r/server-error))))
                :parameters {:path (mu/merge (:path PinnedLinkIdPath) (:path ChannelIdPath))}
                :responses {200 {:body (success-with)}
                            500 {:body (failure-with :reason any?)}}}
       :put {:summary    "Updates a pinned link within this channel. Requires admin permissions."
             :middleware middleware
             :swagger    {:tags tags}
             :handler    (fn [{{:keys [id]} :user
                               {pinned-link-updates :body
                                {pinned-link-id :pinned-link-id
                                 channel-id      :id}   :path} :parameters
                               {admin-id :id} :user}]
                           {:pre [id channel-id pinned-link-id admin-id]}
                           (let [result (svc.chat/update-pinned-link config channel-id pinned-link-id admin-id pinned-link-updates)]
                             (if (:success? result)
                               (r/ok (select-keys (cske/transform-keys ->snake_case result)
                                                  [:success? :pinned_link]))
                               (-> result present-error r/server-error))))
             :parameters {:path (mu/merge (:path PinnedLinkIdPath) (:path ChannelIdPath))
                          :body (map->snake svc.chat/NewPinnedLink)}
             :responses {200 {:body (success-with :pinned_link (map->snake svc.chat/PinnedLink))}
                         500 {:body (failure-with :reason any?)}}}}]
     ["/channel/{id}"
      {:put {:summary    "Performs an update over a channel. Requires admin permissions."
             :middleware middleware
             :swagger    {:tags tags}
             :handler    (fn [{{{channel-id :id} :path
                                edits :body} :parameters}]
                           {:pre [channel-id]}
                           (let [result (port.chat/set-public-channel-custom-fields chat-adapter channel-id edits)]
                             (if (:success? result)
                               (r/ok (select-keys result [:success?]))
                               (-> result present-error r/server-error))))
             :parameters (assoc ChannelIdPath
                                :body port.chat/ChannelEdit)
             :responses {200 {:body (success-with)}
                         500 {:body (failure-with)}}}
       :delete {:summary    "Deletes a channel. Requires admin permissions."
                :middleware middleware
                :swagger    {:tags tags}
                :handler    (fn [{{{channel-id :id} :path} :parameters}]
                              {:pre [channel-id]}
                              (let [result (svc.chat/delete-channel config channel-id)]
                                (if (:success? result)
                                  (r/ok (select-keys result [:success?]))
                                  (-> result present-error r/server-error))))
                :parameters ChannelIdPath
                :responses {200 {:body (success-with)}
                            500 {:body (failure-with :reason any?)}}}}]]))

(comment
  (dev/make-user! "abc@abc.net")

  @(def random-user (dev/make-user! (format "a%s@abc.net" (random-uuid))))

  (gpml.db.stakeholder/stakeholder-by-email (dev/conn) {:email "abc@abc.net"})

  (http-client/request (dev/logger)
                       {:url "http://localhost:3000/api/chat/user/account"
                        :method :post
                        :as :json-keyword-keys})

  (for [active [false true]]
    (http-client/request (dev/logger)
                         {:method :put
                          :url "http://localhost:3000/api/chat/user/account"
                          :body (json/->json {:active active})
                          :as :json-keyword-keys}))

  @(def country-id (-> (dev/q {:select [:country.id]
                               :from :country
                               :full-join [:plastic-strategy [:= :country.id :plastic-strategy.country_id]]
                               :where [:and
                                       [:= :plastic-strategy.country_id nil]
                                       [:not= :country.iso_code_a2 nil]]
                               :limit 1})
                       first
                       :country/id))

  @(def country-a2 (-> (dev/q {:select :*
                               :from :country
                               :where [:= :id country-id]
                               :limit 1})
                       first
                       :country/iso_code_a2))

  ;; create PSs so that a public chat will be created:
  @(def channel (http-client/request (dev/logger)
                                     {:url "http://localhost:3000/api/programmatic/plastic-strategy"
                                      :method :post
                                      :body (json/->json [{:country_id country-id
                                                           :chat_channel_name (str "ps " (random-uuid))}])
                                      :content-type :json
                                      :as :json-keyword-keys}))

  @(def channel-id (-> channel :body :channels first :id))

  (let [f (fn []
            (http-client/request (dev/logger)
                                 {:url (str "http://localhost:3000/api/plastic-strategy/" country-a2 "/ensure-chat")
                                  :method :post
                                  :content-type :json
                                  :as :json-keyword-keys}))]
    [f
     (dev/q {:update :plastic_strategy
             :set {:chat_channel_id nil}
             :where [:= :country_id country-id]})
     f])

  (http-client/request (dev/logger)
                       {:url "http://localhost:3000/api/chat/channel/private/add-user"
                        :method :post
                        :body (json/->json {:channel_name (random-uuid)
                                            :channel_id channel-id
                                            :user_id (:id random-user)})
                        :as :json-keyword-keys})

  (http-client/request (dev/logger)
                       {:method :post
                        :url (str "http://localhost:3000/api/chat/channel/public")
                        :body (json/->json {:channel_id channel-id})
                        :content-type :json
                        :as :json-keyword-keys})

  @(def discussion (http-client/request (dev/logger)
                                        {:url (str "http://localhost:3000/api/chat/channel/create-discussion/" channel-id)
                                         :method :post
                                         :body (json/->json {:name (str (random-uuid))})
                                         :content-type :json
                                         :as :json-keyword-keys}))

  @(def discussion-id (-> discussion :body :discussion :id))

  (http-client/request (dev/logger)
                       {:url (str "http://localhost:3000/api/chat/channel/discussions/" channel-id)
                        :as :json-keyword-keys})

  (http-client/request (dev/logger)
                       {:url (str "http://localhost:3000/api/chat/channel/delete-discussion/" channel-id "/discussion/" discussion-id)
                        :method :delete
                        :content-type :json
                        :as :json-keyword-keys})

  (let [cid (:chat_account_id (gpml.db.stakeholder/stakeholder-by-email (dev/conn) {:email "abc@abc.net"}))]
    (println (format "https://deadsimplechat.com/%s?uniqueUserIdentifier=%s" channel-id cid)))

  ;; should include the user that joined with the earlier http://localhost:3000/api/chat/channel/public call
  (http-client/request (dev/logger)
                       {:url (str "http://localhost:3000/api/chat/channel/details/" channel-id)
                        :as :json-keyword-keys})

  (http-client/request (dev/logger)
                       {:url "http://localhost:3000/api/chat/channel/all"
                        :as :json-keyword-keys})

  (http-client/request (dev/logger)
                       {:url "http://localhost:3000/api/chat/channel/public"
                        :as :json-keyword-keys})

  (http-client/request (dev/logger)
                       {:url "http://localhost:3000/api/chat/channel/private"
                        :as :json-keyword-keys})

  (http-client/request (dev/logger)
                       {:url "http://localhost:3000/api/chat/user/channel"
                        :as :json-keyword-keys})

  (http-client/request (dev/logger)
                       {:url "http://localhost:3000/api/chat/channel/leave"
                        :method :post
                        :body (json/->json {:channel_id channel-id})
                        :as :json-keyword-keys})

  (http-client/request (dev/logger)
                       {:url "http://localhost:3000/api/chat/user/channel"
                        :as :json-keyword-keys})

  @(def admin-channels (for [p ["public" "private"]]
                         (http-client/request (dev/logger)
                                              {:url (str "http://localhost:3000/api/chat/admin/channel")
                                               :method :post
                                               :body (json/->json {:name (random-uuid)
                                                                   :description (random-uuid)
                                                                   :privacy p})
                                               :content-type :json
                                               :as :json-keyword-keys})))

  (for [{{{id :id} :channel} :body} admin-channels
        :let [_ (http-client/request (dev/logger)
                                     {:method :post
                                      :url (str "http://localhost:3000/api/chat/channel/public")
                                      :body (json/->json {:channel_id id})
                                      :content-type :json
                                      :as :json-keyword-keys})
              {random-user-id :id} (dev/make-user! (format "a%s@abc.net" (random-uuid)))
              {{{pinned-link-id :id} :pinned_link
                :as plr} :body} (http-client/request (dev/logger)
                                                     {:method :post
                                                      :url  (str "http://localhost:3000/api/chat/admin/channel/" id "/pinned-link")
                                                      :body (json/->json (malli.generator/generate svc.chat/NewPinnedLink))
                                                      :content-type :json
                                                      :as :json-keyword-keys})]]
    [plr
     (when pinned-link-id
       (http-client/request (dev/logger)
                            {:method :put
                             :url (str "http://localhost:3000/api/chat/admin/channel/" id "/pinned-link/" pinned-link-id)
                             :body (json/->json (malli.generator/generate svc.chat/NewPinnedLink))
                             :content-type :json
                             :as :json-keyword-keys}))
     (when pinned-link-id
       {:pinned-links (http-client/request (dev/logger)
                                           {:method :get
                                            :url (str "http://localhost:3000/api/chat/channel/pinned-link/" id)
                                            :content-type :json
                                            :as :json-keyword-keys})})
     (when pinned-link-id
       {:delete-pinned-link (http-client/request (dev/logger)
                                                 {:method :delete
                                                  :url (str "http://localhost:3000/api/chat/admin/channel/" id "/pinned-link/" pinned-link-id)
                                                  :content-type :json
                                                  :as :json-keyword-keys})})
     (when pinned-link-id
       ;; should now say :pinned-link-not-found
       {:delete-pinned-link-again (http-client/request (dev/logger)
                                                       {:method :delete
                                                        :url (str "http://localhost:3000/api/chat/admin/channel/" id "/pinned-link/" pinned-link-id)
                                                        :content-type :json
                                                        :as :json-keyword-keys})})
     (http-client/request (dev/logger)
                          {:method :post
                           :url (str "http://localhost:3000/api/chat/admin/channel/" id "/add-user/" random-user-id)
                           :content-type :json
                           :as :json-keyword-keys})
     (http-client/request (dev/logger)
                          {:method :put
                           :url (str "http://localhost:3000/api/chat/admin/channel/" id)
                           :body (json/->json {:name (random-uuid)
                                               :description (random-uuid)})
                           :content-type :json
                           :as :json-keyword-keys})
     (http-client/request (dev/logger)
                          {:method :delete
                           :url (str "http://localhost:3000/api/chat/admin/channel/" id)
                           :content-type :json
                           :as :json-keyword-keys})])

  (http-client/request (dev/logger)
                       {:method :post
                        :url "http://localhost:3000/api/chat/channel/private"
                        :as :json-keyword-keys
                        :body (json/->json {:channel_id "123"
                                            :channel_name "123"})})

  (http-client/request (dev/logger)
                       {:method :post
                        :url "http://localhost:3000/api/chat/channel/request-new"
                        :body (json/->json (malli.generator/generate port.chat/NewChannel))
                        :as :json-keyword-keys}))

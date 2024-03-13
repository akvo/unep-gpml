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
   [gpml.util.malli :refer [failure-with success-with]]
   [integrant.core :as ig]
   [malli.util :as mu]))

(defn- present-error [result]
  (select-keys result [:error-details :user-id :success? :reason]))

(defn- create-user-account [config {:keys [user] :as _req}]
  (let [result (svc.chat/create-user-account config (:id user))]
    (if (:success? result)
      (r/ok (cske/transform-keys ->snake_case (:stakeholder result)))
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
    (if (seq target-user)
      (let [result (port.chat/add-user-to-private-channel (:chat-adapter config)
                                                          (:chat_account_id target-user)
                                                          channel_id)]
        (if (:success? result)
          (do
            (email/notify-user-about-chat-private-channel-invitation-request-accepted mailjet-config
                                                                                      target-user
                                                                                      channel_name)
            (r/ok (select-keys result [:success?])))
          (-> result present-error r/server-error)))
      (r/server-error {:success? false
                       :reason :user-not-found}))))

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
            :responses  {200 {:body any?}
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
                       500 {:body (failure-with)}}}}]])

(def ChannelIdPath {:path [:map
                           [:id
                            {:swagger {:description "The channel ID."
                                       :type "string"
                                       :allowEmptyValue false}}
                            [:string {:min 1}]]]})

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
                        500 {:body (failure-with)}}}}]
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
                           (if (h.r.permission/super-admin? config (:id user))
                             (add-user-to-private-channel config parameters)
                             (r/forbidden {:message "Unauthorized"})))
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
                         500 {:body (failure-with)}}}}]]
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
      {:keys [logger hikari chat-adapter] :as config} :config}]
  {:pre [(vector? middleware)
         (seq config)
         hikari
         logger]}
  ["/admin"
   ["/channel"
    {:post {:summary    "Creates a channel. Requires admin permissions."
            :middleware middleware
            :swagger    {:tags ["chat"]}
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
   ["/channel/{id}"
    {:put {:summary    "Performs an update over a channel. Requires admin permissions."
           :middleware middleware
           :swagger    {:tags ["chat"]}
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
              :swagger    {:tags ["chat"]}
              :handler    (fn [{{{channel-id :id} :path} :parameters}]
                            {:pre [channel-id]}
                            (let [result (svc.chat/delete-channel config channel-id)]
                              (if (:success? result)
                                (r/ok (select-keys result [:success?]))
                                (-> result present-error r/server-error))))
              :parameters ChannelIdPath
              :responses {200 {:body (success-with)}
                          500 {:body (failure-with :reason any?)}}}}]])

(comment
  (dev/make-user! "abc@abc.net")
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

  ;; create PSs so that a public chat will be created:
  @(def channel (http-client/request (dev/logger)
                                     {:url "http://localhost:3000/api/programmatic/plastic-strategy"
                                      :method :post
                                      :body (json/->json [{:country_id (-> (dev/q {:select [:country.id]
                                                                                   :from :country
                                                                                   :full-join [:plastic-strategy [:= :country.id :plastic-strategy.country_id]]
                                                                                   :where [:= :plastic-strategy.country_id nil]
                                                                                   :limit 1})
                                                                           first
                                                                           :country/id)
                                                           :chat_channel_name (str "ps " (random-uuid))}])
                                      :content-type :json
                                      :as :json-keyword-keys}))

  @(def channel-id (-> channel :body :channels first :id))

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

  (for [{{{id :id} :channel} :body} admin-channels]
    [(http-client/request (dev/logger)
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
                           :as :json-keyword-keys})]))

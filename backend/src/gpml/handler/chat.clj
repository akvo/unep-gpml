(ns gpml.handler.chat
  (:require
   [camel-snake-kebab.core :refer [->snake_case]]
   [camel-snake-kebab.extras :as cske]
   [gpml.boundary.adapter.chat.ds-chat :as ds-chat]
   [gpml.boundary.port.chat :as port.chat]
   [gpml.db.stakeholder :as db.stakeholder]
   [gpml.handler.resource.permission :as h.r.permission]
   [gpml.handler.responses :as r]
   [gpml.service.chat :as srv.chat]
   [gpml.util.email :as email]
   [gpml.util.http-client :as http-client]
   [gpml.util.json :as json]
   [gpml.util.malli :refer [failure-with success-with]]
   [integrant.core :as ig]))

(defn- create-user-account [config {:keys [user] :as _req}]
  (let [result (srv.chat/create-user-account config (:id user))]
    (if (:success? result)
      (r/ok (cske/transform-keys ->snake_case (:stakeholder result)))
      ;; XXX same select-keys elsewhere:
      (r/server-error (select-keys result [:error-details :user-id :success?])))))

(defn- set-user-account-active-status [config {:keys [user parameters]}]
  (let [chat-account-status (-> parameters :body :chat_account_status)
        result (srv.chat/set-user-account-active-status config user chat-account-status)]
    (if (:success? result)
      (r/ok {})
      (r/server-error result))))

(defn- get-user-joined-channels [config {:keys [user]}]
  (let [result (port.chat/get-user-joined-channels (:chat-adapter config) (:chat_account_id user))]
    (if (:success? result)
      (r/ok (cske/transform-keys ->snake_case result))
      (r/server-error result))))

(defn- get-private-channels [config {:keys [user]}]
  (if-not (h.r.permission/operation-allowed? config
                                             {:user-id (:id user)
                                              :entity-type :application
                                              :custom-permission :list-chat-private-channels
                                              :root-context? true})
    (r/forbidden {:message "Unauthorized"})
    (let [result (port.chat/get-private-channels (:chat-adapter config) {})]
      (if (:success? result)
        (r/ok result)
        (r/server-error result)))))

(defn- get-public-channels [config {:keys [user]}]
  (if-not (h.r.permission/operation-allowed?
           config
           {:user-id (:id user)
            :entity-type :application
            :custom-permission :list-chat-public-channels
            :root-context? true})
    (r/forbidden {:message "Unauthorized"})
    (let [result (port.chat/get-public-channels (:chat-adapter config) {})]
      (if (:success? result)
        (r/ok result)
        (r/server-error result)))))

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
          result (srv.chat/send-private-channel-invitation-request config
                                                                   user
                                                                   channel-id
                                                                   channel-name)]
      (if (:success? result)
        (r/ok result)
        (r/server-error result)))))

(defn- remove-user-from-channel [config {:keys [user parameters]}]
  (let [{:keys [channel_id]} (:body parameters)
        result (port.chat/remove-user-from-channel (:chat-adapter config)
                                                   (:chat_account_id user)
                                                   channel_id
                                                   {})]
    (if (:success? result)
      (r/ok result)
      (r/server-error result))))

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
            (r/ok result))
          (r/server-error result)))
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
            :responses  {:200 {:body any?}
                         :500 {:body (failure-with)}}}
     :put  {:summary    "Update chat user account status"
            :middleware middleware
            :swagger    {:tags ["chat"]}
            :handler    (fn do-set-user-account-active-status [req]
                          (set-user-account-active-status config req))
            :parameters {:body [:map
                                [:active
                                 {:optional false}
                                 boolean?]]}
            :responses {:200 {:body any?}
                        :500 {:body any?}}}}]
   ["/channel"
    {:get {:summary    "Get all user joined channels"
           :middleware middleware
           :swagger    {:tags ["chat"]}
           :handler    (fn do-get-user-joined-channels [req]
                         (get-user-joined-channels config req))
           :responses {:200 {:body (success-with :channels [:sequential ds-chat/Channel])}
                       :500 {:body (failure-with)}}}}]])

(defmethod ig/init-key :gpml.handler.chat/dcs-channel-routes
  [_ {:keys [middleware]
      {:keys [logger] :as config} :config}]
  {:pre [(vector? middleware)
         (seq config)
         logger]}
  ["/channel"
   ["/leave"
    {:post {:summary    "Remove the callee user from the channel"
            :middleware middleware
            :swagger    {:tags ["chat"]}
            :handler    (fn do-remove-user-from-channel [req]
                          (remove-user-from-channel config req))
            :parameters {:body [:map
                                [:channel_id
                                 {:swagger {:type "string"
                                            :allowEmptyValue false}}
                                 [:string {:min 1}]]]}
            :responses {:200 {:body (success-with)}
                        :500 {:body (failure-with)}}}}]
   ["/all"
    {:get {:summary    "Get all channels in the server"
           :swagger    {:tags ["chat"]}
           :handler    (fn do-get-all-channels [_req]
                         (let [result (port.chat/get-all-channels (:chat-adapter config) {})]
                           (if (:success? result)
                             (r/ok (cske/transform-keys ->snake_case result))
                             (r/server-error result))))
           :responses {:200 {:body (success-with :channels [:sequential ds-chat/Channel])}
                       :500 {:body (failure-with)}}}}]
   ["/details"
    ["/{id}"
     {:get {:summary    "Get channel details"
            :middleware middleware
            :swagger    {:tags ["chat"] :security [{:id_token []}]}
            :handler    (fn get-channel-details [{{:keys [path]} :parameters}]
                          (let [result (srv.chat/get-channel-details config (:id path))]
                            (if (:success? result)
                              (r/ok (cske/transform-keys ->snake_case result))
                              (r/server-error result))))
            :parameters {:path [:map
                                [:id
                                 {:swagger {:description "The channel ID."
                                            :type "string"
                                            :allowEmptyValue false}}
                                 [:string {:min 1}]]]}
            :responses {:200 {:body (success-with #_[:channel ds-chat/Channel])} ;; n.b. returns channels + users.
                        :500 {:body (failure-with)}}}}]]
   ["/private"
    [""
     {:get  {:summary    "Get all private channels in the server"
             :middleware middleware
             :swagger    {:tags ["chat"]}
             :handler    (fn do-get-private-channels [req]
                           (get-private-channels config req))
             :responses {:200 {:body (success-with :channels [:sequential ds-chat/Channel])}
                         :500 {:body (failure-with)}}}
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
             :responses {:200 {:body (success-with)}
                         :500 {:body (failure-with)}}}}]
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
             :responses {:200 {:body (success-with)}
                         :500 {:body (failure-with)}}}}]]
   ["/public"
    {:get {:summary    "Get all public channels in the server"
           :middleware middleware
           :swagger    {:tags ["chat"]}
           :handler    (fn do-get-public-channels [req]
                         (get-public-channels config req))
           :responses {:200 {:body (success-with :channels [:sequential ds-chat/Channel])}
                       :500 {:body (failure-with)}}}}]])

(comment
  (dev/make-user! "abc@abc.net")
  (gpml.db.stakeholder/stakeholder-by-email (dev/conn) {:email "abc@abc.net"})

  (http-client/request (dev/logger)
                       {:url "http://localhost:3000/api/chat/user/account"
                        :method :post
                        :as :json-keyword-keys})

  ;; 2.

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
                       {:url (str "http://localhost:3000/api/chat/channel/details/" channel-id)
                        :as :json-keyword-keys})

  ;; 8
  (http-client/request (dev/logger)
                       {:url "http://localhost:3000/api/chat/channel/all"
                        :as :json-keyword-keys})

  ;; 6
  (port.chat/add-user-to-public-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                        (:chat_account_id (gpml.db.stakeholder/stakeholder-by-email (dev/conn) {:email "abc@abc.net"}))
                                        channel-id)

  ;; 9
  (http-client/request (dev/logger)
                       {:url "http://localhost:3000/api/chat/user/channel"
                        :as :json-keyword-keys})

  ;; 12
  (http-client/request (dev/logger)
                       {:url "http://localhost:3000/api/chat/channel/leave"
                        :method :post
                        :body (json/->json {:channel_id channel-id})
                        :as :json-keyword-keys})

  (http-client/request (dev/logger)
                       {:url "http://localhost:3000/api/chat/user/channel"
                        :as :json-keyword-keys}))

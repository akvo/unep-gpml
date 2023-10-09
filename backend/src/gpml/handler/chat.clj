(ns gpml.handler.chat
  (:require [camel-snake-kebab.core :refer [->snake_case]]
            [camel-snake-kebab.extras :as cske]
            [duct.logger :refer [log]]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.domain.types :as dom.types]
            [gpml.handler.resource.permission :as h.r.permission]
            [gpml.handler.responses :as r]
            [gpml.service.chat :as srv.chat]
            [gpml.util.email :as email]
            [integrant.core :as ig]))

(def ^:private channel-types
  #{"c" "p"})

(def ^:private set-user-account-active-status-params-schema
  [:map
   [:chat_account_status
    {:optional false
     :swagger {:description "The user chat account status"
               :type "string"
               :enum (map str dom.types/chat-account-statuses)}}
    (dom.types/get-type-schema :chat-account-status)]])

(def ^:private send-private-channel-invitation-request-params-schema
  [:map
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
    [:string {:min 1}]]])

(def ^:private add-user-to-private-channel-params-schema
  [:map
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
    [:string {:min 1}]]
   [:user_id
    {:optional false
     :swagger {:description "The user's identifier in GPML"
               :type "integer"
               :allowEmptyValue false}}
    [:fn
     {:error/message "Not a valid user identifier. It should be a positive integer."}
     pos-int?]]])

(def ^:private get-all-channels-params-schema
  [:map
   [:name
    {:optional true
     :swagger {:description "The channel name"
               :type "string"
               :allowEmptyValue false}}
    [:string {:min 1}]]
   [:types
    {:optional true
     :swagger {:description "The channel types: c = public, p = private"}}
    [:vector
     {:decode/string (fn [x] (if (string? x) [x] x))}
     [:enum "c" "p"]]]])

(def ^:private remove-user-from-channel-params-schema
  [:map
   [:channel_id
    {:swagger {:description "The channel ID"
               :type "string"
               :allowEmptyValue false}}
    [:string {:min 1}]]
   [:channel_type
    {:swagger {:description "The channel type: c = public, p = private"
               :type "string"
               :enum channel-types}}
    (apply conj [:enum] channel-types)]])

(defn- create-user-account
  [config {:keys [user]}]
  (let [result (srv.chat/create-user-account config (:id user))]
    (if (:success? result)
      (r/ok (:stakeholder result))
      (r/server-error (dissoc result :success?)))))

(defn- set-user-account-active-status
  [config {:keys [user parameters]}]
  (let [chat-account-status (-> parameters :body :chat_account_status)
        result (srv.chat/set-user-account-active-status config user chat-account-status)]
    (if (:success? result)
      (r/ok {})
      (r/server-error (dissoc result :success?)))))

(defn- get-user-joined-channels
  [config {:keys [user]}]
  (let [result (srv.chat/get-user-joined-channels config (:chat_account_id user))]
    (if (:success? result)
      (r/ok (cske/transform-keys ->snake_case (:channels result)))
      (r/server-error (dissoc result :success?)))))

(defn- get-private-channels
  [config {:keys [user]}]
  (if-not (h.r.permission/operation-allowed?
           config
           {:user-id (:id user)
            :entity-type :application
            :custom-permission :list-chat-private-channels
            :root-context? true})
    (r/forbidden {:message "Unauthorized"})
    (let [result (srv.chat/get-private-channels config)]
      (if (:success? result)
        (r/ok (cske/transform-keys ->snake_case (:channels result)))
        (r/server-error (dissoc result :success?))))))

(defn- get-all-channels
  [config {:keys [user parameters]}]
  (if-not (h.r.permission/operation-allowed?
           config
           {:user-id (:id user)
            :entity-type :application
            :custom-permission :list-chat-channels
            :root-context? true})
    (r/forbidden {:message "Unauthorized"})
    (let [search-opts (:query parameters)
          result (srv.chat/get-all-channels config search-opts)]
      (if (:success? result)
        (r/ok (cske/transform-keys ->snake_case (:channels result)))
        (r/server-error (dissoc result :success?))))))

(defn- get-public-channels
  [config {:keys [user]}]
  (if-not (h.r.permission/operation-allowed?
           config
           {:user-id (:id user)
            :entity-type :application
            :custom-permission :list-chat-public-channels
            :root-context? true})
    (r/forbidden {:message "Unauthorized"})
    (let [result (srv.chat/get-public-channels config)]
      (if (:success? result)
        (r/ok (cske/transform-keys ->snake_case (:channels result)))
        (r/server-error (dissoc result :success?))))))

(defn- send-private-channel-invitation-request
  [config {:keys [user parameters]}]
  (if-not (h.r.permission/operation-allowed?
           config
           {:user-id (:id user)
            :entity-type :application
            :custom-permission :send-private-chat-channel-invitation-request
            :root-context? true})
    (r/forbidden {:message "Unauthorized"})
    (let [channel-name (get-in parameters [:body :channel_name])
          channel-id (get-in parameters [:body :channel_id])
          result (srv.chat/send-private-channel-invitation-request
                  config
                  user
                  channel-id
                  channel-name)]
      (if (:success? result)
        (r/ok {})
        (r/server-error (dissoc result :success?))))))

(defn- remove-user-from-channel
  [config {:keys [user parameters]}]
  (let [{:keys [channel_id channel_type]} (:body parameters)
        result (srv.chat/remove-user-from-channel config
                                                  (:chat_account_id user)
                                                  channel_id
                                                  channel_type)]
    (if (:success? result)
      (r/ok {})
      (r/server-error (dissoc result :success?)))))

(defn- add-user-to-private-channel
  [{:keys [db mailjet-config] :as config} parameters]
  (let [{:keys [channel_id channel_name user_id]} (:body parameters)
        target-user (db.stakeholder/get-stakeholder-by-id (:spec db) {:id user_id})]
    (if (seq target-user)
      (let [result (srv.chat/add-user-to-private-channel config
                                                         (:chat_account_id target-user)
                                                         channel_id)]
        (if (:success? result)
          (do
            (email/notify-user-about-chat-private-channel-invitation-request-accepted
             mailjet-config
             target-user
             channel_name)
            (r/ok {}))
          (r/server-error (dissoc result :success?))))
      (r/server-error {:reason :user-not-found}))))

(defmethod ig/init-key :gpml.handler.chat/post
  [_ config]
  (fn [req]
    (create-user-account config req)))

(defmethod ig/init-key :gpml.handler.chat/put
  [_ config]
  (fn [req]
    (set-user-account-active-status config req)))

(defmethod ig/init-key :gpml.handler.chat/put-params
  [_ _]
  {:body set-user-account-active-status-params-schema})

(defmethod ig/init-key :gpml.handler.chat/get-private-channels
  [_ config]
  (fn [req]
    (get-private-channels config req)))

(defmethod ig/init-key :gpml.handler.chat/get-public-channels
  [_ config]
  (fn [req]
    (get-public-channels config req)))

(defmethod ig/init-key :gpml.handler.chat/get-all-channels
  [_ config]
  (fn [req]
    (get-all-channels config req)))

(defmethod ig/init-key :gpml.handler.chat/get-all-channels-params
  [_ _]
  {:query get-all-channels-params-schema})

(defmethod ig/init-key :gpml.handler.chat/get-user-joined-channels
  [_ config]
  (fn [req]
    (get-user-joined-channels config req)))

(defmethod ig/init-key :gpml.handler.chat/send-private-channel-invitation-request
  [_ config]
  (fn [req]
    (send-private-channel-invitation-request config req)))

(defmethod ig/init-key :gpml.handler.chat/send-private-channel-invitation-request-params
  [_ _]
  {:body send-private-channel-invitation-request-params-schema})

(defmethod ig/init-key :gpml.handler.chat/add-user-to-private-channel-params
  [_ _]
  {:body add-user-to-private-channel-params-schema})

(defmethod ig/init-key :gpml.handler.chat/add-user-to-private-channel
  [_ {:keys [logger] :as config}]
  (fn [{parameters :parameters user :user}]
    (if (h.r.permission/super-admin? config (:id user))
      (try
        (add-user-to-private-channel config parameters)
        (catch Throwable t
          (log logger :error ::failed-to-add-user-to-private-channel {:exception-message (ex-message t)})
          (let [response {:success? false
                          :reason :could-not-add-user-to-private-channel}]
            (r/server-error (assoc-in response [:error-details :error] (ex-message t))))))
      (r/forbidden {:message "Unauthorized"}))))

(defmethod ig/init-key :gpml.handler.chat/remove-user-from-channel
  [_ config]
  (fn [req]
    (remove-user-from-channel config req)))

(defmethod ig/init-key :gpml.handler.chat/remove-user-from-channel-params
  [_ _]
  {:body remove-user-from-channel-params-schema})

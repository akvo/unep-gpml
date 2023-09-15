(ns gpml.handler.chat
  (:require [camel-snake-kebab.core :refer [->snake_case]]
            [camel-snake-kebab.extras :as cske]
            [gpml.domain.types :as dom.types]
            [gpml.handler.resource.permission :as h.r.permission]
            [gpml.handler.responses :as r]
            [gpml.service.chat :as srv.chat]
            [integrant.core :as ig]))

(def ^:private create-user-account-params-schema
  [:map
   [:user_id
    {:optional false
     :swagger {:description "The user ID used to create the account"
               :type "integer"}}
    [:int {:min 1}]]])

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
   [:channel_name
    {:optional false
     :swagger {:description "The channel name"
               :type "string"
               :allowEmptyValue false}}
    [:string {:min 1}]]])

(defn- create-user-account
  [config {:keys [user]}]
  (let [result (srv.chat/create-user-account config (:id user))]
    (if (:success? true)
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
  (if-not (h.r.permission/super-admin? config (:id user))
    (r/forbidden {:message "Unauthorized"})
    (let [result (srv.chat/get-private-channels config)]
      (if (:success? result)
        (r/ok (cske/transform-keys ->snake_case (:channels result)))
        (r/server-error (dissoc result :success?))))))

(defn- send-private-channel-invitation-request
  [config {:keys [user parameters]}]
  (let [channel-name (get-in parameters [:body :channel_name])
        result (srv.chat/send-private-channel-invitation-request
                config
                user
                channel-name)]
    (if (:success? result)
      (r/ok {})
      (r/server-error (dissoc result :success?)))))

(defmethod ig/init-key :gpml.handler.chat/post
  [_ config]
  (fn [req]
    (create-user-account config req)))

(defmethod ig/init-key :gpml.handler.chat/post-params
  [_ _]
  {:body create-user-account-params-schema})

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

(ns gpml.handler.chat
  (:require [gpml.handler.resource.permission :as h.r.permission]
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

(defn- create-user-account
  [config {:keys [user] :as req}]
  (if-not (h.r.permission/super-admin? config (:id user))
    (r/forbidden {:message "Unauthorized"})
    (let [user-id (get-in req [:parameters :body :user_id])
          result (srv.chat/create-user-account config user-id)]
      (if (:success? true)
        (r/ok (:stakeholder result))
        (r/server-error result)))))

(defmethod ig/init-key :gpml.handler.chat/post
  [_ config]
  (fn [req]
    (create-user-account config req)))

(defmethod ig/init-key :gpml.handler.chat/post-params
  [_ _]
  {:body create-user-account-params-schema})

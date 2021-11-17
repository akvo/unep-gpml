(ns gpml.handler.auth
  (:require
   ;;   [clojure.java.jdbc :as jdbc]
   ;;   [clojure.string :as str]
   ;;   [gpml.constants :as constants]
   [gpml.handler.util :as util]
   [gpml.db.topic-stakeholder-auth :as db.ts-auth]
   ;;   [gpml.model.topic :as model.topic]
   [integrant.core :as ig]
   [ring.util.response :as resp]))

(defmethod ig/init-key ::get-topic-auth [_ {:keys [conn]}]
  (fn [{{:keys [path]} :parameters user :user}]
    (let [authorized? user]
      (if authorized?
        (if-let [data (db.ts-auth/get-auth-by-topic conn path)]
         (resp/response (merge path {:auth-stakeholders data}))
         util/not-found)
        util/unauthorized))))

(defmethod ig/init-key ::get-topic-stakeholder-auth [_ {:keys [conn]}]
  (fn [{{:keys [path]} :parameters user :user}]
    (let [authorized? user]
      (if authorized?
        (if-let [data (db.ts-auth/get-auth-by-topic-and-stakeholder conn path)]
          (resp/response (merge path data))
         util/not-found)
        util/unauthorized))))

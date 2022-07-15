(ns gpml.handler.auth
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.set :as set]
            [gpml.auth :as auth]
            [gpml.db.topic-stakeholder-auth :as db.ts-auth]
            [gpml.handler.util :as util]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defn grant-topic-to-stakeholder! [conn {:keys [topic-id topic-type stakeholder-id roles]}]
  {:pre [(empty? (set/difference (set roles)  auth/authz-roles))]}
  (let [opts {:topic-id    topic-id
              :topic-type  topic-type
              :stakeholder stakeholder-id
              :roles       roles}]
    (db.ts-auth/new-auth conn opts)))

(defmethod ig/init-key ::get-topic-auth [_ {:keys [conn]}]
  (fn [{{:keys [path]} :parameters user :user}]
    (let [authorized? user
          path (update path :topic-type util/get-internal-topic-type)]
      (if authorized?
        (if-let [data (db.ts-auth/get-auth-by-topic conn path)]
          (resp/response (merge path {:auth-stakeholders data}))
          util/not-found)
        util/unauthorized))))

(defmethod ig/init-key ::post-topic-auth [_ {:keys [conn]}]
  (fn [{{:keys [path body]} :parameters user :user}]
    (let [authorized? user
          path        (update path :topic-type util/get-internal-topic-type)]
      (if authorized?
        (do
          (jdbc/with-db-transaction [tx-conn conn]
            (db.ts-auth/delete-auth-by-topic tx-conn path)
            (doseq [s (:stakeholders body)]
              (grant-topic-to-stakeholder! tx-conn
                                           (assoc path
                                                  :stakeholder-id (:id s)
                                                  :roles (:roles s)))))
          (resp/response (merge path body)))
        util/unauthorized))))

(defmethod ig/init-key ::get-topic-stakeholder-auth [_ {:keys [conn]}]
  (fn [{{:keys [path]} :parameters user :user}]
    (let [authorized? user
          path (update path :topic-type util/get-internal-topic-type)]
      (if authorized?
        (if-let [data (db.ts-auth/get-auth-by-topic-and-stakeholder conn path)]
          (resp/response (merge path data))
          util/not-found)
        util/unauthorized))))

(defmethod ig/init-key ::new-roles [_ {:keys [conn]}]
  (fn [{{:keys [path body]} :parameters user :user}]
    (let [authorized? user
          path (update path :topic-type util/get-internal-topic-type)]
      (if authorized?
        (do
          (db.ts-auth/new-auth conn (merge path body))
          (resp/response (merge path body)))
        util/unauthorized))))

(defmethod ig/init-key ::update-roles [_ {:keys [conn]}]
  (fn [{{:keys [path body]} :parameters user :user}]
    (let [authorized? user
          path (update path :topic-type util/get-internal-topic-type)]
      (if authorized?
        (do
          (db.ts-auth/update-auth conn (merge path body))
          (resp/response (merge path body)))
        util/unauthorized))))

(defmethod ig/init-key ::delete [_ {:keys [conn]}]
  (fn [{{:keys [path body]} :parameters user :user}]
    (let [authorized? user
          path (update path :topic-type util/get-internal-topic-type)]
      (if authorized?
        (do
          (db.ts-auth/delete-auth conn path)
          (resp/response (merge path body)))
        util/unauthorized))))

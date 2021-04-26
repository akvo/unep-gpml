(ns gpml.handler.initiative
  (:require [integrant.core :as ig]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.initiative :as db.initiative]
            [ring.util.response :as resp]))

(defmethod ig/init-key :gpml.handler.initiative/post [_ {:keys [db]}]
  (fn [{:keys [jwt-claims body-params] :as req}]
      (let [user (db.stakeholder/stakeholder-by-email (:spec db) jwt-claims)
            data (assoc body-params :created_by (:id user))
            initiative-id (db.initiative/new-initiative (:spec db) data)]
    (resp/created (:referrer req) {:message "New initiative created" :id initiative-id}))))

(defmethod ig/init-key :gpml.handler.initiative/post-params [_ _]
  [:map [:version integer?]])

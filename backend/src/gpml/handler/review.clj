(ns gpml.handler.review
  (:require
   [gpml.db.stakeholder :as db.stakeholder]
   [integrant.core :as ig]
   [ring.util.response :as resp]))

(defn get-reviewers [db]
  (let [conn (:spec db)]
    (resp/response (db.stakeholder/get-reviewers conn))))

(defmethod ig/init-key ::get-reviewers [_ {:keys [db]}]
  (fn [_]
    (get-reviewers db)))

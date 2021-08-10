(ns gpml.handler.stakeholder
  (:require [gpml.db.stakeholder :as db.stakeholder]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defmethod ig/init-key :gpml.handler.stakeholder/public [_ {:keys [db]}]
  (fn [req]
    (resp/response (->> (db.stakeholder/all-public-stakeholder (:spec db))
                        (map #(select-keys % [:id :title :first_name :last_name :email]))))))

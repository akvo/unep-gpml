(ns gpml.handler.country-group
  (:require [gpml.db.country-group :as db.country-group]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defmethod ig/init-key :gpml.handler.country-group/get [_ {:keys [db]}]
  (fn [{{{:keys [id]} :query} :parameters}]
    (let [conn (:spec db)
          data (if id
                 (db.country-group/country-group-detail conn {:id id})
                 (db.country-group/all-country-group conn))]
      (resp/response (or data [])))))

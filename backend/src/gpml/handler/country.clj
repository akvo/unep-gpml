(ns gpml.handler.country
  (:require [gpml.db.country :as db.country]
            [integrant.core :as ig]
            [ring.util.response :as resp]))


(defmethod ig/init-key :gpml.handler.country/get [_ {:keys [db]}]
  (fn [{{{:keys [id]} :query} :parameters}]
    (let [conn (:spec db)
          data (if id
                 (db.country/country-by-id conn {:id id})
                 (db.country/all-countries conn))]
      (resp/response (or data [])))))

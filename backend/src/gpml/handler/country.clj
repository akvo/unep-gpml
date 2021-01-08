(ns gpml.handler.country
  (:require [gpml.db.country :as db.country]
            [integrant.core :as ig]
            [ring.util.response :as resp]))


(defmethod ig/init-key :gpml.handler.country/handler [_ {:keys [db]}]
  (fn [{:keys [query-params]}]
    (let [conn (:spec db)
          id (get query-params "id")
          data (if id
                 (db.country/country-by-id conn {:id (Long/parseLong id)})
                 (db.country/all-countries conn))]
      (resp/response (or data [])))))

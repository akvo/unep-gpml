(ns gpml.handler.country
  (:require [gpml.db.country :as db.country]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defmethod ig/init-key :gpml.handler.country/get [_ {:keys [db]}]
  (fn [_]
    (let [conn (:spec db)
          data (db.country/get-countries conn {})]
      (resp/response (or data [])))))

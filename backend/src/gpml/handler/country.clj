(ns gpml.handler.country
  (:require [gpml.db.country :as db.country]
            [integrant.core :as ig]
            [ring.util.response :as resp]))


(defmethod ig/init-key :gpml.handler.country/handler [_ {:keys [db]}]
  (fn [_]
    (let [conn (:spec db)]
      (resp/response (db.country/all-countries conn)))))

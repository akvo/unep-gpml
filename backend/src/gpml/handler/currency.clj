(ns gpml.handler.currency
  (:require [gpml.db.currency :as db.currency]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defmethod ig/init-key :gpml.handler.currency/all [_ {:keys [db]}]
  (fn [_]
    (resp/response (-> (db.currency/all-currencies (:spec db)) :array_agg))))

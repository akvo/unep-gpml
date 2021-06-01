(ns gpml.handler.country
  (:require [gpml.db.country :as db.country]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defn id-by-code [conn country]
  (->> {:name country} (db.country/country-by-code conn) :id))

(defn id-by-name [conn country]
  (->> {:name country} (db.country/country-by-name conn) :id))

(defmethod ig/init-key :gpml.handler.country/get [_ {:keys [db]}]
  (fn [_]
    (let [conn (:spec db)
          data (db.country/all-countries conn)]
      (resp/response (or data [])))))

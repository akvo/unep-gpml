(ns gpml.handler.landing
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]
            [gpml.handler.browse :as browse]
            [gpml.db.country :as db.country]
            [gpml.db.landing :as db.landing]))

(defn sample-map-data [countries]
  (map #(merge % {:project (rand-int 10),
                  :event (rand-int 10),
                  :policy (rand-int 10),
                  :technology (rand-int 10)
                  :resource (rand-int 10)})
       (filter #(some? (:iso_code %)) countries)))

(def sample-summary-data
  [{:project (rand-int 100) :countries (rand-int 100)}
   {:event (rand-int 100) :countries (rand-int 100)}
   {:policy (rand-int 100) :countries (rand-int 100)}
   {:technology (rand-int 100) :countries (rand-int 100)}
   {:resource (rand-int 100) :countries (rand-int 100)}])

(defn map-counts-with-country-names [conn]
  (let [countries (db.country/all-countries conn)
        names (->> countries
                   (map #(assoc {} (:iso_code %) (:name %)))
                   (apply merge))
        counts (db.landing/map-counts-grouped conn)]
    (map #(merge {:name (names (:iso_code %))} %) counts)))

(defn landing-sample-response [conn]
  (resp/response {:topics browse/sample-data
                  :map (map-counts-with-country-names conn)
                  :summary sample-summary-data}))

(defmethod ig/init-key :gpml.handler.landing/get [_ {:keys [db]}]
  (fn [_]
    (let [conn (:spec db)]
      (landing-sample-response conn))))


(comment
  (require 'dev)
  (let [db (dev/db-conn)]
    (map-counts-with-country-names db))
  (rand-int 10)
  )

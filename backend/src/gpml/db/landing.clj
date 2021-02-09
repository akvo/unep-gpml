(ns gpml.db.landing
  (:require [clojure.set :as set]
            [hugsql.core :as hugsql]
            [gpml.db.country :as db.country]
            [gpml.pg-util]))

(hugsql/def-db-fns "gpml/db/landing.sql")

(def topic-counts
  {:project 0
   :event 0
   :financing_resource 0
   :technical_resource 0
   :technology 0
   :policy 0
   :stakeholder 0})

(defn map-counts-explicit [conn]
  (let [counts (gpml.db.landing/map-counts conn)]
    (map #(merge-with + {:iso_code (:iso_code %)} topic-counts (:counts %)) counts)))

(defn map-counts-include-all-countries [conn]
  (let [counts (map-counts-explicit conn)
        included-countries (->> counts (map :iso_code) set)
        all-countries (->> (db.country/all-countries conn) (map :iso_code) set)
        missing-countries (set/difference all-countries included-countries)
        missing-counts (map #(merge {:iso_code %} topic-counts) missing-countries)]
    (concat counts missing-counts)))

(ns gpml.db.landing
  (:require [clojure.set :as set]
            [hugsql.core :as hugsql]
            [gpml.constants :as constants]
            [gpml.db.country :as db.country]
            [gpml.pg-util]))

(declare map-counts summary)

(hugsql/def-db-fns "gpml/db/landing.sql")

(def topic-counts
  (->> constants/topics
       (map #(assoc {} (keyword %) 0))
       (apply merge)))

(defn map-counts-explicit [conn]
  (let [counts (map-counts conn)]
    (map #(merge-with + {:iso_code (:iso_code %)} topic-counts (:counts %)) counts)))

(defn map-counts-include-all-countries [conn]
  (let [counts (map-counts-explicit conn)
        included-countries (->> counts (map :iso_code) set)
        all-countries (->> (db.country/all-countries conn) (map :iso_code) set)
        missing-countries (set/difference all-countries included-countries)
        missing-counts (map #(merge {:iso_code %} topic-counts) missing-countries)]
    (concat counts missing-counts)))

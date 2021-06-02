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
    (map #(merge-with + {:id (:id %)} topic-counts (:counts %)) counts)))

(defn remap-counts [x]
  (assoc (dissoc x :id) :country_id (:id x)))

(defn map-counts-include-all-countries [conn]
  (let [counts (map-counts-explicit conn)
        included-countries (->> counts (map :id) set)
        all-countries (->> (db.country/all-countries conn) (map :id) set)
        missing-countries (set/difference all-countries included-countries)
        missing-counts (map #(merge {:id %} topic-counts) missing-countries)]
    (map remap-counts (concat counts missing-counts))))

(comment

  (require 'dev)
  (def db (dev/db-conn))

  (map-counts-include-all-countries db)

  )

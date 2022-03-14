(ns gpml.db.landing
  (:require [clojure.set :as set]
            [hugsql.core :as hugsql]
            [gpml.constants :as constants]
            [gpml.db.country :as db.country]
            [gpml.pg-util]))

(declare map-counts summary map-transnational-counts)

(hugsql/def-db-fns "gpml/db/landing.sql")

(def topic-counts
  (->> constants/topics
       (map #(-> {}
               (assoc-in [:counts (keyword %)] 0)
               (assoc-in [:transnational_counts (keyword %)] 0)))
       (apply merge-with into)))

(defn map-counts-explicit [conn]
  (let [map-counts (map-counts conn)
        transnational-counts (map-transnational-counts conn)]
    (reduce
      (fn [acc [_ counts]]
        (conj acc (merge-with into topic-counts (apply merge counts))))
      []
      (group-by :id (concat map-counts transnational-counts)))))

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

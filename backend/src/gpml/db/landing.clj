(ns gpml.db.landing
  (:require [hugsql.core :as hugsql]
            [gpml.pg-util]))

(hugsql/def-db-fns "gpml/db/landing.sql")

(defn group-counts [counts]
  (let [country-code (-> counts first :geo_coverage_iso_code)]
    (->> counts
         (map #(assoc {} (keyword (:topic %)) (:count %)))
         (apply merge)
         (merge {:iso_code country-code
                 :resource 0
                 :project 0
                 :event 0
                 :policy 0
                 :technology 0}))))

(defn map-counts-grouped [conn]
  (let [counts (gpml.db.landing/map-counts conn)
        grouped-counts (->> counts
                            (filter #(some? (:geo_coverage_iso_code %)))
                            (group-by :geo_coverage_iso_code)
                            vals
                            (map group-counts))
        global-counts (->> grouped-counts
                           (filter #(= (:iso_code %) "***"))
                           first)]
    (map #(merge-with + % (dissoc global-counts :iso_code)) grouped-counts)))

(comment
  (require 'dev)
  (let [db (dev/db-conn)]
    (map-counts-grouped db))
  )

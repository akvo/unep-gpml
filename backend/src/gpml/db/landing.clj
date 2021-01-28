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
        _ (prn group-counts)
        global-counts (->> grouped-counts
                           (filter #(= (:iso_code %) "***"))
                           first)]
    (map #(merge-with + % (dissoc global-counts :iso_code)) grouped-counts)))

;; deden test
(defn topic-count [conn]
  (->> (gpml.db.landing/new-landing-test conn)
       (mapv (fn [{:keys [data, total, countries]}]
               {(keyword data) total :country countries}))))

(comment
  (require 'dev)
  (let [db (dev/db-conn)]
    (topic-count db))
  (let [db (dev/db-conn)]
    (map-counts-grouped db))
  )

(ns gpml.db.landing
  (:require [hugsql.core :as hugsql]
            [gpml.pg-util]))

(hugsql/def-db-fns "gpml/db/landing.sql")

(def topic-counts
  {:project 0
   :event 0
   :financing_resource 0
   :technical_resource 0
   :technology 0
   :policy 0})

(defn map-specific-counts [conn]
  (let [counts (gpml.db.landing/map-counts conn)
        the-counts (->> counts
                           (filter #(= (:iso_code %) "***"))
                           first
                           :counts
                           (merge-with + topic-counts))]
    (->> counts
         (remove #(= (:iso_code %) "***")) ;; global
         (remove #(nil? (:iso_code %)))    ;; other & all countries
         (map #(merge-with + {:iso_code (:iso_code %)} (:counts %) the-counts)))))

(defn map-counts+global [conn]
  (let [counts (gpml.db.landing/map-counts-includes-global conn)
        global-counts (->> counts
                           (filter #(= (:iso_code %) "***"))
                           first
                           :counts
                           (merge-with + topic-counts))]
    (->> counts
         (remove #(= (:iso_code %) "***")) ;; global
         (remove #(nil? (:iso_code %)))    ;; other & all countries
         (map #(merge-with + {:iso_code (:iso_code %)} (:counts %) global-counts)))))

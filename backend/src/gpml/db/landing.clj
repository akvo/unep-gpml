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
   :policy 0
   :stakeholder 0})

(defn map-counts-explicit [conn]
  (let [counts (gpml.db.landing/map-counts conn)]
    (map #(merge-with + {:iso_code (:iso_code %)} topic-counts (:counts %)) counts)))

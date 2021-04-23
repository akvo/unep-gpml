(ns gpml.handler.geo
  (:require [gpml.db.country :as db.country]
            [gpml.db.country-group :as db.country-group]))

(defn id-vec-geo [db id {:keys [geo_coverage_type geo_coverage_value]}]
  (cond
    (#{"regional" "global with elements in specific areas"} geo_coverage_type)
    (->> {:names geo_coverage_value}
         (db.country-group/country-group-by-names db)
         (map #(vector id (:id %) nil)))
    (#{"transnational" "national"} geo_coverage_type)
    (->> {:codes geo_coverage_value}
         (db.country/country-by-codes db)
         (map #(vector id nil (:id %))))))

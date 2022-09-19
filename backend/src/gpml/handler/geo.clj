(ns gpml.handler.geo
  (:require [gpml.db.country :as db.country]
            [gpml.db.country-group :as db.country-group]))

(defn id-vec-geo [db id {:keys [geo_coverage_type geo_coverage_value]}]
  (cond
    (#{"regional" "global with elements in specific areas"} geo_coverage_type)
    (->> {:names geo_coverage_value}
         (db.country-group/country-group-by-names db)
         (map #(vector id (:id %) nil)))
    (#{"transnational" "national" "sub-national"} geo_coverage_type)
    (->> {:filters {:iso-codes-a3 geo_coverage_value}}
         (db.country/get-countries db)
         (map #(vector id nil (:id %))))))

(defn get-geo-vector [id {:keys [geo_coverage_type geo_coverage_value]}]
  (cond
    (#{"transnational" "regional" "global with elements in specific areas"} geo_coverage_type)
    (map #(vector id % nil) geo_coverage_value)
    (#{"national" "sub-national"} geo_coverage_type)
    (map #(vector id nil %) geo_coverage_value)))

(defn get-geo-vector-v2 [id {:keys [geo_coverage_countries geo_coverage_country_groups]}]
  (-> []
      (into (mapv #(vector id % nil) geo_coverage_country_groups))
      (into (mapv #(vector id nil %) geo_coverage_countries))))

(def params-payload
  [[:geo_coverage_countries {:optional true}
    [:vector {:min 1 :error/message "Need at least one geo coverage value"} integer?]]
   [:geo_coverage_country_groups {:optional true}
    [:vector {:min 1 :error/message "Need at least one geo coverage value"} integer?]]
   [:geo_coverage_value {:optional true}
    [:vector {:min 1 :error/message "Need at least one geo coverage value"} integer?]]])

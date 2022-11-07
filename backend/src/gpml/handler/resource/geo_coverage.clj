(ns gpml.handler.resource.geo-coverage
  (:require [gpml.db.resource.geo-coverage :as db.geo-coverage]
            [gpml.domain.geo-coverage :as dom.geo-coverage]
            [gpml.util.sql :as util.sql]))

(def api-geo-coverage-schemas
  [[:geo_coverage_countries
    {:optional true}
    [:vector
     {:min 1 :error/message "Need at least one geo coverage value"}
     integer?]]
   [:geo_coverage_country_groups
    {:optional true}
    [:vector
     {:min 1 :error/message "Need at least one geo coverage value"}
     integer?]]
   [:geo_coverage_country_states
    {:optional true}
    [:vector
     {:min 1 :error/message "Need at least one geo coverage value"}
     integer?]]])

(defn- create-resource-geo-coverage*
  [conn table countries-country-groups-geo]
  (let [insert-cols (util.sql/get-insert-columns-from-entity-col countries-country-groups-geo)
        insert-values (util.sql/entity-col->persistence-entity-col countries-country-groups-geo)]
    (db.geo-coverage/create-resource-geo-coverage conn {:table table
                                                        :insert-cols insert-cols
                                                        :insert-values insert-values})))

(defn create-resource-geo-coverage
  [conn entity-id entity-key {:keys [countries country-groups country-states]}]
  (let [countries-country-groups-geo
        (dom.geo-coverage/geo-countries-country-groups entity-id
                                                       entity-key
                                                       countries
                                                       country-groups)
        country-states-geo
        (dom.geo-coverage/geo-country-states entity-id
                                             (keyword (str (name entity-key) "_id"))
                                             country-states)
        countries-country-groups-geo-res
        (create-resource-geo-coverage* conn
                                       (str (name entity-key) "_geo_coverage")
                                       countries-country-groups-geo)
        country-states-geo-res
        (create-resource-geo-coverage* conn
                                       (str (name entity-key) "_country_state")
                                       country-states-geo)]
    (if (and (= (+ (count countries) (country-groups)) (count countries-country-groups-geo-res))
             (= (count country-states) country-states-geo-res))
      {:success? true}
      {:success? false})))

(defn update-resource-geo-coverage
  [conn entity-key entity-id geo-coverage]
  (db.geo-coverage/delete-resource-geo-coverage conn
                                                {:table (str (name entity-key) "_geo_coverage")
                                                 :resource-col (name entity-key)
                                                 :resource-id entity-id})
  (db.geo-coverage/delete-resource-geo-coverage conn
                                                {:table (str (name entity-key) "_country_state")
                                                 :resource-col (name entity-key)
                                                 :resource-id entity-id})
  (create-resource-geo-coverage conn
                                entity-key
                                entity-id
                                geo-coverage))

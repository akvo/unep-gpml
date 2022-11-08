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
  [conn entity-id entity-key geo-coverage-type {:keys [countries country-groups country-states]}]
  (let [geo-coverage
        (dom.geo-coverage/->geo-coverage entity-id
                                         entity-key
                                         geo-coverage-type
                                         countries
                                         country-groups
                                         country-states)
        result
        (create-resource-geo-coverage* conn
                                       (str (name entity-key) "_geo_coverage")
                                       geo-coverage)]
    (if (= (count result) (count geo-coverage))
      {:success? true}
      {:success? false})))

(defn delete-resource-geo-coverage
  [conn entity-key entity-id]
  (try
    (let [affected-rows
          (db.geo-coverage/delete-resource-geo-coverage conn
                                                        {:table (str (name entity-key) "_geo_coverage")
                                                         :resource-col (name entity-key)
                                                         :resource-id entity-id})]
      {:success? true
       :delete-values affected-rows})
    (catch Exception e
      {:success? false
       :reason :failed-to-delete-resource-geo-coverage
       :error-details {:exception-type (class e)
                       :exception-message (ex-message e)}})))

(defn update-resource-geo-coverage
  [conn entity-key entity-id geo-coverage-type geo-coverage]
  (let [result (delete-resource-geo-coverage conn
                                             entity-key
                                             entity-id)]
    (if (:success? result)
      (create-resource-geo-coverage conn
                                    entity-key
                                    entity-id
                                    geo-coverage-type
                                    geo-coverage)
      (throw (ex-info "Failed to delete resource geo coverage" result)))))

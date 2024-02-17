(ns gpml.handler.resource.geo-coverage
  (:require
   [gpml.db.resource.geo-coverage :as db.geo-coverage]
   [gpml.domain.geo-coverage :as dom.geo-coverage]
   [gpml.util.sql :as util.sql]))

(def api-geo-coverage-validator-schema
  [:fn
   {:error/fn
    (fn [{{geo-coverage-type :geo_coverage_type
           geo-coverage-countries :geo_coverage_countries
           geo-coverage-country-groups :geo_coverage_country_groups
           geo-coverage-country-states :geo_coverage_country_states} :value}
         _]
      (let [geo-coverage-type (if (keyword? geo-coverage-type)
                                geo-coverage-type
                                (keyword geo-coverage-type))]
        (cond
          (and
           (= geo-coverage-type :national)
           (zero? (count geo-coverage-countries)))
          "The field 'geo_coverage_countries' can not be empty."

          (and
           (= geo-coverage-type :sub-national)
           (zero? (count geo-coverage-country-states)))
          "The field 'geo_coverage_country_states' can not be empty."

          (and
           (= geo-coverage-type :transnational)
           (zero? (count geo-coverage-country-groups)))
          "The field 'geo_coverage_country_groups' can not be empty.")))}
   (fn [{geo-coverage-type :geo_coverage_type
         geo-coverage-countries :geo_coverage_countries
         geo-coverage-country-groups :geo_coverage_country_groups
         geo-coverage-country-states :geo_coverage_country_states}]
     (let [geo-coverage-type (if (keyword? geo-coverage-type)
                               geo-coverage-type
                               (keyword geo-coverage-type))]
       (or
        (= geo-coverage-type :global)
        (and
         (= geo-coverage-type :national)
         (not (zero? (count geo-coverage-countries))))
        (and
         (= geo-coverage-type :sub-national)
         (not (zero? (count geo-coverage-country-states))))
        (and
         (= geo-coverage-type :transnational)
         (not (zero? (count geo-coverage-country-groups)))))))])

(def api-geo-coverage-schemas
  [[:geo_coverage_countries
    {:optional true}
    [:vector
     {:min 1 :error/message "Need at least one geo coverage value"}
     [:int {:min 1}]]]
   [:geo_coverage_country_groups
    {:optional true}
    [:vector
     {:min 1 :error/message "Need at least one geo coverage value"}
     [:int {:min 1}]]]
   [:geo_coverage_country_states
    {:optional true}
    [:vector
     {:min 1 :error/message "Need at least one geo coverage value"}
     [:int {:min 1}]]]])

(defn- create-resource-geo-coverage*
  [conn table geo-coverage]
  (let [insert-cols (util.sql/get-insert-columns-from-entity-col geo-coverage)
        insert-values (util.sql/entity-col->persistence-entity-col geo-coverage)]
    (db.geo-coverage/create-resource-geo-coverage conn {:table table
                                                        :insert-cols insert-cols
                                                        :insert-values insert-values})))

(defn create-resource-geo-coverage [conn entity-key entity-id geo-coverage-type {:keys [countries country-groups country-states]}]
  (if-not (and (or (seq countries)
                   (seq country-groups)
                   (seq country-states))
               (not= :global geo-coverage-type))
    {:success? true}
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
        {:success? false}))))

(defn delete-resource-geo-coverage [conn entity-key entity-id]
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

(defn update-resource-geo-coverage [conn entity-key entity-id geo-coverage-type geo-coverage]
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

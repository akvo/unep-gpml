(ns gpml.domain.geo-coverage
  (:require [gpml.util :as util]
            [gpml.util.malli :as util.malli]
            [malli.core :as m]
            [malli.util :as mu]))

(def GeoCoverage
  "Geo Coverage schema for countries and country groups. This is a sub
  entity relation stored in the `<entity-name>_geo_coverage` tables."
  (m/schema
   [:and
    [:map
     [:resource {:optional true} pos-int?]
     [:event {:optional true} pos-int?]
     [:policy {:optional true} pos-int?]
     [:technology {:optional true} pos-int?]
     [:initiative {:optional true} pos-int?]
     [:organisation {:optional true} pos-int?]
     [:country {:optional true} pos-int?]
     [:country_group {:optional true} pos-int?]
     [:country_state {:optional true} pos-int?]]
    [:fn (fn [{:keys [resource event policy technology organisation]}]
           (util/xor? resource event policy technology organisation))]]))

(defn- initial-geo-coverage
  [entity-key]
  (let [schema-keys (->> (mu/get GeoCoverage 0)
                         util.malli/keys
                         (remove (comp not #{entity-key :country :country_group :country_state})))]
    (zipmap schema-keys (repeat nil))))

(defn- build-geo-coverage-coll
  [geo-coverage-coll entity-key entity-id geo-key geo-ids]
  (map #(assoc geo-coverage-coll
               entity-key entity-id
               geo-key %)
       geo-ids))

(defn ->geo-coverage
  "Given the collections of `countries`, `country-groups` and
  `country-states` IDs, creates the canonical representation for the
  `<entity-name>_geo_coverage` tables. There are some restrictions
  depending on the `geo-coverage-type`:

  1 - If the `geo-coverage-type` is `:sub-national` `countries` and
  `country-states` must be pairs.

  2 - If the `geo-coverage-type` is `:national` `countries` are solo.

  3 - If the `geo-coverage-type` is `:transnational` `countries` and
  `country-groups` are not pairs and must be different records."
  [entity-id entity-key geo-coverage-type countries country-groups country-states]
  (let [geo-coverage (initial-geo-coverage entity-key)]
    (cond
      (= :sub-national geo-coverage-type)
      (concat (build-geo-coverage-coll geo-coverage entity-key entity-id :country countries)
              (build-geo-coverage-coll geo-coverage entity-key entity-id :country_state country-states))
      (= :national geo-coverage-type)
      (build-geo-coverage-coll geo-coverage entity-key entity-id :country countries)

      (= :transnational geo-coverage-type)
      (concat (build-geo-coverage-coll geo-coverage entity-key entity-id :country countries)
              (build-geo-coverage-coll geo-coverage entity-key entity-id :country_group country-groups)))))

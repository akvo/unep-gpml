(ns gpml.seeder.util
  (:require [gpml.seeder.db :as seeder.db]
            [gpml.db.initiative :as db.initiative]
            [jsonista.core :as j]
            [clojure.java.jdbc :as jdbc]
            [clojure.java.jdbc :as jdbc]
            [clojure.java.io :as io]))

(def ^:private json-path "dev/resources/files/")
(def ^:private cache-path "dev/resources/cache/")

(defn is-empty [db x]
  (= 0 (:count (seeder.db/get-count db {:tbl x}))))

(defn parse-json [json-file]
  (j/read-value
    (slurp json-file)
    j/keyword-keys-object-mapper))

(defn write-cache [data cache-id]
  (let [fl (java.io.File. (str cache-path cache-id ".json"))]
    (j/write-value fl data)))

(defn read-cache [cache-id]
  (parse-json (str cache-path cache-id ".json")))

(defn delete-cache [cache-id]
  (io/delete-file (java.io.File. (str cache-path cache-id ".json"))))

(defn get-id-from-json [json-file]
  (mapv #(:id %) (parse-json (str json-path json-file))))

(defn drop-all-constraint [db data]
  (let [table (seeder.db/get-foreign-key db data)
        ids (get-id-from-json (:json data))]
    (write-cache table (:cache data))
    (doseq [query (:deps table)]
      (seeder.db/drop-constraint db query))
    (seeder.db/delete-rows db {:tbl (:table data)
                               :ids ids
                               :col "id"})
    (when (some? (:child data))
      (doseq [child (:child data)]
        (seeder.db/delete-rows db {:tbl child
                                   :ids ids
                                   :col (:table data)}))))
  (println (str "Ref " (:table data) " removed")))

(defn revert-constraint [db cache-id]
  (let [table (read-cache cache-id)]
    (doseq [query (:deps table)]
      (seeder.db/add-constraint db query))
    (seeder.db/set-default-sequence db table)
    (delete-cache cache-id)
  (println (str "Ref " (:tbl table) " added"))))

(defn drop-constraint-country [db cache-id]
  (drop-all-constraint db {:cache cache-id
                           :table "country"
                           :json "countries.json"}))

(defn drop-constraint-country-group [db cache-id]
  (drop-all-constraint db {:cache cache-id
                           :table "country_group"
                           :json "country_group.json"
                           :child ["country_group_country"]}))

(defn drop-constraint-organisation [db cache-id]
  (drop-all-constraint db {:cache cache-id
                           :table "organisation"
                           :json "organisations_new.json"
                           :child ["organisation_geo_coverage"]}))

(defn drop-constraint-policy [db cache-id]
  (drop-all-constraint db {:cache cache-id
                           :table "policy"
                           :json "policies.json"
                           :child ["policy_geo_coverage"
                                   "policy_language_url"
                                   "policy_tag"]}))

(defn drop-constraint-resource [db cache-id]
  (drop-all-constraint db {:cache cache-id
                           :table "resource"
                           :json "resources.json"
                           :child ["resource_geo_coverage"
                                   "resource_language_url"
                                   "resource_organisation"
                                   "resource_tag"]}))

(defn drop-constraint-technology [db cache-id]
  (drop-all-constraint db {:cache cache-id
                           :table "technology"
                           :json "technologies.json"
                           :child ["technology_geo_coverage"
                                   "technology_language_url"
                                   "technology_tag"]}))

(defn drop-constraint-event [db cache-id]
  (drop-all-constraint db {:cache cache-id
                           :table "event"
                           :json "events.json"
                           :child ["event_geo_coverage"
                                   "event_language_url"
                                   "event_tag"]}))

(defn drop-constraint-project [db cache-id]
  (drop-all-constraint db {:cache cache-id
                           :table "project"
                           :json "projects.json"
                           :child ["project_action"
                                   "project_action_detail"
                                   "project_country"
                                   "project_tag"]}))

;; country updater
(defn country-id-updater [db cache-id mapping-file {:keys [revert?]}]
  (let [table (seeder.db/get-foreign-key db {:table "country"})
        new-map-list (mapv (fn [i] {:new_id (if revert? (-> i first name read-string) (-> i second))
                                    :old_id (if revert? (-> i second) (-> i first name read-string))})
                           mapping-file)]
    (write-cache table cache-id)
    (doseq [query (:deps table)]
      (seeder.db/drop-constraint db query)
      (println (str "Updating " (:col query) " on " (:tbl query)))
      (let [changed (atom nil)]
        (doseq [option new-map-list]
          (let [exclude-rows {:exclude @changed}
                rows (seeder.db/update-foreign-value
                      db
                      (merge query option exclude-rows))]
            (swap! changed #(apply conj % (map :id rows)))))))
    (jdbc/execute! db ["TRUNCATE TABLE country_group_country"])
    (jdbc/execute! db ["TRUNCATE TABLE country"])
    (println (str "Ref country removed"))))

;; initiative country updater

(defn new-initiative-country-id [[k v] mapping]
  (assoc {} (keyword (str (get mapping k))) v))

(defn remap-initiative-country-objects [v mapping]
  (cond
    (sequential? v)
    (mapv #(new-initiative-country-id (-> % first) mapping) v)
    (map? v)
    (new-initiative-country-id (first v) mapping)
    :else v))

(defn transform-initiative-query [row mapping]
  (reduce into row
          (map #(assoc {} % (remap-initiative-country-objects (-> row %) mapping))
               [:q23 :q24_2 :q24_4])))

(defn update-initiative-country [db mapping]
  (doseq [query (map #(transform-initiative-query % mapping)
                     (seeder.db/get-initiative-country-values db))]
    (db.initiative/update-initiative db query)))

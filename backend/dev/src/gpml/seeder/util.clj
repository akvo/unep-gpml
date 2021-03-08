(ns gpml.seeder.util
  (:require [gpml.seeder.db :as seeder.db]
            [jsonista.core :as j]))

(def ^:private json-path "dev/resources/files/")
(def ^:private cache-file (str json-path "cache-seed.json"))

(defn parse-json [json-file]
  (j/read-value
    (slurp json-file)
    j/keyword-keys-object-mapper))

(defn write-cache [data]
  (let [fl (java.io.File. cache-file)]
    (j/write-value fl data)))

(defn get-id-from-json [json-file]
  (mapv #(:id %) (parse-json (str json-path json-file))))

(defn read-cache []
  (parse-json cache-file))

(defn drop-all-constraint [db data]
  (let [table (seeder.db/get-foreign-key db data)
        ids (get-id-from-json (:json data))]
    (write-cache table)
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

(defn revert-constraint [db]
  (let [table (read-cache)]
    (doseq [query (:deps table)]
      (seeder.db/add-constraint db query))
    (seeder.db/set-default-sequence db table)
  (println (str "Ref " (:tbl table) " added"))))

(defn drop-constraint-country [db]
  (drop-all-constraint db {:table "country"
                           :json "countries.json"}))

(defn drop-constraint-country-group [db]
  (drop-all-constraint db {:table "country_group"
                           :json "country_group.json"
                           :child ["country_group_country"]}))

(defn drop-constraint-organisation [db]
  (drop-all-constraint db {:table "organisation"
                           :json "organisations_new.json"
                           :child ["organisation_geo_coverage"]}))

(defn drop-constraint-policy [db]
  (drop-all-constraint db {:table "policy"
                           :json "policies.json"
                           :child ["policy_geo_coverage"
                                   "policy_language_url"
                                   "policy_tag"]}))

(defn drop-constraint-resource [db]
  (drop-all-constraint db {:table "resource"
                           :json "resources.json"
                           :child ["resource_geo_coverage"
                                   "resource_language_url"
                                   "resource_organisation"
                                   "resource_tag"]}))

(defn drop-constraint-technology [db]
  (drop-all-constraint db {:table "technology"
                           :json "technologies.json"
                           :child ["technology_geo_coverage"
                                   "technology_language_url"
                                   "technology_tag"]}))

(defn drop-constraint-event [db]
  (drop-all-constraint db {:table "event"
                           :json "events.json"
                           :child ["event_geo_coverage"
                                   "event_language_url"
                                   "event_tag"]}))

(defn drop-constraint-project [db]
  (drop-all-constraint db {:table "project"
                           :json "projects.json"
                           :child ["project_action"
                                   "project_action_detail"
                                   "project_country"
                                   "project_tag"]}))

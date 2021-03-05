(ns gpml.seeder.util
  (:require [gpml.seeder.db :as seeder.db]
            [jsonista.core :as j]))

(defn write-cache [data]
  (let [fl (java.io.File. "dev/resources/files/cache-seed.json")]
    (j/write-value fl data)))

(defn read-cache []
  (j/read-value
    (slurp "dev/resources/files/cache-seed.json")
    j/keyword-keys-object-mapper))

(defn drop-all-constraint [db data]
  (let [table (seeder.db/get-foreign-key db data)]
    (write-cache table)
    (doseq [query (:deps table)]
      (prn query)
      (seeder.db/drop-constraint db query))
    (doseq [child-query (:child data)]
      (seeder.db/truncate db child-query))
    (seeder.db/dissoc-sequence db table)
    (doseq [child-query (:child data)]
      (seeder.db/set-sequence db child-query)))
  (println (str "Ref " (:table data) " removed")))

(defn revert-constraint [db]
  (let [table (read-cache)]
    (seeder.db/set-sequence db table)
    (doseq [query (:deps table)]
      (seeder.db/add-constraint db query))
    (seeder.db/set-default-sequence db table)
  (println (str "Ref " (:tbl table) " added"))))

(defn drop-constraint-country [db]
  (drop-all-constraint db {:table "country"
                           :child [{:tbl "country_group_country"
                                    :tbl_seq "country_group_country_id_seq"}]}))

(defn drop-constraint-country-group [db]
  (drop-all-constraint db {:table "country_group"
                           :child [{:tbl "country_group_country"
                                    :tbl_seq "country_group_country_id_seq"}]}))

(defn drop-constraint-organisation [db]
  (drop-all-constraint db {:table "organisation"
                           :child [{:tbl "organisation_geo_coverage"
                                    :tbl_seq "organisation_geo_coverage_id_seq"}]}))

(defn drop-constraint-policy [db]
  (drop-all-constraint db {:table "policy"
                           :child [{:tbl "policy_geo_coverage"
                                    :tbl_seq "policy_geo_coverage_id_seq"}
                                   {:tbl "policy_language_url"
                                    :tbl_seq "policy_language_url_id_seq"}
                                   {:tbl "policy_tag"
                                    :tbl_seq "policy_tag_id_seq"}]}))

(defn drop-constraint-resource [db]
  (drop-all-constraint db {:table "resource"
                           :child [{:tbl "resource_geo_coverage"
                                    :tbl_seq "resource_geo_coverage_id_seq"}
                                   {:tbl "resource_language_url"
                                    :tbl_seq "resource_language_url_id_seq"}
                                   {:tbl "resource_organisation"
                                    :tbl_seq "resource_organisation_id_seq"}
                                   {:tbl "resource_tag"
                                    :tbl_seq "resource_tag_id_seq"}]}))

(defn drop-constraint-technology [db]
  (drop-all-constraint db {:table "technology"
                           :child [{:tbl "technology_geo_coverage"
                                    :tbl_seq "technology_geo_coverage_id_seq"}
                                   {:tbl "technology_language_url"
                                    :tbl_seq "technology_language_url_id_seq"}
                                   {:tbl "technology_tag"
                                    :tbl_seq "technology_tag_id_seq"}]}))

(defn drop-constraint-project [db]
  (drop-all-constraint db {:table "project"
                           :child [{:tbl "project_action"
                                    :tbl_seq "project_action_id_seq"}
                                   {:tbl "project_action_detail"
                                    :tbl_seq "project_action_detail_id_seq"}
                                   {:tbl "project_country"
                                    :tbl_seq "project_country_id_seq"}
                                   {:tbl "project_tag"
                                    :tbl_seq "project_tag_id_seq"}]}))

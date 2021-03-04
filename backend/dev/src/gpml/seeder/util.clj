(ns gpml.seeder.util
  (:require [gpml.seeder.snippet :as db.snip]
            [gpml.seeder.main :as m]
            [jsonista.core :as j]))

(defn write-cache [data]
  (let [fl (java.io.File. "dev/resources/files/cache-seed.json")]
    (j/write-value fl data)))

(defn read-cache []
  (j/read-value
    (slurp "dev/resources/files/cache-seed.json")
    j/keyword-keys-object-mapper))

(defn drop-all-constraint [db data]
  (let [table (db.snip/get-foreign-key db data)]
    (write-cache table)
    (doseq [query (:deps table)]
      (prn query)
      (db.snip/drop-constraint db query))
    (doseq [child-query (:child data)]
      (db.snip/truncate db child-query))
    (db.snip/dissoc-sequence db table)
    (doseq [child-query (:child data)]
      (db.snip/set-sequence db child-query)))
  (println (str "Ref " (:table data) " removed")))

(defn revert-constraint [db]
  (let [table (read-cache)]
    (db.snip/set-sequence db table)
    (doseq [query (:deps table)]
      (db.snip/add-constraint db query))
    (db.snip/set-default-sequence db table)
  (println (str "Ref " (:tbl table) " added"))))

(defn drop-constraint-organisation [db]
  (drop-all-constraint db {:table "organisation"
                           :child [{:tbl "organisation_geo_coverage"
                                    :tbl_seq "organisation_geo_coverage_id_seq"}]}))

(defn drop-constraint-country [db]
  (drop-all-constraint db {:table "country"
                           :child [{:tbl "country_group_country"
                                    :tbl_seq "country_group_country_id_seq"}]}))


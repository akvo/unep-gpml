(ns gpml.seeder.util
  (:require [gpml.seeder.snippet :as db.snip]))

(def query-organisation
  (map (fn [x] (db.snip/prepare x "organisation"))
       [{:table "organisation_geo_coverage"}
        {:table "resource_organisation"}
        {:table "stakeholder" :column "affiliation"}
        {:table "stakeholder_organisation"}]))

(def query-country
  (map (fn [x] (db.snip/prepare x "country"))
       [{:table "country_group_country"}
        {:table "stakeholder"}
        {:table "stakeholder_geo_coverage"}
        {:table "event"}
        {:table "event_geo_coverage"}
        {:table "policy"}
        {:table "policy_geo_coverage"}
        {:table "technology"}
        {:table "technology_geo_coverage"}
        {:table "resource"}
        {:table "resource_geo_coverage"}
        {:table "organisation"}
        {:table "organisation_geo_coverage"}
        {:table "project_country"}]))

(defn drop-constraint-organisation [db]
  (doseq [query query-organisation]
    (db.snip/drop-constraint db query))
  (db.snip/truncate db {:table "organisation_geo_coverage"})
  (db.snip/dissoc-sequence db {:table "organisation"})
  (db.snip/set-sequence db {:table "organisation_geo_coverage" :seq "organisation_geo_coverage_id_seq"})
  (println "Organisation Refferences Dropped"))

(defn add-constraint-organisation [db]
  (db.snip/set-sequence db {:table "organisation" :seq "organisation_id_seq"})
  (db.snip/set-default-sequence db {:table "organisation" :seq "organisation_id_seq"})
  (doseq [query query-organisation]
    (db.snip/add-constraint db query))
  (println "Organisation Refferences Added"))

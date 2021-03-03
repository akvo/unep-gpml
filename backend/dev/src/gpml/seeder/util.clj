(ns gpml.seeder.util
  (:require [hugsql.core :as hugsql]
            [clojure.string :as str]
            [gpml.seeder.util :as self]
            [clojure.java.jdbc :as jdbc]))

(hugsql/def-db-fns "gpml/seeder/util.sql")

(defn set-default-sequence [db param]
  (let [query (str "ALTER TABLE " (:table param) " ALTER COLUMN id SET DEFAULT ")
        query (str query "nextval('" (:seq param) "');")]
  (jdbc/execute! db query)))

(defn prepare [param target]
  (let [k (if (:column param) (:column param) target)]
  (assoc param :key (str/join "_" [(:table param) k "fkey"]) :target target :column k)))

(def get-query-organisation
  (map (fn [x] (prepare x "organisation")) [{:table "organisation_geo_coverage"}
                                            {:table "resource_organisation"}
                                            {:table "stakeholder" :column "affiliation"}
                                            {:table "stakeholder_organisation"}]))

(defn drop-constraint-organisation [db]
  (doseq [query get-query-organisation]
    (prn "good")
    (self/drop-constraint db query))
  (self/truncate db {:table "organisation_geo_coverage"})
  (self/dissoc-sequence db {:table "organisation"})
  (self/set-sequence db {:table "organisation_geo_coverage" :seq "organisation_geo_coverage_id_seq"})
  (prn "Organisation Refferences Dropped"))

(defn add-constraint-organisation [db]
  (self/set-sequence db {:table "organisation" :seq "organisation_id_seq"})
  (set-default-sequence db {:table "organisation" :seq "organisation_id_seq"})
  (doseq [query get-query-organisation]
    (prn "good")
    (self/add-constraint db query))
  (prn "Organisation Refferences Added"))

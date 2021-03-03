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

(defn prepare [param]
  (let [target (if (:column param) (:column param) (:target param))]
  (assoc param :key (str/join "_" [(:table param) target "fkey"]))))

(defn drop-constraint-organisation [db]
  (self/drop-constraint db (prepare {:table "resource_organisation"
                                     :target "organisation"}))
  (self/drop-constraint db (prepare {:table "stakeholder"
                                     :target "affiliation"}))
  (self/drop-constraint db (prepare {:table "stakeholder_organisation"
                                     :target "organisation"}))
  (self/drop-constraint db (prepare {:table "organisation_geo_coverage"
                                     :target "organisation"}))
  (self/truncate db {:table "organisation_geo_coverage"})
  (self/dissoc-sequence db {:table "organisation"})
  (self/set-sequence db {:table "organisation_geo_coverage" :seq "organisation_geo_coverage_id_seq"})
  (prn "Organisation Refferences Dropped"))

(defn add-constraint-organisation [db]
  (self/set-sequence db {:table "organisation" :seq "organisation_id_seq"})
  (set-default-sequence db {:table "organisation" :seq "organisation_id_seq"})
  (prn "good 1")
  (self/add-constraint db (prepare {:table "organisation_geo_coverage"
                                     :target "organisation"
                                     :column "organisation"}))
  (prn "good 1")
  (self/add-constraint db (prepare {:table "resource_organisation"
                                    :target "organisation"
                                    :column "organisation"}))
  (prn "good 1")
  (self/add-constraint db (prepare {:table "stakeholder"
                                    :target "organisation"
                                    :column "affiliation"}))
  (prn "good 1")
  (self/add-constraint db (prepare {:table "stakeholder_organisation"
                                    :target "organisation"
                                    :column "organisation"}))
  (prn "good 1")
  (prn "Organisation Refferences Added"))

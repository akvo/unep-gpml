(ns gpml.db.case-study
  {:ns-tracker/resource-deps ["case_study.sql"]}
  (:require [gpml.util :as util]
            [gpml.util.sql :as sql-util]
            [hugsql.core :as hugsql]))

(declare create-case-studies)

(hugsql/def-db-fns "gpml/db/case_study.sql")

(defn case-study->db-case-study
  "Transform case study to be ready to be persisted in DB

   We want to have a specific function for this, since thus we can keep untouched
   the canonical entity representation."
  [case-study]
  (-> case-study
      (util/update-if-not-nil :geo_coverage_type #(sql-util/keyword->pg-enum % "geo_coverage_type"))
      (util/update-if-not-nil :review_status #(sql-util/keyword->pg-enum % "review_status"))
      (util/update-if-not-nil :source #(sql-util/keyword->pg-enum % "resource_source"))
      (util/update-if-not-nil :language name)))

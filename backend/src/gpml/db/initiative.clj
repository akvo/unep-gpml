(ns gpml.db.initiative
  {:ns-tracker/resource-deps ["initiative.sql"]}
  (:require [gpml.util :as util]
            [gpml.util.postgresql :as pg-util]
            [gpml.util.sql :as sql-util]
            [hugsql.core :as hugsql]))

(declare new-initiative
         initiative-by-id
         update-initiative
         add-initiative-tags
         create-initiatives
         get-initiatives)

(hugsql/def-db-fns "gpml/db/initiative.sql" {:quoting :ansi})

(defn initiative->db-initiative
  "Apply transformations to Initiative entity fields to database specific
  types.

  FIXME: Not all JSONB initiative fields are parsed here. They are
  mostly likely going to be removed in future iterations."
  [initiative]
  (-> initiative
      (util/update-if-not-nil :q2 pg-util/val->jsonb)
      (util/update-if-not-nil :q3 pg-util/val->jsonb)
      (util/update-if-not-nil :q36 pg-util/val->jsonb)
      (util/update-if-not-nil :brs_api_modified sql-util/instant->sql-timestamp)
      (util/update-if-not-nil :start_date sql-util/instant->sql-timestamp)
      (util/update-if-not-nil :end_date sql-util/instant->sql-timestamp)
      (util/update-if-not-nil :geo_coverage_type sql-util/keyword->pg-enum "geo_coverage_type")
      (util/update-if-not-nil :review_status sql-util/keyword->pg-enum "review_status")
      (util/update-if-not-nil :source #(sql-util/keyword->pg-enum % "resource_source"))))

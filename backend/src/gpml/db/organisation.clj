(ns gpml.db.organisation
  {:ns-tracker/resource-deps ["organisation.sql"]}
  (:require [gpml.util :as util]
            [gpml.util.sql :as sql-util]
            [hugsql.core :as hugsql]))

(declare update-organisation
         organisation-by-id
         all-public-entities
         all-public-non-member-entities
         all-non-members
         new-organisation
         all-members
         organisation-tags
         geo-coverage-v2
         get-organisation-files-to-migrate
         get-organisations)

(hugsql/def-db-fns "gpml/db/organisation.sql" {:quoting :ansi})

(defn organisation->db-organisation
  "Apply transformations to Organisation entity fields to database specific
  types."
  [resource]
  (-> resource
      (util/update-if-not-nil :geo_coverage_type sql-util/keyword->pg-enum "geo_coverage_type")
      (util/update-if-not-nil :review_status sql-util/keyword->pg-enum "review_status")))

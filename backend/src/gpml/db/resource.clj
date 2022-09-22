(ns gpml.db.resource
  (:require [gpml.util :as util]
            [gpml.util.sql :as sql-util]
            [hugsql.core :as hugsql]))

(declare create-resources
         new-resource
         add-resource-geo
         add-resource-language-urls
         resource-by-id
         get-resources
         update-resource)

(hugsql/def-db-fns "gpml/db/resource.sql" {:quoting :ansi})

(defn resource->db-resource
  "Apply transformations to Resource entity fields to database specific
  types."
  [resource]
  (-> resource
      (util/update-if-not-nil :brs_api_modified sql-util/instant->sql-timestamp)
      (util/update-if-not-nil :geo_coverage_type sql-util/keyword->pg-enum "geo_coverage_type")
      (util/update-if-not-nil :review_status sql-util/keyword->pg-enum "review_status")))

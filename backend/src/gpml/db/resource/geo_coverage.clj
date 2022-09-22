(ns gpml.db.resource.geo-coverage
  {:ns-tracker/resource-deps ["resource/geo_coverage.sql"]}
  (:require [hugsql.core :as hugsql]))

(declare create-resource-geo-coverage
         delete-resource-geo-coverage
         get-resource-geo-coverage)

(hugsql/def-db-fns "gpml/db/resource/geo_coverage.sql" {:quoting :ansi})

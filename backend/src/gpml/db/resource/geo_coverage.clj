(ns gpml.db.resource.geo-coverage
  {:ns-tracker/resource-deps ["resource/geo_coverage.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/resource/geo_coverage.sql" {:quoting :ansi})

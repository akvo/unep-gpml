(ns gpml.db.project.geo-coverage
  {:ns-tracker/resource-deps ["project/geo_coverage.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/project/geo_coverage.sql")

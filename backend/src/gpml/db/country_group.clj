(ns gpml.db.country-group
  {:ns-tracker/resource-deps ["country-group.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/country-group.sql")

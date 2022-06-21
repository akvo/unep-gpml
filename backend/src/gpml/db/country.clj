(ns gpml.db.country
  {:ns-tracker/resource-deps ["country.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/country.sql")

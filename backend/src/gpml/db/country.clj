(ns gpml.db.country
  {:ns-tracker/resource-deps ["country.sql"]}
  (:require [hugsql.core :as hugsql]))

(declare new-country
         get-countries
         add-country-headquarter)

(hugsql/def-db-fns "gpml/db/country.sql")

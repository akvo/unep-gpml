(ns gpml.db.country-group
  {:ns-tracker/resource-deps ["country_group.sql"]}
  (:require [hugsql.core :as hugsql]))

(declare new-country-group
         all-country-groups
         country-group-detail
         country-group-by-name
         country-group-by-names
         country-group-by-id
         get-country-groups-by-type
         new-country-group-country
         get-country-groups-countries
         get-country-groups-by-countries
         get-country-groups)

(hugsql/def-db-fns "gpml/db/country_group.sql")

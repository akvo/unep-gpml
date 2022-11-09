(ns gpml.db.country-state
  {:ns-tracker/resource-deps ["country_state.sql"]}
  (:require [hugsql.core :as hugsql]))

(declare create-country-states
         get-country-states)

(hugsql/def-db-fns "gpml/db/country_state.sql")

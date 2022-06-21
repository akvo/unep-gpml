(ns gpml.db.currency
  {:ns-tracker/resource-deps ["currency.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/currency.sql")

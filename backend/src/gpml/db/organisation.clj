(ns gpml.db.organisation
  {:ns-tracker/resource-deps ["organisation.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/organisation.sql")

(ns gpml.db.stakeholder
  {:ns-tracker/resource-deps ["stakeholder.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/stakeholder.sql")

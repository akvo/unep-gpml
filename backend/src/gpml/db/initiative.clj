(ns gpml.db.initiative
  {:ns-tracker/resource-deps ["initiative.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/initiative.sql")

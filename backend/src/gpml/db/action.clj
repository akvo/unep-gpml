(ns gpml.db.action
  {:ns-tracker/resource-deps ["action.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/action.sql")

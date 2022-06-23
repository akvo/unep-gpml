(ns gpml.db.activity
  {:ns-tracker/resource-deps ["activity.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/activity.sql")

(ns gpml.db.technology
  {:ns-tracker/resource-deps ["technology.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/technology.sql")

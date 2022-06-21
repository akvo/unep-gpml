(ns gpml.db.detail
  {:ns-tracker/resource-deps ["detail.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/detail.sql")

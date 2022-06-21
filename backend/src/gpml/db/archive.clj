(ns gpml.db.archive
  {:ns-tracker/resource-deps ["archive.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/archive.sql")

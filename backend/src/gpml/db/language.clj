(ns gpml.db.language
  {:ns-tracker/resource-deps ["language.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/language.sql")

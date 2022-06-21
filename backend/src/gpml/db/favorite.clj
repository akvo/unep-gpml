(ns gpml.db.favorite
  {:ns-tracker/resource-deps ["favorite.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/favorite.sql")

(ns gpml.db.favorite
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/favorite.sql")

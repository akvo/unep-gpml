(ns gpml.db.country-group
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/country-group.sql")

(ns gpml.db.country
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/country.sql")

(ns gpml.constraint.country
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/constraint/country.sql")

(ns gpml.constraint.organisation
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/constraint/organisation.sql")

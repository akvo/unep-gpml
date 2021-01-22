(ns gpml.db.stakeholder
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/stakeholder.sql")

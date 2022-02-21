(ns gpml.db.stakeholder-association
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/stakeholder_association.sql")

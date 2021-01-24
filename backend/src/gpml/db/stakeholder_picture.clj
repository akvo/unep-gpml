(ns gpml.db.stakeholder-picture
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/stakeholder_picture.sql")

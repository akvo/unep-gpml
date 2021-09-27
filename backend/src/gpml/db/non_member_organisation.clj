(ns gpml.db.non-member-organisation
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/non-member-organisation.sql")

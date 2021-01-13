(ns gpml.db.organisation
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/organisation.sql")

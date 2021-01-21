(ns gpml.db.action
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/action.sql")

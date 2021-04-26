(ns gpml.db.initiative
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/initiative.sql")

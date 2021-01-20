(ns gpml.db.technology
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/technology.sql")

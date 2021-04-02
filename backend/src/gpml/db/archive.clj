(ns gpml.db.archive
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/archive.sql")

(ns gpml.db.project
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/project.sql")

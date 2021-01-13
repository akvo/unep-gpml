(ns gpml.db.tag
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/tag.sql")

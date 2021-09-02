(ns gpml.db.browse
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/browse.sql")

(ns gpml.db.detail
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/detail.sql")

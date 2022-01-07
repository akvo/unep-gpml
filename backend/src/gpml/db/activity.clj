(ns gpml.db.activity
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/activity.sql")

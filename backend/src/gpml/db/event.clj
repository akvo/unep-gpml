(ns gpml.db.event
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/event.sql")

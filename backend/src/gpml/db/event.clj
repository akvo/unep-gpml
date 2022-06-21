(ns gpml.db.event
  {:ns-tracker/resource-deps ["event.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/event.sql")

(ns gpml.db.resource.connection
  {:ns-tracker/resource-deps ["resource/connection.sql"]}
  (:require
   [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/resource/connection.sql")

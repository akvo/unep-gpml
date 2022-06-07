(ns gpml.db.resource.connection
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/resource/connection.sql")

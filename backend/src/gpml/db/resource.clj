(ns gpml.db.resource
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/resource.sql")

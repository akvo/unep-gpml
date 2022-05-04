(ns gpml.db.resource.tag
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/resource/tag.sql")

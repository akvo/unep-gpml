(ns gpml.db.resource.related-content
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/resource/related_content.sql")

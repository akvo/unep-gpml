(ns gpml.db.resource.tag
  {:ns-tracker/resource-deps ["resource/tag.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/resource/tag.sql" {:quoting :ansi})

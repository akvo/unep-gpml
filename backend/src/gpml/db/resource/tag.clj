(ns gpml.db.resource.tag
  {:ns-tracker/resource-deps ["resource/tag.sql"]}
  (:require [hugsql.core :as hugsql]))

(declare create-resource-tags
         ;; TODO: deprecated the original function
         ;; `create-resource-tags` in favor of the one below. It uses
         ;; a more generic approach.
         create-resource-tags-v2
         get-tags-from-resources
         get-resource-tags
         delete-resource-tags)

(hugsql/def-db-fns "gpml/db/resource/tag.sql" {:quoting :ansi})

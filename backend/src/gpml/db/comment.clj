(ns gpml.db.comment
  {:ns-tracker/resource-deps ["comment.sql"]}
  (:require [hugsql.core :as hugsql]))

(declare create-comment
         update-comment
         get-resource-comments
         delete-comment)

(hugsql/def-db-fns "gpml/db/comment.sql" {:quoting :ansi})

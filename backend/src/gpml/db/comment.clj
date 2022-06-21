(ns gpml.db.comment
  {:ns-tracker/resource-deps ["comment.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/comment.sql" {:quoting :ansi})

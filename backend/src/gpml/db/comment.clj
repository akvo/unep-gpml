(ns gpml.db.comment
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/comment.sql" {:quoting :ansi})

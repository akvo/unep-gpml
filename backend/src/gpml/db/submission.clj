(ns gpml.db.submission
  {:ns-tracker/resource-deps ["submission.sql"]}
  (:require [hugsql.core :as hugsql]))

(declare pages
         detail
         update-submission)

(hugsql/def-db-fns "gpml/db/submission.sql")

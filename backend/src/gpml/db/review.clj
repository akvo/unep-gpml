(ns gpml.db.review
  {:ns-tracker/resource-deps ["review.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/review.sql")

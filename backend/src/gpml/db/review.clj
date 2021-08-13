(ns gpml.db.review
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/review.sql")

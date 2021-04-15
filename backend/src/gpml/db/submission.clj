(ns gpml.db.submission
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/submission.sql")

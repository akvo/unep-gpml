(ns gpml.db.policy
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/policy.sql")

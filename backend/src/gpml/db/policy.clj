(ns gpml.db.policy
  {:ns-tracker/resource-deps ["policy.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/policy.sql")

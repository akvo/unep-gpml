(ns gpml.db.action-detail
  {:ns-tracker/resource-deps ["action_detail.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/action_detail.sql")

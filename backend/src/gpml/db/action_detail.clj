(ns gpml.db.action-detail
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/action_detail.sql")

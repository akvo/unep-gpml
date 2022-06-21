(ns gpml.db.invitation
  {:ns-tracker/resource-deps ["invitation.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/invitation.sql")

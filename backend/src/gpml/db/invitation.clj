(ns gpml.db.invitation
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/invitation.sql")

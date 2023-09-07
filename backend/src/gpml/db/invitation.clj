(ns gpml.db.invitation
  {:ns-tracker/resource-deps ["invitation.sql"]}
  (:require [hugsql.core :as hugsql]))

(declare create-invitations
         get-invitations
         accept-invitation)

(hugsql/def-db-fns "gpml/db/invitation.sql" {:quoting :ansi})

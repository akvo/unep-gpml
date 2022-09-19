(ns gpml.db.resource.connection
  {:ns-tracker/resource-deps ["resource/connection.sql"]}
  (:require [gpml.util :as util]
            [gpml.util.sql :as sql-util]
            [hugsql.core :as hugsql]))

(declare get-resource-stakeholder-connections
         get-resource-entity-connections
         create-resource-connections
         get-resource-connections)

(hugsql/def-db-fns "gpml/db/resource/connection.sql")

(defn connection->db-connection
  "FIXME"
  [connection association-type]
  (util/update-if-not-nil connection :association sql-util/keyword->pg-enum association-type))

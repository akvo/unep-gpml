(ns gpml.db.rbac-util
  {:ns-tracker/resource-deps ["rbac_util.sql"]}
  (:require [hugsql.core :as hugsql]))

(declare get-users-with-granted-permission-on-resource
         unassign-all-roles)

(hugsql/def-db-fns "gpml/db/rbac_util.sql")

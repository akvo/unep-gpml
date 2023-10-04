(ns gpml.db.plastic-strategy.group
  {:ns-tracker/resource-deps ["plastic_strategy/group.sql"]}
  (:require [gpml.db.jdbc-util :as jdbc-util]
            [hugsql.core :as hugsql]))

(declare assign-user-to-group*
         unassign-user-from-group*)

(hugsql/def-db-fns "gpml/db/plastic_strategy/group.sql")

(defn assign-user-to-ps-group
  [conn ps-group-assignment]
  (jdbc-util/with-constraint-violation-check
    [{:type :unique
      :name "plastic_strategy_group_assignment_pkey"
      :error-reason :already-exists}]
    (assign-user-to-group* conn ps-group-assignment)
    {:success? true}))

(defn unassign-user-from-group
  [conn ps-group-unassignment]
  (try
    (unassign-user-from-group* conn ps-group-unassignment)
    {:success? true}
    (catch Throwable t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

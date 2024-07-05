(ns gpml.db.like
  #:ns-tracker{:resource-deps ["like.sql"]}
  (:require
   [hugsql.core :as hugsql]))

(declare create-like delete-like)

(hugsql/def-db-fns "gpml/db/like.sql")

(def table-rename-mapping
  {"financing_resource" "resource"
   "action_plan" "resource"
   "technical_resource" "resource"})

(defn generate-sql-into [{:keys [resource-type]}]
  (format "%1$s_like (%1$s_id, stakeholder_id)"
          (get table-rename-mapping
               resource-type
               resource-type)))

(defn generate-delete-from [{:keys [resource-type]}]
  (format "%s_like"
          (get table-rename-mapping
               resource-type
               resource-type)))

(defn generate-delete-where [{:keys [resource-type]}]
  (format "%s_id = :resource-id AND stakeholder_id = :stakeholder-id"
          (get table-rename-mapping
               resource-type
               resource-type)))

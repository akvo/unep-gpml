(ns gpml.db.stakeholder-association
  (:require [hugsql.core :as hugsql]))

(declare get-stakeholder-resource-association get-stakeholder-associated-topics)

(hugsql/def-db-fns "gpml/db/stakeholder_association.sql")

(defn generate-stakeholder-association-query
  "Generate the SQL statement for resource association tables of
  stakeholder (i.e., `stakeholder_policy`, `stakeholder_event`, etc.)"
  [{:keys [resource-type resource-id association stakeholder-id]}]
  (let [where-cond (cond-> ""
                     resource-id
                     (str " AND " resource-type " = :resource-id")

                     association
                     (str " AND association = :association::" resource-type "_association")

                     stakeholder-id
                     (str " AND stakeholder = :stakeholder-id"))]
    (apply format "SELECT se.*, row_to_json(e.*) AS resource FROM stakeholder_%s se
                   JOIN %s e ON e.id = se.%s
                   %s;"
           (concat (repeat 3 resource-type) [(if (seq where-cond)
                                               (str "WHERE 1=1 " where-cond)
                                               "")]))))

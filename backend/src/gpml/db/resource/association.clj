(ns gpml.db.resource.association
  {:ns-tracker/resource-deps ["resource/association.sql"]}
  (:require [hugsql.core :as hugsql]))

(declare get-resource-associations
         create-stakeholder-association
         create-organisation-association
         update-stakeholder-association
         update-organisation-association
         delete-stakeholder-associations
         delete-organisation-associations
         get-sth-org-focal-point-resources-associations
         get-all-organisation-owner-associations
         all-organisation-resource-owner-associations-query
         get-orgs-focal-points-associations-on-resource)

(hugsql/def-db-fns "gpml/db/resource/association.sql" {:quoting :ansi})

(defn get-all-organisation-owner-associations*
  [conn {:keys [org-id]}]
  (get-all-organisation-owner-associations
   conn
   {:org-id org-id
    :all-organisation-resource-owner-associations-query
    (all-organisation-resource-owner-associations-query {})}))

(defn get-sth-org-focal-point-resources-associations*
  [conn opts]
  (get-sth-org-focal-point-resources-associations
   conn
   (merge
    opts
    {:all-organisation-resource-owner-associations-query
     (all-organisation-resource-owner-associations-query {})})))

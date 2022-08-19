(ns gpml.db.policy
  {:ns-tracker/resource-deps ["policy.sql"]}
  (:require [gpml.util :as util]
            [gpml.util.postgresql :as pg-util] ;; TODO: Merge this ns with sql-util one.
            [gpml.util.sql :as sql-util]
            [hugsql.core :as hugsql]
            [java-time :as jt]
            [java-time.core]
            [java-time.local]
            [java-time.temporal]))

(declare language-by-policy-id
         new-policy
         add-policies-geo
         create-policies
         delete-policies-geo
         filtered-policies
         policy-by-id)

(hugsql/def-db-fns "gpml/db/policy.sql")

(defn policy->db-policy
  "Transform policy to be ready to be persisted in DB

   We want to have a specific function for this, since thus we can keep untouched
   the canonical entity representation."
  [policy]
  (-> policy
      (util/update-if-exists :geo_coverage_type #(sql-util/keyword->pg-enum % "geo_coverage_type"))
      (util/update-if-exists :review_status #(sql-util/keyword->pg-enum % "review_status"))
      (util/update-if-exists :leap_api_modified #(sql-util/instant->sql-timestamp %))
      (util/update-if-exists :first_publication_date jt/sql-date)
      (util/update-if-exists :latest_amendment_date jt/sql-date)
      (util/update-if-exists :attachments sql-util/coll->pg-jsonb)
      (util/update-if-exists :topics #(pg-util/->JDBCArray % "text"))
      (dissoc :tags)))

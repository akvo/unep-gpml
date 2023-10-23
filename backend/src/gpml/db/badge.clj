(ns gpml.db.badge
  {:ns-tracker/resource-deps ["badge.sql"]}
  (:require [gpml.db.jdbc-util :as jdbc-util]
            [gpml.util :as util]
            [gpml.util.sql :as sql-util]
            [hugsql.core :as hugsql]))

(declare create-badge*
         delete-badge*
         get-badge-by-name*)

(hugsql/def-db-fns "gpml/db/badge.sql")

(defn badge->db-badge
  "Transform badge to be ready to be persisted in DB

   We want to have a specific function for this, since thus we can keep untouched
   the canonical entity representation."
  [badge]
  (-> badge
      (util/update-if-not-nil :type #(sql-util/keyword->pg-enum % "badge_type"))))

(defn delete-badge
  [conn badge-id]
  (try
    (let [affected (delete-badge*
                    conn
                    {:id badge-id})]
      (if (= 1 affected)
        {:success? true}
        {:success? false
         :reason :not-found}))
    (catch Throwable t
      {:success? false
       :error-details {:ex-message (ex-message t)}})))

(defn create-badge
  [conn badge]
  (try
    (jdbc-util/with-constraint-violation-check
      [{:type :unique
        :name "badge_name_key"
        :error-reason :already-exists}]
      {:success? true
       :id (:id (create-badge* conn badge))})
    (catch Throwable t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn get-badge-by-name
  [conn opts]
  (try
    (let [badge (get-badge-by-name*
                 conn
                 opts)]
      (if (seq badge)
        {:success? true
         :badge (jdbc-util/db-result-snake-kw->db-result-kebab-kw badge)}
        {:success? false
         :reason :not-found}))
    (catch Throwable t
      {:success? false
       :reason :exception
       :error-details (ex-message t)})))

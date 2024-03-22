(ns gpml.db.badge
  #:ns-tracker{:resource-deps ["badge.sql"]}
  (:require
   [duct.logger :refer [log]]
   [gpml.db.jdbc-util :as jdbc-util]
   [gpml.util :as util]
   [gpml.util.result :refer [failure]]
   [gpml.util.sql :as sql-util]
   [hugsql.core :as hugsql]))

(declare create-badge*
         delete-badge*
         get-badge-by-id-or-name*
         add-badge-assignment*
         remove-badge-assignment*)

(hugsql/def-db-fns "gpml/db/badge.sql")

(defn badge->db-badge
  "Transform badge to be ready to be persisted in DB

   We want to have a specific function for this, since thus we can keep untouched
   the canonical entity representation."
  [badge]
  (-> badge
      (util/update-if-not-nil :type #(sql-util/keyword->pg-enum % "badge_type"))))

(defn- badge-assignment->p-badge-assignment [badge-assignment]
  (-> badge-assignment
      (util/update-if-not-nil :badge-assignment-entity-col name)
      (util/update-if-not-nil :badge-assignment-table name)))

(defn add-badge-assignment [conn badge-assignment entity-type]
  (let [entity-name (name entity-type)]
    (jdbc-util/with-constraint-violation-check [{:type :unique
                                                 :name (format "%s_badge_pkey" entity-name)
                                                 :error-reason :already-exists}
                                                {:type :foreign-key
                                                 :name (format "%s_badge_id_fkey" entity-name)
                                                 :error-reason :badge-not-found}
                                                {:type :foreign-key
                                                 :name (format "%s_badge_%s_id_fkey" entity-name entity-name)
                                                 :error-reason :entity-not-found}]
      (add-badge-assignment* conn (badge-assignment->p-badge-assignment badge-assignment))
      {:success? true})))

(defn remove-badge-assignment [logger conn badge-assignment]
  (try
    (let [p-badge-assignment (badge-assignment->p-badge-assignment badge-assignment)
          affected (remove-badge-assignment* conn p-badge-assignment)]
      (if (= affected 1)
        {:success? true}
        (failure {:reason :unexpected-number-of-affected-rows
                  :error-details {:expected-affected-rows 1
                                  :actual-affected-rows affected}})))
    (catch Exception t
      (log logger :error :could-not-remove-badge-assignment t)
      (failure {:reason :exception
                :error-details {:msg (ex-message t)}}))))

(defn delete-badge [logger conn badge-id]
  (try
    (let [affected (delete-badge*
                    conn
                    {:id badge-id})]
      (if (= 1 affected)
        {:success? true}
        (failure {:reason :not-found})))
    (catch Exception t
      (log logger :error :could-not-delete-badge t)
      (failure {:error-details {:ex-message (ex-message t)}}))))

(defn create-badge [logger conn badge]
  (try
    (jdbc-util/with-constraint-violation-check [{:type :unique
                                                 :name "badge_name_key"
                                                 :error-reason :already-exists}]
      {:success? true
       :id (:id (create-badge* conn badge))})
    (catch Exception t
      (log logger :error :could-not-create-badge t)
      (failure {:reason :exception
                :error-details {:msg (ex-message t)}}))))

(defn get-badge-by-id-or-name [logger conn opts]
  (try
    (let [badge (get-badge-by-id-or-name* conn opts)]
      (if (seq badge)
        {:success? true
         :badge (jdbc-util/db-result-snake-kw->db-result-kebab-kw badge)}
        (failure {:reason :not-found})))
    (catch Exception t
      (log logger :error :could-not-get-badge-by-id-or-name t)
      (failure {:reason :exception
                :error-details (ex-message t)}))))

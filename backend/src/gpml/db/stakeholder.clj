(ns gpml.db.stakeholder
  {:ns-tracker/resource-deps ["stakeholder.sql"]}
  (:require [gpml.db.jdbc-util :as jdbc-util]
            [gpml.util :as util]
            [gpml.util.postgresql :as util.pgsql]
            [gpml.util.sql :as util.sql]
            [hugsql.core :as hugsql]))

(declare delete-stakeholder*
         all-stakeholder
         all-public-stakeholders
         all-public-users
         list-stakeholder-paginated
         count-stakeholder
         get-stakeholder-by-id
         stakeholder-by-id
         stakeholder-by-email
         approved-stakeholder-by-email
         update-stakeholder-status
         new-stakeholder
         update-stakeholder-role
         update-stakeholder
         stakeholder-image-by-id
         new-stakeholder-image
         stakeholder-cv-by-id
         new-stakeholder-cv
         add-stakeholder-geo
         get-admins
         get-suggested-stakeholders
         get-recent-active-stakeholders
         get-experts
         create-stakeholders
         get-stakeholders
         get-stakeholders-files-to-migrate)

(hugsql/def-db-fns "gpml/db/stakeholder.sql" {:quoting :ansi})

(defn- stakeholder->p-stakeholder
  [stakeholder]
  (util/update-if-not-nil stakeholder :review_status util.pgsql/->PGEnum "REVIEW_STATUS"))

(defn delete-stakeholder
  [conn stakeholder-id]
  (try
    (let [affected (delete-stakeholder*
                    conn
                    {:id stakeholder-id})]
      (if (= 1 affected)
        {:success? true}
        {:success? false
         :reason :not-found}))
    (catch Throwable t
      {:success? false
       :error-details {:ex-message (ex-message t)}})))

(defn get-stakeholder
  [conn opts]
  (try
    (let [stakeholders (get-stakeholders
                        conn
                        opts)]
      (if (= (count stakeholders) 1)
        {:success? true
         :stakeholder (jdbc-util/db-result-snake-kw->db-result-kebab-kw (first stakeholders))}
        {:success? false
         :reason :not-found}))
    (catch Throwable t
      {:success? false
       :reason :exception
       :error-details (ex-message t)})))

(defn create-stakeholder
  [conn stakeholder]
  (let [p-stakeholder (stakeholder->p-stakeholder stakeholder)
        cols (util.sql/get-insert-columns-from-entity-col [p-stakeholder])
        values (util.sql/entity-col->persistence-entity-col [p-stakeholder])]
    (jdbc-util/with-constraint-violation-check [{:type :unique
                                                 :name "stakeholder_email_key"
                                                 :error-reason :already-exists}
                                                {:type :unique
                                                 :name "stakeholder_chat_account_id_key"
                                                 :error-reason :already-exists}]
      {:success? true
       :stakeholder (first (create-stakeholders conn {:cols cols
                                                      :values values}))})))

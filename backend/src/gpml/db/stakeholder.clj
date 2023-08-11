(ns gpml.db.stakeholder
  {:ns-tracker/resource-deps ["stakeholder.sql"]}
  (:require [hugsql.core :as hugsql]
            [gpml.db.jdbc-util :as jdbc-util]))

(declare delete-stakeholder*
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
         get-stakeholders)

(hugsql/def-db-fns "gpml/db/stakeholder.sql" {:quoting :ansi})

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

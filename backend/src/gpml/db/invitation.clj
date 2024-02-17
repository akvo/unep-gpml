(ns gpml.db.invitation
  #:ns-tracker{:resource-deps ["invitation.sql"]}
  (:require
   [gpml.db.jdbc-util :as jdbc-util]
   [gpml.util :as util]
   [gpml.util.postgresql :as util.pgsql]
   [gpml.util.sql :as util.sql]
   [hugsql.core :as hugsql]))

(declare create-invitations*
         get-invitations*
         accept-invitation*
         delete-invitation*)

(hugsql/def-db-fns "gpml/db/invitation.sql" {:quoting :ansi})

(defn- p-invitation->invitation
  [p-invitation]
  (util/update-if-not-nil p-invitation :type keyword))

(defn- invitation->p-invitation
  [invitation]
  (util/update-if-not-nil invitation :type util.pgsql/->PGEnum "invitation_type"))

(defn get-invitations [conn opts]
  (try
    {:success? true
     :invitations (->> (get-invitations* conn opts)
                       (jdbc-util/db-result-snake-kw->db-result-kebab-kw)
                       (map p-invitation->invitation))}
    (catch Exception t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn get-invitation [conn opts]
  (try
    (let [{:keys [success? invitations]} (get-invitations conn opts)]
      (if (and success?
               (= (count invitations) 1))
        {:success? true
         :invitation (first invitations)}
        {:success? false
         :reason :not-found}))
    (catch Exception t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn create-invitations [conn invitations]
  (try
    (let [p-invitations (jdbc-util/db-params-kebab-kw->db-params-snake-kw
                         (map invitation->p-invitation invitations))
          cols (util.sql/get-insert-columns-from-entity-col p-invitations)
          values (util.sql/entity-col->persistence-entity-col p-invitations)
          created-invitations (create-invitations* conn {:cols cols
                                                         :values values})]
      (if (= (count created-invitations) (count invitations))
        {:success? true
         :invitations (map p-invitation->invitation created-invitations)}
        {:success? false
         :reason :unexpected-number-of-affected-rows
         :error-details {:expected-affected-rows (count invitations)
                         :actual-affected-rows (count created-invitations)}}))
    (catch Exception t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn create-invitation [conn invitation]
  (try
    (let [result (create-invitations conn [invitation])]
      (if (:success? result)
        {:success? true
         :invitation (first (:invitations result))}
        result))
    (catch Exception t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn accept-invitation [conn invitation-id]
  (try
    (let [affected (accept-invitation* conn {:id invitation-id})]
      (if (= affected 1)
        {:success? true}
        {:success? false
         :reason :unexpected-number-of-affected-rows
         :error-details {:expected-affected-rows 1
                         :actual-affected-rows affected}}))
    (catch Exception t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn delete-invitation [conn invitation-id]
  (try
    (let [affected (delete-invitation* conn {:id invitation-id})]
      (if (= affected 1)
        {:success? true}
        {:success? false
         :reason :unexpected-number-of-affected-rows
         :error-details {:expected-affected-rows 1
                         :actual-affected-rows affected}}))
    (catch Exception t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

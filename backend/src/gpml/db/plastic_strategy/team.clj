(ns gpml.db.plastic-strategy.team
  {:ns-tracker/resource-deps ["plastic_strategy/team.sql"]}
  (:require [gpml.db.jdbc-util :as jdbc-util]
            [gpml.util :as util]
            [gpml.util.postgresql :as util.pgsql]
            [hugsql.core :as hugsql]))

(declare add-ps-team-member*
         update-ps-team-member*
         delete-ps-team-member*
         get-ps-team-members*)

(hugsql/def-db-fns "gpml/db/plastic_strategy/team.sql")

(defn- ps-team-member->p-ps-team-member
  [ps-team-member]
  (-> ps-team-member
      (util/update-if-not-nil :role name)
      (util/update-if-not-nil :teams util.pgsql/->JDBCArray "plastic_strategy_team_type")))

(defn- p-ps-team-member->ps-team-member
  [p-ps-team-member]
  (util/update-if-not-nil p-ps-team-member :role keyword))

(defn add-ps-team-member
  [conn ps-team-member]
  (jdbc-util/with-constraint-violation-check
    [{:type :unique
      :name "plastic_strategy_team_member_pkey"
      :error-reason :already-exists}]
    (add-ps-team-member* conn (ps-team-member->p-ps-team-member ps-team-member))
    {:success? true}))

(defn update-ps-team-member
  [conn ps-team-member-updates]
  (try
    (let [p-ps-team-member-updates (update ps-team-member-updates :updates ps-team-member->p-ps-team-member)
          _ (prn p-ps-team-member-updates)
          affected (update-ps-team-member* conn p-ps-team-member-updates)]
      (if (= affected 1)
        {:success? true}
        {:success? false
         :reason :unexpected-number-of-affected-rows
         :error-details {:expected-affected-rows 1
                         :actual-affected-rows affected}}))
    (catch Throwable t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn delete-ps-team-member
  [conn plastic-strategy-id user-id]
  (try
    (let [affected (delete-ps-team-member* conn
                                           {:plastic-strategy-id plastic-strategy-id
                                            :user-id user-id})]
      (if (= affected 1)
        {:success? true}
        {:success? false
         :reason :unexpected-number-of-affected-rows
         :error-details {:expected-affected-rows 1
                         :actual-affected-rows affected}}))
    (catch Throwable t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn get-ps-team-members
  [conn opts]
  (try
    {:success? true
     :ps-team-members (->> (get-ps-team-members* conn opts)
                           (map p-ps-team-member->ps-team-member)
                           (jdbc-util/db-result-snake-kw->db-result-kebab-kw))}
    (catch Throwable t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn get-ps-team-member
  [conn opts]
  (try
    (let [{:keys [success? ps-team-members] :as result}
          (get-ps-team-members conn opts)]
      (if-not success?
        result
        (if (= (count ps-team-members) 1)
          {:success? true
           :ps-team-member (first ps-team-members)}
          {:success? false
           :reason :not-found})))
    (catch Throwable t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

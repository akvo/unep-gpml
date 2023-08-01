(ns gpml.handler.invitation
  (:require [clojure.string :as str]
            [duct.logger :refer [log]]
            [gpml.db.invitation :as db.invitation]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.handler.resource.permission :as h.r.permission]
            [gpml.handler.responses :as r]
            [gpml.handler.stakeholder.tag :as handler.stakeholder.tag]
            [gpml.util :as util]
            [gpml.util.postgresql :as pg-util]
            [gpml.util.regular-expressions :as util.regex]
            [integrant.core :as ig]
            [java-time :as time]
            [java-time.pre-java8 :as time-pre-j8]
            [java-time.temporal]
            [ring.util.response :as resp])
  (:import [java.sql SQLException]))

(def ^:private get-invitations-params
  [:map
   [:pending
    {:optional true
     :swagger {:description "Filter pending invitations."}}
    [:boolean]]
   [:emails
    {:optional true
     :swagger {:description "Comma separated list of emails."}}
    [:string {:min 1}]]
   [:stakeholders_ids
    {:optional true
     :swagger {:description "Comma separated list of stakeholder IDs."}}
    [:string {:min 1}]]
   [:ids
    {:optional true
     :swagger {:description "Comma separated list of invitation IDs."}}
    [:string {:min 1}]]])

(def ^:private put-invitation-params
  [:map
   [:id
    [:and
     [:string {:min 1}]
     [:re util.regex/uuid-regex]]]])

(defn- api-opts->opts
  [{:keys [id emails stakeholders_ids ids pending]}]
  (cond-> {}
    (not (nil? pending))
    (assoc-in [:filters :pending?] pending)

    (seq emails)
    (assoc-in [:filters :emails] (str/split emails #","))

    (seq stakeholders_ids)
    (assoc-in [:filters :stakeholders-ids] (map #(Integer/parseInt %) (str/split stakeholders_ids #",")))

    (seq ids)
    (assoc-in [:filters :ids] (map util/uuid (str/split ids #",")))

    id
    (assoc :id (util/uuid id))))

(defn- get-invitations
  [{:keys [db logger] :as config}
   {{:keys [query]} :parameters user :user}]
  (try
    (if-not (h.r.permission/super-admin? config (:id user))
      (r/forbidden {:message "Unauthorized"})
      (let [opts (api-opts->opts query)
            invitations (db.invitation/get-invitations (:spec db) opts)
            stakeholders (->> (db.stakeholder/get-stakeholders (:spec db)
                                                               {:filters {:ids (map :stakeholder_id invitations)}})
                              (group-by :id))]
        (r/ok (reduce (fn [invitations {:keys [stakeholder_id] :as invitation}]
                        (let [stakeholder (-> stakeholders
                                              (get stakeholder_id)
                                              first
                                              (select-keys [:first_name :last_name :tags]))
                              stakeholder-w-unwrapped-tags (-> (merge stakeholder (handler.stakeholder.tag/unwrap-tags stakeholder))
                                                               (dissoc :tags))]
                          (conj invitations (merge invitation stakeholder-w-unwrapped-tags))))
                      []
                      invitations))))
    (catch Exception e
      (log logger :error ::get-invitations {:exception-message (.getMessage e)})
      (if (instance? SQLException e)
        (r/server-error {:success? false
                         :reason (pg-util/get-sql-state e)})
        (r/server-error {:success? false
                         :reason :could-not-get-invitations
                         :error-details {:message (.getMessage e)}})))))

(defn- accept-invitation
  [{:keys [db logger]}
   {{:keys [query path]} :parameters}]
  (try
    (let [opts (api-opts->opts (merge query path))
          accepted-at (-> (time/instant) (time-pre-j8/sql-timestamp "UTC"))
          affected-rows (db.invitation/accept-invitation (:spec db) (merge opts
                                                                           {:accepted-at accepted-at}))]
      (if (= affected-rows 1)
        (resp/response {:success? true})
        {:status 500
         :body {:success? false
                :reason :could-not-update-invitation}}))
    (catch Exception e
      (log logger :error ::accept-invitation {:exception-message (.getMessage e)})
      (if (instance? SQLException e)
        {:success? false
         :reason (pg-util/get-sql-state e)}
        {:success? false
         :reason :could-not-update-invitation
         :error-details {:message (.getMessage e)}}))))

(defmethod ig/init-key :gpml.handler.invitation/get [_ config]
  (fn [req]
    (get-invitations config req)))

(defmethod ig/init-key :gpml.handler.invitation/put [_ config]
  (fn [req]
    (accept-invitation config req)))

(defmethod ig/init-key :gpml.handler.invitation/get-params [_ _]
  {:query get-invitations-params})

(defmethod ig/init-key :gpml.handler.invitation/put-params [_ _]
  {:path put-invitation-params})

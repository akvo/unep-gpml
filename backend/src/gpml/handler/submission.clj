(ns gpml.handler.submission
  (:require [gpml.db.submission :as db.submission]
            [integrant.core :as ig]
            [gpml.auth0-util :as auth0]
            [clojure.set :as set]
            [ring.util.response :as resp]))

(defn pending-profiles-response [data auth0-config]
  (let [verified-emails (set (auth0/list-auth0-verified-emails auth0-config))
        data (map (fn [d]
                    (if (= "profile" (:type d))
                      (assoc d :email_verified (contains? verified-emails (:created_by d)))
                      d)) data)]
    data))

(defmethod ig/init-key :gpml.handler.submission/get [_ {:keys [db auth0]}]
  (fn [{{:keys [query]} :parameters}]
    (let [submission (-> (db.submission/pages (:spec db) query) :result)
          profiles (filter #(= "profile" (:type %)) (:data submission))
          submission (if-not (empty? profiles)
                       (assoc submission :data (pending-profiles-response (:data submission) auth0))
                       submission)]
      (resp/response submission))))

(defmethod ig/init-key :gpml.handler.submission/put [_ {:keys [db]}]
  (fn [{:keys [body-params admin]}]
    (let [data (assoc (set/rename-keys body-params {:item_type :table-name})
                      :reviewed_by (:id admin))]
      (db.submission/update-submission (:spec db) data)
      (assoc (resp/status 204)
             :body {:message "Successfuly Updated"
                    :data (db.submission/detail (:spec db) data)}))))

(defmethod ig/init-key :gpml.handler.submission/get-detail [_ {:keys [db]}]
  (fn [{{:keys [path]} :parameters}]
    (let [tbl (:submission path)
          tbl (cond
                (contains? #{"event" "technology" "policy"} tbl)
                (str "v_" tbl "_data")
                (contains? #{"Financing Resource" "Technical Resource" "Action Plan"} tbl)
                "v_resource_data"
                (= tbl "profile")
                "v_stakeholder_data")
          detail (db.submission/detail (:spec db) (conj path {:table-name tbl}))]
      (resp/response detail))))

(defmethod ig/init-key :gpml.handler.submission/put-params [_ _]
  [:map
   [:id int?]
   [:item_type [:enum "stakeholder", "event", "policy", "technology", "resource", "organisation"]]
   [:review_status [:enum "APPROVED", "REJECTED"]]])

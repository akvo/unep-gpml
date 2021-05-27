(ns gpml.handler.submission
  (:require [gpml.db.submission :as db.submission]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.constants :as constants]
            [integrant.core :as ig]
            [gpml.auth0-util :as auth0]
            [clojure.set :as set]
            [ring.util.response :as resp]))

(defn remap-initiative [{:keys [q1 q1_1 q16 q18
                                q20 q23 q24 q24_1 q24_2
                                q24_3 q24_4 q38 q40]}]
  (let [geo-type (-> q24 first second)
        geo-values (cond
                     (= geo-type "Regional")
                     (mapv #(-> % first second) q24_1)
                     (= geo-type "National")
                     (-> q24_2 first second)
                     (= geo-type "Sub-national") [(-> q24_3 first second)]
                     (= geo-type "Transnational")
                     (mapv #(-> % first second) q24_4)
                     :else nil)]
    {:organisation (-> q1_1 first second)
     :country (-> q23 first second)
     :submitted (-> q1 first second)
     :duration (-> q38 first second)
     :links q40
     :geo_coverage_type geo-type
     :geo_coverage_values geo-values
     :entities (mapv #(-> % first second) q16)
     :partners (mapv #(-> % first second) q18)
     :donors (mapv #(-> % first second) q20)}))

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
          submission (if (not-empty profiles)
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
    (let [conn (:spec db)
          submission (:submission path)
          initiative? (and (= submission "project") (> (:id path) 10000))
          table-name(cond
                      (contains? (set constants/resource-types) submission)
                      "v_resource_data"
                      initiative?
                      "initiative"
                      :else
                      (str "v_" submission "_data"))
          detail (db.submission/detail conn (conj path {:table-name table-name}))
          detail (if (= submission "stakeholder")
                   (merge detail
                          (select-keys (db.stakeholder/stakeholder-by-id conn path)[:email]))
                   detail)
          detail (if initiative? (remap-initiative detail)
                     detail)]
      (resp/response detail))))

(defmethod ig/init-key :gpml.handler.submission/put-params [_ _]
  [:map
   [:id int?]
   [:item_type [:enum "stakeholder", "event", "policy", "technology", "resource", "organisation", "initiative"]]
   [:review_status [:enum "APPROVED", "REJECTED"]]])

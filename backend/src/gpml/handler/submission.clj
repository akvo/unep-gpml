(ns gpml.handler.submission
  (:require
   [clojure.set :as set]
   [clojure.walk :as w]
   [duct.logger :refer [log]]
   [gpml.auth0-util :as auth0]
   [gpml.constants :as constants]
   [gpml.db.organisation :as db.organisation]
   [gpml.db.resource.tag :as db.resource.tag]
   [gpml.db.review :as db.review]
   [gpml.db.stakeholder :as db.stakeholder]
   [gpml.db.submission :as db.submission]
   [gpml.handler.stakeholder.tag :as handler.stakeholder.tag]
   [gpml.pg-util :as pg-util]
   [gpml.util.email :as email]
   [integrant.core :as ig]
   [ring.util.response :as resp])
  (:import
   [java.sql SQLException]))

(defn remap-initiative [{:keys [q1 q1_1 q16 q18
                                q20 q23 q24 q24_1 q24_2
                                q24_3 q24_4 q24_5 q38 q40] :as initiative}
                        conn]
  (let [geo-type (-> q24 first second)
        geo-values (cond
                     (= geo-type "Regional")
                     (mapv #(-> % first second) q24_1)
                     (= geo-type "National")
                     [(-> q24_2 first second)]
                     (= geo-type "Sub-national")
                     [(-> q24_3 first second)]
                     (= geo-type "Transnational")
                     (mapv #(-> % first second) q24_4)
                     (= geo-type "Global with elements in specific areas")
                     (mapv #(-> % first second) q24_5)
                     :else nil)
        org (if q1_1 (db.organisation/organisation-by-id
                      conn {:id (-> q1_1 first first name Integer/parseInt)}) nil)]
    (merge (select-keys initiative [:created :created_by :created_by_email :creator :modified
                                    :review_status :reviewed_at :reviewed_by])
           {:organisation org
            :country (-> q23 first second)
            :submitted (-> q1 first second)
            :duration (-> q38 first second)
            :links q40
            :geo_coverage_type geo-type
            :geo_coverage_values geo-values
            :entities (mapv #(-> % first second) q16)
            :partners (mapv #(-> % first second) q18)
            :donors (mapv #(-> % first second) q20)})))

(defn pending-profiles-response [data auth0-config]
  (let [verified-emails (set (auth0/list-auth0-verified-emails auth0-config))
        data (map (fn [d]
                    (if (= "profile" (:type d))
                      (assoc d :email_verified (contains? verified-emails (:created_by d)))
                      d)) data)]
    data))

(defn- submission-detail [conn params]
  (let [data (db.submission/detail conn params)
        creator-id (:id data)
        creator (db.stakeholder/stakeholder-by-id conn {:id creator-id})]
    (assoc data
           :created_by_email (:email creator)
           :creator creator)))

(defn- add-stakeholder-tags
  [conn submission-data]
  (map
   (fn [item]
     (if-not (= "stakeholder" (:topic item))
       item
       (let [tags (db.resource.tag/get-resource-tags conn {:table "stakeholder_tag"
                                                           :resource-col "stakeholder"
                                                           :resource-id (:id item)})]
         (merge item (handler.stakeholder.tag/unwrap-tags (assoc item :tags tags))))))
   submission-data))

(defmethod ig/init-key :gpml.handler.submission/get [_ {:keys [db auth0]}]
  (fn [{{:keys [query]} :parameters}]
    (let [submission (-> (db.submission/pages (:spec db) query) :result)
          profiles (filter #(= "profile" (:type %)) (:data submission))
          submission (-> (if (not-empty profiles)
                           (assoc submission :data (pending-profiles-response (:data submission) auth0))
                           submission)
                         (update :data #(add-stakeholder-tags (:spec db) %)))]
      (resp/response submission))))

(defmethod ig/init-key :gpml.handler.submission/put [_ {:keys [db mailjet-config]}]
  (fn [{:keys [body-params admin]}]
    (let [data (assoc (set/rename-keys body-params {:item_type :table-name})
                      :reviewed_by (:id admin))
          review-status (:review_status body-params)
          _ (db.submission/update-submission (:spec db) data)
          detail (submission-detail (:spec db) data)
          creator (:creator detail)]
      (email/send-email mailjet-config
                        email/unep-sender
                        (email/notify-user-review-subject mailjet-config review-status (:table-name data) detail)
                        (list {:Name (email/get-user-full-name creator) :Email (:email creator)})
                        (list (if (= review-status "APPROVED")
                                (email/notify-user-review-approved-text mailjet-config (:table-name data) detail)
                                (email/notify-user-review-rejected-text mailjet-config (:table-name data) detail)))
                        (list nil))
      (assoc (resp/status 200) :body {:message "Successfuly Updated" :data detail}))))

(defn- prep-stakeholder-tags
  [tags]
  (reduce (fn [acc [k v]]
            (assoc acc k (map :tag v)))
          {}
          (-> (group-by :tag_relation_category tags)
              (w/keywordize-keys)
              (select-keys [:seeking :offering :expertise]))))

(defn- get-detail
  [{:keys [db]} params]
  (let [conn (:spec db)
        submission (:submission params)
        initiative? (and (= submission "project") (> (:id params) 10000))
        table-name (cond
                     (contains? constants/resource-types submission)
                     "resource"
                     initiative?
                     "initiative"
                     :else
                     submission)
        params (conj params {:table-name table-name})
        detail (submission-detail conn params)
        detail (if (= submission "stakeholder")
                 (merge detail
                        (select-keys (db.stakeholder/stakeholder-by-id conn params) [:email])
                        (->> (db.resource.tag/get-resource-tags conn {:table "stakeholder_tag"
                                                                      :resource-col "stakeholder"
                                                                      :resource-id (:id params)})
                             (prep-stakeholder-tags)))
                 detail)
        detail (if initiative? (remap-initiative detail conn)
                   detail)]
    (resp/response detail)))

(defmethod ig/init-key :gpml.handler.submission/get-detail
  [_ {:keys [db logger] :as config}]
  (fn [{{:keys [path]} :parameters user :user}]
    (try
      (if-not (= "REVIEWER" (:role user))
        (get-detail config path)
        (let [topic-type (:submission path)
              topic-id (:id path)
              review (first (db.review/reviews-filter (:spec db) {:topic-type topic-type
                                                                  :topic-id topic-id}))]
          (if (= (:id user) (:reviewer review))
            (get-detail config path)
            {:status 403
             :body {:success? false
                    :reason :unauthorized}})))
      (catch Exception e
        (log logger :error ::failed-to-get-submission-detail {:exception-message (.getMessage e)
                                                              :context-data {:params path
                                                                             :user user}})
        (if (instance? SQLException e)
          {:status 500
           :body {:success? false
                  :reason (pg-util/get-sql-state e)}}
          {:status 500
           :body {:success? false
                  :reason :could-not-submission-get-details
                  :error-details {:error (.getMessage e)}}})))))

(defmethod ig/init-key :gpml.handler.submission/get-params [_ _]
  {:query
   [:map
    [:only {:optional true}
     [:enum "resources" "stakeholders" "experts" "tags" "entities" "non-member-entities"]]
    [:review_status
     {:optional true :default "SUBMITTED"}
     [:enum "SUBMITTED" "APPROVED" "REJECTED" "INVITED"]]
    [:title {:optional true} string?]
    [:page {:optional true
            :default 1} int?]
    [:limit {:optional true
             :default 10} int?]]})

(defmethod ig/init-key :gpml.handler.submission/put-params [_ _]
  [:map
   [:id int?]
   [:item_type [:enum "stakeholder", "event", "policy", "technology", "resource", "organisation", "initiative" "tag"]]
   [:review_status [:enum "APPROVED", "REJECTED"]]])

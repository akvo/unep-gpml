(ns gpml.handler.submission
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.set :as set]
            [clojure.string :as str]
            [duct.logger :refer [log]]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.resource.tag :as db.resource.tag]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.submission :as db.submission]
            [gpml.handler.resource.permission :as h.r.permission]
            [gpml.handler.responses :as r]
            [gpml.handler.stakeholder.tag :as handler.stakeholder.tag]
            [gpml.handler.util :as handler.util]
            [gpml.service.permissions :as srv.permissions]
            [gpml.util.auth0 :as auth0]
            [gpml.util.email :as email]
            [gpml.util.postgresql :as pg-util]
            [integrant.core :as ig]
            [ring.util.response :as resp])
  (:import [java.sql SQLException]))

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
        creator-id (:created_by data)
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

(defmethod ig/init-key :gpml.handler.submission/get
  [_ {:keys [db auth0] :as config}]
  (fn [{:keys [user] {:keys [query]} :parameters}]
    (if-not (h.r.permission/super-admin? config (:id user))
      (r/forbidden {:message "Unauthorized"})
      (let [submission (-> (db.submission/pages (:spec db) query) :result)
            profiles (filter #(= "profile" (:type %)) (:data submission))
            submission (-> (if (not-empty profiles)
                             (assoc submission :data (pending-profiles-response (:data submission) auth0))
                             submission)
                           (update :data #(add-stakeholder-tags (:spec db) %)))]
        (resp/response submission)))))

(defn- handle-stakeholder-role-change
  [config stakeholder-id review-status]
  (if (= review-status "APPROVED")
    (let [result (first (srv.permissions/unassign-roles-from-users config
                                                                   [{:role-name :unapproved-user
                                                                     :context-type :application
                                                                     :resource-id srv.permissions/root-app-resource-id
                                                                     :user-id stakeholder-id}]))]
      (if (:success? result)
        (srv.permissions/assign-roles-to-users config
                                               [{:role-name :approved-user
                                                 :context-type :application
                                                 :resource-id srv.permissions/root-app-resource-id
                                                 :user-id stakeholder-id}])
        (throw (ex-info "Failed to unassign role from user" {:user-id stakeholder-id}))))
    (srv.permissions/unassign-all-roles config stakeholder-id)))

(defn- notify-admins-submission-status
  [{:keys [mailjet-config]} resource-type resource-details]
  (let [creator (:creator resource-details)
        review-status (:review_status resource-details)]
    (email/send-email mailjet-config
                      email/unep-sender
                      (email/notify-user-review-subject mailjet-config review-status resource-type resource-details)
                      (list {:Name (email/get-user-full-name creator) :Email (:email creator)})
                      (list (if (= review-status "APPROVED")
                              (email/notify-user-review-approved-text mailjet-config resource-type resource-details)
                              (email/notify-user-review-rejected-text mailjet-config resource-type resource-details)))
                      (list nil))))

(defmethod ig/init-key :gpml.handler.submission/put
  [_ {:keys [db logger] :as config}]
  (fn [{:keys [body-params user]}]
    (try
      (if-not (h.r.permission/super-admin? config (:id user))
        (r/forbidden {:message "Unauthorized"})
        (jdbc/with-db-transaction [tx (:spec db)]
          (let [submission (assoc (set/rename-keys body-params {:item_type :table-name})
                                  :reviewed_by (:id user))
                resource-type (:table-name submission)
                affected (db.submission/update-submission tx submission)]
            (if-not (= affected 1)
              (throw (ex-info "Failed to update submission" {:reason :update-unexpected-number-of-affected-records
                                                             :expected 1
                                                             :actual affected}))
              (let [resource-details (submission-detail tx submission)]
                (when (= resource-type "stakeholder")
                  (handle-stakeholder-role-change {:conn tx
                                                   :logger logger}
                                                  (:id submission)
                                                  (:review_status submission)))
                (notify-admins-submission-status config resource-type resource-details)
                (r/ok {:success? true
                       :message "Successfuly Updated"
                       :data resource-details}))))))
      (catch Throwable t
        (log logger :error :failed-to-update-submission {:exception-message (ex-message t)
                                                         :exception-data (ex-data t)
                                                         :context-data body-params
                                                         :stack-trace (map str (.getStackTrace t))})
        (r/server-error {:success? false
                         :reason :failed-to-update-submission})))))

(defn- add-stakeholder-extra-details
  [conn stakeholder]
  (let [email (:email (db.stakeholder/stakeholder-by-id conn {:id (:id stakeholder)}))
        org (db.organisation/organisation-by-id conn {:id (:affiliation stakeholder)})
        tags (db.resource.tag/get-resource-tags conn {:table "stakeholder_tag"
                                                      :resource-col "stakeholder"
                                                      :resource-id (:id stakeholder)})]
    (cond-> stakeholder
      (seq org)
      (assoc :affiliation org)

      (seq tags)
      (merge (handler.stakeholder.tag/stakeholder-tags->api-stakeholder-tags tags))

      true
      (assoc :email email))))

(defn- get-detail
  [{:keys [db]} params]
  (let [conn (:spec db)
        submission (:submission params)
        initiative? (= submission "initiative")
        table-name (handler.util/get-internal-topic-type submission)
        params (conj params {:table-name table-name})
        detail (submission-detail conn params)
        detail (if (= submission "stakeholder")
                 (add-stakeholder-extra-details conn detail)
                 detail)
        detail (if initiative? (remap-initiative detail conn)
                   detail)]
    (resp/response detail)))

(defmethod ig/init-key :gpml.handler.submission/get-detail
  [_ {:keys [logger] :as config}]
  (fn [{{:keys [path]} :parameters user :user}]
    (try
      (let [user-id (:id user)
            resource-id (:id path)
            resource-type (handler.util/get-internal-topic-type (:submission path))]
        (if-not (h.r.permission/operation-allowed? config {:user-id user-id
                                                           :entity-id resource-id
                                                           :entity-type (keyword (str/replace resource-type \_ \-))
                                                           :operation-type :review
                                                           :root-context? false})
          (r/forbidden {:message "Unauthorized"})
          (get-detail config path)))
      (catch Throwable t
        (log logger :error ::failed-to-get-submission-detail {:exception-message (ex-message t)
                                                              :exception-data (ex-data t)
                                                              :stack-trace (.getStackTrace t)
                                                              :context-data {:params path
                                                                             :user user}})
        (if (instance? SQLException t)
          (r/server-error {:success? false
                           :reason (pg-util/get-sql-state t)})
          (r/server-error {:success? false
                           :reason :could-not-submission-get-details
                           :error-details {:error (ex-message t)}}))))))

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
   [:item_type
    [:enum "stakeholder", "event", "policy", "technology", "resource", "organisation", "initiative" "tag" "case_study"]]
   [:review_status [:enum "APPROVED", "REJECTED"]]])

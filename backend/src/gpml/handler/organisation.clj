(ns gpml.handler.organisation
  (:require [clojure.java.jdbc :as jdbc]
            [duct.logger :refer [log]]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.resource.tag :as db.resource.tag]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.domain.organisation :as dom.organisation]
            [gpml.handler.file :as handler.file]
            [gpml.handler.resource.geo-coverage :as handler.geo]
            [gpml.handler.resource.permission :as h.r.permission]
            [gpml.handler.resource.tag :as handler.resource.tag]
            [gpml.handler.responses :as r]
            [gpml.service.file :as srv.file]
            [gpml.service.permissions :as srv.permissions]
            [gpml.util :as util]
            [gpml.util.email :as email]
            [gpml.util.geo :as geo]
            [gpml.util.malli :as util.malli]
            [gpml.util.postgresql :as pg-util]
            [integrant.core :as ig]
            [malli.util :as mu]
            [ring.util.response :as resp])
  (:import [java.sql SQLException]))

(defn create
  [{:keys [logger mailjet-config] :as config}
   conn
   {:keys [logo
           geo_coverage_type
           geo_coverage_country_groups
           geo_coverage_countries
           geo_coverage_country_states] :as org}]
  (let [logo-id (when (seq logo)
                  (handler.file/create-file config conn logo :organisation :images :private))
        geo-coverage-type (keyword geo_coverage_type)
        org-id (:id (db.organisation/new-organisation conn
                                                      (cond-> (dissoc org :logo)
                                                        logo-id
                                                        (assoc :logo_id logo-id))))]
    (handler.geo/create-resource-geo-coverage conn
                                              :organisation
                                              org-id
                                              geo-coverage-type
                                              {:countries geo_coverage_countries
                                               :country-groups geo_coverage_country_groups
                                               :country-states geo_coverage_country_states})
    (when (seq (:tags org))
      (handler.resource.tag/create-resource-tags conn
                                                 logger
                                                 mailjet-config
                                                 {:tags (:tags org)
                                                  :tag-category "general"
                                                  :resource-name "organisation"
                                                  :resource-id org-id}))
    (srv.permissions/create-resource-context
     {:conn conn
      :logger logger}
     {:context-type :organisation
      :resource-id org-id})
    org-id))

(defn- handle-logo-update
  [config conn org-id logo-payload]
  (let [old-org (db.organisation/organisation-by-id conn {:id org-id})
        old-logo-id (:logo_id old-org)
        delete-result (if-not old-logo-id
                        {:success? true}
                        (srv.file/delete-file config conn {:id old-logo-id}))]
    (if (:success? delete-result)
      (when (seq logo-payload)
        (handler.file/create-file config
                                  conn
                                  logo-payload
                                  :organisation
                                  :images
                                  :private))
      (throw (ex-info "Failed to delete old organisation logo" {:result delete-result})))))

(defn update-org
  [{:keys [logger mailjet-config] :as config}
   conn
   {:keys [logo
           geo_coverage_type
           geo_coverage_country_groups
           geo_coverage_countries
           geo_coverage_country_states] :as org}]
  (let [org-id (:id org)
        logo-to-update? (contains? (set (keys org)) :logo)
        new-logo-id (when logo-to-update?
                      (handle-logo-update config conn org-id logo))
        geo-coverage-type (keyword geo_coverage_type)
        updates-map (if logo-to-update?
                      (assoc org :logo_id new-logo-id)
                      org)
        updates-map (-> updates-map
                        (dissoc :id :tags :geo_coverage_countries :geo_coverage_country_groups :logo)
                        (util/update-if-not-nil :review_status keyword)
                        (util/update-if-not-nil :geo_coverage_type keyword)
                        db.organisation/organisation->db-organisation)
        affected-rows (if-not (empty? updates-map)
                        (db.organisation/update-organisation
                         conn
                         {:id org-id
                          :updates updates-map})
                        1)]
    (handler.geo/update-resource-geo-coverage conn
                                              :organisation
                                              org-id
                                              geo-coverage-type
                                              {:countries geo_coverage_countries
                                               :country-groups geo_coverage_country_groups
                                               :country-states geo_coverage_country_states})
    (when (seq (:tags org))
      (handler.resource.tag/update-resource-tags conn logger mailjet-config {:tags (:tags org)
                                                                             :tag-category "general"
                                                                             :resource-name "organisation"
                                                                             :resource-id org-id}))
    {:success? (= 1 affected-rows)
     :affected-entities affected-rows}))

(defmethod ig/init-key :gpml.handler.organisation/get [_ {:keys [db]}]
  (fn [_]
    (resp/response (db.organisation/all-members (:spec db)))))

(defmethod ig/init-key :gpml.handler.organisation/get-id
  [_ {:keys [db] :as config}]
  (fn [{{:keys [path]} :parameters user :user}]
    ;; Here we are not checking for any specific organisation, hence we pass the root application resource id.
    (if (h.r.permission/operation-allowed?
         config
         {:user-id (:id user)
          :entity-type :organisation
          :entity-id srv.permissions/root-app-resource-id
          :operation-type :read
          :custom-context-type srv.permissions/root-app-context-type})
      (let [conn (:spec db)
            organisation (db.organisation/organisation-by-id conn path)
            tags (mapv :id (db.resource.tag/get-resource-tags conn {:table "organisation_tag"
                                                                    :resource-col "organisation"
                                                                    :resource-id (:id path)}))
            geo-coverage (let [data (db.organisation/geo-coverage-v2 conn organisation)]
                           {:geo_coverage_countries (vec (filter some? (mapv :country data)))
                            :geo_coverage_country_groups (vec (filter some? (mapv :country_group data)))})]
        (resp/response (merge (assoc organisation :expertise tags) geo-coverage)))
      (r/forbidden {:message "Unauthorized"}))))

(defmethod ig/init-key :gpml.handler.organisation/post
  [_ {:keys [db logger] :as config}]
  (fn [{:keys [body-params referrer jwt-claims]}]
    (try
      (let [org-creator (when (seq (:email jwt-claims))
                          (db.stakeholder/stakeholder-by-email (:spec db) jwt-claims))
            gpml-member? (:is_member body-params)]
        (cond
          (and gpml-member? (not (:id org-creator)))
          {:status 400
           :body {:success? false
                  :reason :can-not-create-member-org-if-user-does-not-exist}}

          (and gpml-member? (= "REJECTED" (:review_status org-creator)))
          {:status 400
           :body {:success? false
                  :reason :can-not-create-member-org-if-user-is-in-rejected-state}}

          :else
          (jdbc/with-db-transaction [tx (:spec db)]
            (let [org-id (create config
                                 tx
                                 (assoc body-params :created_by (:id org-creator)))]
              (when (:id org-creator)
                (srv.permissions/assign-roles-to-users-from-connections
                 {:conn tx
                  :logger logger}
                 {:context-type :organisation
                  :resource-id org-id
                  :individual-connections [{:role "owner"
                                            :stakeholder (:id org-creator)}]}))
              (resp/created referrer {:success? true
                                      :org (assoc body-params :id org-id)})))))
      (catch Exception e
        (log logger :error ::create-org-failed {:exception-message (.getMessage e)})
        (if (instance? SQLException e)
          (if (= :unique-constraint-violation (pg-util/get-sql-state e))
            {:status 409
             :body {:success? false
                    :reason :organisation-name-already-exists}}
            {:status 500
             :body {:success? false
                    :reason :could-not-create-org}})
          {:status 500
           :body {:success? false
                  :reason :could-not-create-org
                  :error-details {:message (.getMessage e)}}})))))

(defmethod ig/init-key :gpml.handler.organisation/post-params [_ _]
  (into [:map
         [:name string?]
         [:url string?]
         [:is_member boolean?]
         [:country int?]
         [:geo_coverage_type geo/coverage_type]
         [:tags {:optional true}
          [:vector {:optional true}
           [:map {:optional true}
            [:id {:optional true} pos-int?]
            [:tag string?]
            [:tag_category string?]]]]]
        handler.geo/api-geo-coverage-schemas))

(defmethod ig/init-key :gpml.handler.organisation/put
  [_ {:keys [db logger] :as config}]
  (fn [{:keys [body-params parameters user]}]
    (try
      (if (h.r.permission/operation-allowed?
           config
           {:user-id (:id user)
            :entity-type :organisation
            :entity-id (:id (:path parameters))
            :operation-type :update})
        (jdbc/with-db-transaction [tx (:spec db)]
          (let [org-data (-> body-params
                             (select-keys (util.malli/keys dom.organisation/Organisation))
                             (dissoc :created :modified :review_status :logo_id :second_contact
                                     :is_member :reviewed_at :reviewed_by :contribution))
                {:keys [success?] :as result} (update-org config tx (assoc org-data :id (:id (:path parameters))))]
            (if success? (r/ok {})
                (r/server-error result))))
        (r/forbidden {:message "Unauthorized"}))
      (catch Throwable t
        (let [log-data {:exception-message (ex-message t)
                        :exception-data (ex-data t)
                        :context-data (assoc body-params
                                             :id (get-in parameters [:path :id]))}]
          (log logger :error :failed-to-update-organisation log-data)
          (log logger :debug :failed-to-update-organisation (assoc log-data :stack-trace (.getStackTrace t)))
          (r/server-error {:success? false
                           :reason :exception
                           :error-details log-data}))))))
(defmethod ig/init-key :gpml.handler.organisation/put-params [_ _]
  (-> dom.organisation/Organisation
      (util.malli/dissoc [:id :created :modified :review_status
                          :created_by :created_at :second_contact
                          :is_member :reviewed_at :reviewed_by :contribution])
      mu/optional-keys))

(defmethod ig/init-key :gpml.handler.organisation/put-req-member
  [_ {:keys [db logger mailjet-config] :as config}]
  (fn [{:keys [body-params parameters user]}]
    (try
      (if (h.r.permission/operation-allowed?
           config
           {:user-id (:id user)
            :entity-type :organisation
            :entity-id (:id (:path parameters))
            :operation-type :update})
        (let [org-id (:id (:path parameters))
              organisation (db.organisation/organisation-by-id (:spec db) {:id org-id})
              {:keys [is_member review_status]} organisation
              result (cond
                       is_member {:success? false
                                  :reason :entity-already-member}
                       (= "REJECTED" review_status) {:success? false
                                                     :reason :entity-rejected}
                       :else (jdbc/with-db-transaction [tx (:spec db)]
                               (update-org config tx (-> body-params
                                                         (select-keys (util.malli/keys dom.organisation/Organisation))
                                                         (dissoc :created :modified :logo_id :second_contact
                                                                 :reviewed_at :reviewed_by)
                                                         (assoc :id org-id :is_member true :review_status "SUBMITTED")))))]
          (if (:success? result)
            (do
              (email/notify-admins-pending-approval
               (:spec db)
               mailjet-config
               (merge body-params {:type "organisation"}))
              (r/ok result))
            (r/server-error result)))
        (r/forbidden {:message "Unauthorized"}))
      (catch Throwable e
        (log logger :error ::failed-to-req-org-to-member-conversion {:exception-message (ex-message e)})
        (let [response {:success? false
                        :reason :could-not-req-org-to-member-conversion}]
          (if (instance? SQLException e)
            (r/server-error response)
            (r/server-error (assoc-in response [:error-details :error] (ex-message e)))))))))

(defmethod ig/init-key :gpml.handler.organisation/put-req-member-params [_ _]
  {:path [:map [:id int?]]
   :body (-> dom.organisation/Organisation
             (util.malli/dissoc
              [:id :is_member :created :modified :reviewed_at :reviewed_by :review_status]))})

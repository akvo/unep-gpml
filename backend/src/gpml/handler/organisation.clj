(ns gpml.handler.organisation
  (:require [duct.logger :refer [log]]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.handler.resource.geo-coverage :as handler.geo]
            [gpml.handler.resource.tag :as handler.resource.tag]
            [gpml.util.geo :as geo]
            [gpml.util.postgresql :as pg-util]
            [integrant.core :as ig]
            [ring.util.response :as resp])
  (:import [java.sql SQLException]))

(defn create
  [conn logger mailjet-config
   {:keys [geo_coverage_type
           geo_coverage_country_groups
           geo_coverage_countries
           geo_coverage_country_states] :as org}]
  (let [geo-coverage-type (keyword geo_coverage_type)
        org-id (:id (db.organisation/new-organisation conn org))]
    (when (or (seq geo_coverage_country_groups)
              (seq geo_coverage_countries)
              (seq geo_coverage_country_states)
              (not= :global geo-coverage-type))
      (handler.geo/create-resource-geo-coverage conn
                                                :organisation
                                                org-id
                                                geo-coverage-type
                                                {:countries geo_coverage_countries
                                                 :country-groups geo_coverage_country_groups
                                                 :country-states geo_coverage_country_states}))
    (when (seq (:tags org))
      (handler.resource.tag/create-resource-tags conn
                                                 logger
                                                 mailjet-config
                                                 {:tags (:tags org)
                                                  :tag-category "general"
                                                  :resource-name "organisation"
                                                  :resource-id org-id}))
    org-id))

(defn update-org
  [conn logger mailjet-config
   {:keys [geo_coverage_type
           geo_coverage_country_groups
           geo_coverage_countries
           geo_coverage_country_states] :as org}]
  (let [geo-coverage-type (keyword geo_coverage_type)
        org-id (do (db.organisation/update-organisation conn org)
                   (:id org))]
    (when (or (seq geo_coverage_country_groups)
              (seq geo_coverage_countries)
              (seq geo_coverage_country_states)
              (not= :global geo-coverage-type))
      (handler.geo/create-resource-geo-coverage conn
                                                :organisation
                                                org-id
                                                geo-coverage-type
                                                {:countries geo_coverage_countries
                                                 :country-groups geo_coverage_country_groups
                                                 :country-states geo_coverage_country_states}))
    (when (seq (:tags org))
      (handler.resource.tag/update-resource-tags conn logger mailjet-config {:tags (:tags org)
                                                                             :tag-category "general"
                                                                             :resource-name "organisation"
                                                                             :resource-id org-id}))
    org-id))

(defmethod ig/init-key :gpml.handler.organisation/get [_ {:keys [db]}]
  (fn [_]
    (resp/response (db.organisation/all-members (:spec db)))))

(defmethod ig/init-key :gpml.handler.organisation/get-id [_ {:keys [db]}]
  (fn [{{:keys [path]} :parameters}]
    (let [conn (:spec db)
          organisation (db.organisation/organisation-by-id conn path)
          seeks (:tags (first (db.organisation/organisation-tags conn path)))
          geo-coverage (let [data (db.organisation/geo-coverage-v2 conn organisation)]
                         {:geo_coverage_countries      (vec (filter some? (mapv :country data)))
                          :geo_coverage_country_groups (vec (filter some? (mapv :country_group data)))})]
      (resp/response (merge (assoc organisation :expertise seeks) geo-coverage)))))

(defmethod ig/init-key :gpml.handler.organisation/post
  [_ {:keys [db mailjet-config logger]}]
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
          (let [org-id (create (:spec db) logger mailjet-config (assoc body-params :created_by (:id org-creator)))]
            (resp/created referrer {:success? true
                                    :org (assoc body-params :id org-id)}))))
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

(defmethod ig/init-key :gpml.handler.organisation/put [_ {:keys [db logger mailjet-config]}]
  (fn [{:keys [body-params referrer parameters]}]
    (let [org-id (update-org db logger mailjet-config (assoc body-params :id (:id (:path parameters))))]
      (resp/created referrer (assoc body-params :id org-id)))))

(defmethod ig/init-key :gpml.handler.organisation/put-params [_ _]
  (into [:map
         [:name {:optional true} string?]
         [:url {:optional true} string?]
         [:logo {:optional true} string?]
         [:country {:optional true} int?]
         [:geo_coverage_type {:optional true} geo/coverage_type]
         [:type {:optional true} string?]
         [:representative_group_other {:optional true} [:maybe string?]]
         [:representative_group_civil_society {:optional true} [:maybe string?]]
         [:representative_group_private_sector {:optional true} [:maybe string?]]
         [:representative_group_government {:optional true} [:maybe string?]]
         [:representative_group_academia_research {:optional true} [:maybe string?]]
         [:subnational_area {:optional true} [:maybe string?]]
         [:expertise {:optional true} vector?]
         [:program {:optional true} string?]
         [:tags {:optional true}
          [:vector {:optional true}
           [:map {:optional true}
            [:id {:optional true} pos-int?]
            [:tag string?]
            [:tag_category {:optional true} string?]]]]]
        handler.geo/api-geo-coverage-schemas))

(ns gpml.handler.policy
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.string :as str]
            [duct.logger :refer [log]]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.policy :as db.policy]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.domain.policy :as dom.policy]
            [gpml.handler.auth :as h.auth]
            [gpml.handler.geo :as handler.geo]
            [gpml.handler.image :as handler.image]
            [gpml.handler.resource.related-content :as handler.resource.related-content]
            [gpml.handler.resource.tag :as handler.resource.tag]
            [gpml.handler.util :as handler.util]
            [gpml.util.email :as email]
            [gpml.util.malli :as util.malli]
            [gpml.util.postgresql :as pg-util]
            [gpml.util.sql :as sql-util]
            [integrant.core :as ig]
            [malli.util :as mu]
            [ring.util.response :as resp])
  (:import [java.sql SQLException]))

(defn- expand-entity-associations
  [entity-connections resource-id]
  (vec (for [connection entity-connections]
         {:column_name "policy"
          :topic "policy"
          :topic_id resource-id
          :organisation (:entity connection)
          :association (:role connection)
          :remarks nil})))

(defn- expand-individual-associations
  [individual-connections resource-id]
  (vec (for [connection individual-connections]
         {:column_name "policy"
          :topic "policy"
          :topic_id resource-id
          :stakeholder (:stakeholder connection)
          :association (:role connection)
          :remarks nil})))

(defn- create-policy
  [{:keys [logger mailjet-config] :as config}
   tx
   {:keys [title original_title abstract url
           data_source type_of_law record_number
           first_publication_date latest_amendment_date
           status country geo_coverage_type
           geo_coverage_value implementing_mea subnational_city
           geo_coverage_countries geo_coverage_country_groups
           tags created_by image thumbnail language
           owners info_docs sub_content_type
           document_preview related_content topics
           attachments remarks entity_connections individual_connections
           capacity_building source]}]
  (let [data (cond-> {:title title
                      :original_title original_title
                      :abstract abstract
                      :url url
                      :country country
                      :data_source data_source
                      :type_of_law type_of_law
                      :record_number record_number
                      :first_publication_date first_publication_date
                      :latest_amendment_date latest_amendment_date
                      :status status
                      :owners owners
                      :info_docs info_docs
                      :sub_content_type sub_content_type
                      :document_preview document_preview
                      :topics (pg-util/->JDBCArray topics "text")
                      :image (handler.image/assoc-image config tx image "policy")
                      :thumbnail (handler.image/assoc-image config tx thumbnail "policy")
                      :geo_coverage_type geo_coverage_type
                      :geo_coverage_value geo_coverage_value
                      :geo_coverage_countries geo_coverage_countries
                      :geo_coverage_country_groups geo_coverage_country_groups
                      :subnational_city subnational_city
                      :implementing_mea implementing_mea
                      :attachments attachments
                      :remarks remarks
                      :created_by created_by
                      :review_status "SUBMITTED"
                      :language language
                      :source (-> source str/lower-case keyword)}
               (not (nil? capacity_building))
               (assoc :capacity_building capacity_building))
        policy-geo-coverage-insert-cols ["policy" "country_group" "country"]
        policy-id (->>
                   (update data :source #(sql-util/keyword->pg-enum % "resource_source"))
                   (db.policy/new-policy tx) :id)
        api-individual-connections (handler.util/individual-connections->api-individual-connections tx individual_connections created_by)
        owners (distinct (remove nil? (flatten (conj owners
                                                     (map #(when (= (:role %) "owner")
                                                             (:stakeholder %))
                                                          api-individual-connections)))))]
    (when (seq related_content)
      (handler.resource.related-content/create-related-contents tx logger policy-id "policy" related_content))
    (when (not-empty tags)
      (handler.resource.tag/create-resource-tags tx logger mailjet-config {:tags tags
                                                                           :tag-category "general"
                                                                           :resource-name "policy"
                                                                           :resource-id policy-id}))
    (doseq [stakeholder-id owners]
      (h.auth/grant-topic-to-stakeholder! tx {:topic-id policy-id
                                              :topic-type "policy"
                                              :stakeholder-id stakeholder-id
                                              :roles ["owner"]}))
    (when (not-empty entity_connections)
      (doseq [association (expand-entity-associations entity_connections policy-id)]
        (db.favorite/new-organisation-association tx association)))
    (when (not-empty api-individual-connections)
      (doseq [association (expand-individual-associations api-individual-connections policy-id)]
        (db.favorite/new-stakeholder-association tx association)))
    (if (or (not-empty geo_coverage_country_groups)
            (not-empty geo_coverage_countries))
      (let [geo-data (handler.geo/get-geo-vector-v2 policy-id data)]
        (db.policy/add-policies-geo tx {:geo geo-data
                                        :insert-cols policy-geo-coverage-insert-cols}))
      (when (not-empty geo_coverage_value)
        (let [geo-data (handler.geo/get-geo-vector policy-id data)]
          (db.policy/add-policies-geo tx {:geo geo-data
                                          :insert-cols policy-geo-coverage-insert-cols}))))
    (email/notify-admins-pending-approval
     tx
     mailjet-config
     (merge data {:type "policy"}))
    policy-id))

(defmethod ig/init-key :gpml.handler.policy/post
  [_ {:keys [db logger] :as config}]
  (fn [{:keys [jwt-claims body-params parameters] :as req}]
    (try
      (jdbc/with-db-transaction [tx (:spec db)]
        (let [user (db.stakeholder/stakeholder-by-email tx jwt-claims)
              policy-id (create-policy config
                                       tx
                                       (assoc body-params
                                              :created_by (:id user)
                                              :source (get-in parameters [:body :source])))]
          (resp/created (:referrer req) {:success? true
                                         :message "New policy created"
                                         :id policy-id})))
      (catch Exception e
        (log logger :error ::failed-to-create-policy {:exception-message (.getMessage e)})
        (let [response {:status 500
                        :body {:success? false
                               :reason :could-not-create-policy}}]

          (if (instance? SQLException e)
            response
            (assoc-in response [:body :error-details :error] (.getMessage e))))))))

(defmethod ig/init-key :gpml.handler.policy/post-params [_ _]
  {:body (-> dom.policy/Policy
             (util.malli/dissoc [:id :modified :created :leap_api_id :leap_api_modified :review_status])
             (mu/optional-keys))})

(ns gpml.handler.policy
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.set :as set]
            [duct.logger :refer [log]]
            [gpml.db.policy :as db.policy]
            [gpml.domain.policy :as dom.policy]
            [gpml.handler.file :as handler.file]
            [gpml.handler.resource.geo-coverage :as handler.geo]
            [gpml.handler.resource.permission :as h.r.permission]
            [gpml.handler.resource.related-content :as handler.resource.related-content]
            [gpml.handler.resource.tag :as handler.resource.tag]
            [gpml.handler.responses :as r]
            [gpml.handler.util :as handler.util]
            [gpml.service.association :as srv.association]
            [gpml.service.permissions :as srv.permissions]
            [gpml.util :as util]
            [gpml.util.email :as email]
            [gpml.util.malli :as util.malli]
            [gpml.util.postgresql :as pg-util]
            [gpml.util.sql :as sql-util]
            [integrant.core :as ig]
            [malli.util :as mu]
            [ring.util.response :as resp])
  (:import [java.sql SQLException]))

(defn- create-policy
  [{:keys [logger mailjet-config] :as config}
   conn
   user
   {:keys [title original_title abstract url
           data_source type_of_law record_number
           first_publication_date latest_amendment_date
           status country geo_coverage_type
           geo_coverage_value implementing_mea subnational_city
           geo_coverage_countries geo_coverage_country_groups
           geo_coverage_country_states
           tags created_by image thumbnail language
           owners info_docs sub_content_type
           document_preview related_content topics
           attachments remarks entity_connections individual_connections
           capacity_building source]}]
  (let [image-id (when (seq image)
                   (handler.file/create-file config conn image :policy :images :public))
        thumbnail-id (when (seq thumbnail)
                       (handler.file/create-file config conn thumbnail :policy :images :public))
        data (cond-> {:title title
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
                      :language language}
               (not (nil? capacity_building))
               (assoc :capacity_building capacity_building)

               (not (nil? source))
               (assoc :source source)

               image-id
               (assoc :image_id image-id)

               thumbnail-id
               (assoc :thumbnail_id thumbnail-id))
        policy-id (->>
                   (util/update-if-not-nil data :source #(sql-util/keyword->pg-enum % "resource_source"))
                   (db.policy/new-policy conn) :id)
        api-individual-connections (handler.util/individual-connections->api-individual-connections conn individual_connections created_by)
        geo-coverage-type (keyword geo_coverage_type)
        org-associations (map #(set/rename-keys % {:entity :organisation}) entity_connections)]
    (when (seq related_content)
      (handler.resource.related-content/create-related-contents conn logger policy-id "policy" related_content))
    (when (not-empty tags)
      (handler.resource.tag/create-resource-tags conn logger mailjet-config {:tags tags
                                                                             :tag-category "general"
                                                                             :resource-name "policy"
                                                                             :resource-id policy-id}))
    (srv.permissions/create-resource-context
     {:conn conn
      :logger logger}
     {:context-type :policy
      :resource-id policy-id
      :entity-connections entity_connections})
    (srv.association/save-associations
     {:conn conn
      :logger logger}
     {:org-associations org-associations
      :sth-associations (if (seq api-individual-connections)
                          api-individual-connections
                          [{:role "owner"
                            :stakeholder (:id user)}])
      :resource-type "policy"
      :resource-id policy-id})
    (handler.geo/create-resource-geo-coverage conn
                                              :policy
                                              policy-id
                                              geo-coverage-type
                                              {:countries geo_coverage_countries
                                               :country-groups geo_coverage_country_groups
                                               :country-states geo_coverage_country_states})
    (email/notify-admins-pending-approval
     conn
     mailjet-config
     (merge data {:type "policy"}))
    policy-id))

(defmethod ig/init-key :gpml.handler.policy/post
  [_ {:keys [db logger] :as config}]
  (fn [{:keys [body-params parameters user] :as req}]
    (try
      (if-not (h.r.permission/operation-allowed?
               config
               {:user-id (:id user)
                :entity-type :policy
                :operation-type :create
                :root-context? true})
        (r/forbidden {:message "Unauthorized"})
        (jdbc/with-db-transaction [tx (:spec db)]
          (let [policy-id (create-policy
                           config
                           tx
                           user
                           (assoc body-params
                                  :created_by (:id user)
                                  :source (get-in parameters [:body :source])))]
            (resp/created (:referrer req) {:success? true
                                           :message "New policy created"
                                           :id policy-id}))))
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

(ns gpml.handler.resource
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.set :as set]
            [duct.logger :refer [log]]
            [gpml.auth :as auth]
            [gpml.db.activity :as db.activity]
            [gpml.db.language :as db.language]
            [gpml.db.resource :as db.resource]
            [gpml.domain.types :as dom.types]
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
            [gpml.util.sql :as sql-util]
            [integrant.core :as ig])
  (:import [java.sql SQLException]))

(defn- create-resource
  [{:keys [logger mailjet-config] :as config}
   conn
   user
   {:keys [resource_type title publish_year
           summary value value_currency
           value_remarks valid_from valid_to image
           geo_coverage_type geo_coverage_value
           geo_coverage_countries geo_coverage_country_groups
           geo_coverage_value_subnational_city geo_coverage_country_states
           attachments country urls tags remarks thumbnail
           created_by url info_docs sub_content_type related_content
           first_publication_date latest_amendment_date document_preview
           entity_connections individual_connections language
           capacity_building source]}]
  (let [image-id (when (seq image)
                   (handler.file/create-file config conn image :resource :images :public))
        thumbnail-id (when (seq thumbnail)
                       (handler.file/create-file config conn thumbnail :resource :images :public))
        data (cond-> {:type resource_type
                      :title title
                      :publish_year publish_year
                      :summary summary
                      :value value
                      :value_currency value_currency
                      :value_remarks value_remarks
                      :valid_from valid_from
                      :valid_to valid_to
                      :geo_coverage_type geo_coverage_type
                      :geo_coverage_value geo_coverage_value
                      :geo_coverage_countries geo_coverage_countries
                      :geo_coverage_country_groups geo_coverage_country_groups
                      :subnational_city geo_coverage_value_subnational_city
                      :country country
                      :attachments attachments
                      :remarks remarks
                      :created_by created_by
                      :url url
                      :info_docs info_docs
                      :sub_content_type sub_content_type
                      :first_publication_date first_publication_date
                      :latest_amendment_date latest_amendment_date
                      :document_preview document_preview
                      :language language
                      :source source}
               (not (nil? capacity_building))
               (assoc :capacity_building capacity_building)

               image-id
               (assoc :image_id image-id)

               thumbnail-id
               (assoc :thumbnail_id thumbnail-id))
        resource-id (:id (db.resource/new-resource
                          conn
                          (update data :source #(sql-util/keyword->pg-enum % "resource_source"))))
        api-individual-connections (handler.util/individual-connections->api-individual-connections conn individual_connections created_by)
        geo-coverage-type (keyword geo_coverage_type)
        org-associations (map #(set/rename-keys % {:entity :organisation}) entity_connections)]
    (when (seq related_content)
      (handler.resource.related-content/create-related-contents conn logger resource-id "resource" related_content))
    (when (not-empty tags)
      (handler.resource.tag/create-resource-tags conn logger mailjet-config {:tags tags
                                                                             :tag-category "general"
                                                                             :resource-name "resource"
                                                                             :resource-id resource-id}))
    (srv.permissions/create-resource-context
     {:conn conn
      :logger logger}
     {:context-type :resource
      :resource-id resource-id})
    (srv.association/save-associations
     {:conn conn
      :logger logger}
     {:org-associations org-associations
      :sth-associations (if (seq api-individual-connections)
                          api-individual-connections
                          [{:role "owner"
                            :stakeholder (:id user)}])
      :resource-type "resource"
      :resource-id resource-id})
    (when (not-empty urls)
      (let [lang-urls (map #(vector resource-id
                                    (->> % :lang
                                         (assoc {} :iso_code)
                                         (db.language/language-by-iso-code conn)
                                         :id)
                                    (:url %)) urls)]
        (db.resource/add-resource-language-urls conn {:urls lang-urls})))
    (handler.geo/create-resource-geo-coverage conn
                                              :resource
                                              resource-id
                                              geo-coverage-type
                                              {:countries geo_coverage_countries
                                               :country-groups geo_coverage_country_groups
                                               :country-states geo_coverage_country_states})
    (email/notify-admins-pending-approval
     conn
     mailjet-config
     (merge data {:type resource_type}))
    resource-id))

(defmethod ig/init-key :gpml.handler.resource/post
  [_ {:keys [db logger] :as config}]
  (fn [{:keys [body-params parameters user]}]
    (try
      (if-not (h.r.permission/operation-allowed?
               config
               {:user-id (:id user)
                :entity-type :resource
                :operation-type :create
                :root-context? true})
        (r/forbidden {:message "Unauthorized"})
        (jdbc/with-db-transaction [tx (:spec db)]
          (let [resource-id (create-resource
                             config
                             tx
                             user
                             (assoc body-params
                                    :created_by (:id user)
                                    :source (get-in parameters [:body :source])))
                activity {:id (util/uuid)
                          :type "create_resource"
                          :owner_id (:id user)
                          :metadata {:resource_id resource-id
                                     :resource_type (:resource_type body-params)}}]
            (db.activity/create-activity tx activity)
            (r/created {:success? true
                        :message "New resource created"
                        :id resource-id}))))
      (catch Exception e
        (log logger :error ::failed-to-create-resource {:exception-message (.getMessage e)})
        (let [response {:success? false
                        :reason :could-not-create-resource}]

          (if (instance? SQLException e)
            (r/server-error response)
            (r/server-error (assoc-in response [:body :error-details :error] (.getMessage e)))))))))

(def ^:private post-params
  [:and
   (into [:map
          [:resource_type
           [:enum "Financing Resource", "Technical Resource", "Action Plan"]]
          [:title string?]
          [:country {:optional true} integer?]
          [:org {:optional true} map?
           (into
            [:map
             [:id {:optional true} integer?]
             [:name {:optional true} string?]
             [:url {:optional true} string?]
             [:country {:optional true} integer?]
             [:geo_coverage_type {:optional true}
              [:enum "global", "national", "transnational",
               "sub-national"]]]
            handler.geo/api-geo-coverage-schemas)]
          [:publish_year {:optional true} integer?]
          [:summary {:optional true} string?]
          [:value {:optional true} integer?]
          [:value_currency {:optional true} string?]
          [:value_remarks {:optional true} string?]
          [:valid_from {:optional true} string?]
          [:valid_to {:optional true} string?]
          [:geo_coverage_type
           [:enum "global", "national", "transnational",
            "sub-national"]]
          [:geo_coverage_value_subnational_city {:optional true} string?]
          [:image {:optional true} [:fn (comp util/base64? util/base64-headless)]]
          [:thumbnail {:optional true} [:fn (comp util/base64? util/base64-headless)]]
          [:remarks {:optional true} string?]
          [:urls {:optional true}
           [:vector {:optional true}
            [:map
             [:lang string?]
             [:url
              [:string {:min 1}]]]]]
          [:url {:optional true} string?]
          [:info_docs {:optional true} string?]
          [:capacity_building {:optional true} boolean?]
          [:is_member {:optional true} boolean?]
          [:sub_content_type {:optional true} string?]
          [:related_content {:optional true}
           [:vector {:optional true}
            [:map {:optional true}
             [:id [:int]]
             [:type (apply conj [:enum] dom.types/resources-types)]]]]
          [:first_publication_date {:optional true} string?]
          [:latest_amendment_date {:optional true} string?]
          [:document_preview {:optional true} boolean?]
          [:entity_connections {:optional true}
           [:vector {:optional true}
            [:map
             [:entity int?]
             [:role
              [:enum "owner" "implementor" "partner" "donor"]]]]]
          [:individual_connections {:optional true}
           [:vector {:optional true}
            [:map
             [:stakeholder int?]
             [:role
              [:enum "owner" "resource_editor"]]]]]
          [:tags {:optional true}
           [:vector {:optional true}
            [:map {:optional true}
             [:id {:optional true} pos-int?]
             [:tag string?]]]]
          [:language string?]
          [:source
           {:default dom.types/default-resource-source
            :decode/string keyword
            :decode/json keyword}
           (apply conj [:enum] dom.types/resource-source-types)]
          auth/owners-schema]
         handler.geo/api-geo-coverage-schemas)])

(defmethod ig/init-key :gpml.handler.resource/post-params [_ _]
  post-params)

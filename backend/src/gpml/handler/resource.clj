(ns gpml.handler.resource
  (:require [clojure.java.jdbc :as jdbc]
            [duct.logger :refer [log]]
            [gpml.auth :as auth]
            [gpml.db.activity :as db.activity]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.language :as db.language]
            [gpml.db.resource :as db.resource]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.domain.types :as dom.types]
            [gpml.handler.auth :as h.auth]
            [gpml.handler.image :as handler.image]
            [gpml.handler.resource.geo-coverage :as handler.geo]
            [gpml.handler.resource.related-content :as handler.resource.related-content]
            [gpml.handler.resource.tag :as handler.resource.tag]
            [gpml.handler.util :as handler.util]
            [gpml.util :as util]
            [gpml.util.email :as email]
            [gpml.util.sql :as sql-util]
            [integrant.core :as ig]
            [ring.util.response :as resp])
  (:import [java.sql SQLException]))

(defn- expand-entity-associations
  [entity-connections resource-id]
  (vec (for [connection entity-connections]
         {:column_name "resource"
          :topic "resource"
          :topic_id resource-id
          :organisation (:entity connection)
          :association (:role connection)
          :remarks nil})))

(defn- expand-individual-associations
  [individual-connections resource-id]
  (vec (for [connection individual-connections]
         {:column_name "resource"
          :topic "resource"
          :topic_id resource-id
          :stakeholder (:stakeholder connection)
          :association (:role connection)
          :remarks nil})))

(defn- create-resource
  [{:keys [logger mailjet-config] :as config} conn
   {:keys [resource_type title publish_year
           summary value value_currency
           value_remarks valid_from valid_to image
           geo_coverage_type geo_coverage_value
           geo_coverage_countries geo_coverage_country_groups
           geo_coverage_value_subnational_city geo_coverage_country_states
           attachments country urls tags remarks thumbnail
           created_by url owners info_docs sub_content_type related_content
           first_publication_date latest_amendment_date document_preview
           entity_connections individual_connections language
           capacity_building source]}]
  (let [data (cond-> {:type resource_type
                      :title title
                      :publish_year publish_year
                      :summary summary
                      :value value
                      :value_currency value_currency
                      :value_remarks value_remarks
                      :valid_from valid_from
                      :valid_to valid_to
                      :image (handler.image/assoc-image config conn image "resource")
                      :thumbnail (handler.image/assoc-image config conn thumbnail "resource")
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
               (assoc :capacity_building capacity_building))
        resource-id (:id (db.resource/new-resource
                          conn
                          (update data :source #(sql-util/keyword->pg-enum % "resource_source"))))
        api-individual-connections (handler.util/individual-connections->api-individual-connections conn individual_connections created_by)
        owners (distinct (remove nil? (flatten (conj owners
                                                     (map #(when (= (:role %) "owner")
                                                             (:stakeholder %))
                                                          api-individual-connections)))))
        geo-coverage-type (keyword geo_coverage_type)]
    (when (seq related_content)
      (handler.resource.related-content/create-related-contents conn logger resource-id "resource" related_content))
    (doseq [stakeholder-id owners]
      (h.auth/grant-topic-to-stakeholder! conn {:topic-id resource-id
                                                :topic-type "resource"
                                                :stakeholder-id stakeholder-id
                                                :roles ["owner"]}))
    (when (not-empty tags)
      (handler.resource.tag/create-resource-tags conn logger mailjet-config {:tags tags
                                                                             :tag-category "general"
                                                                             :resource-name "resource"
                                                                             :resource-id resource-id}))
    (when (not-empty entity_connections)
      (doseq [association (expand-entity-associations entity_connections resource-id)]
        (db.favorite/new-organisation-association conn association)))
    (when (not-empty api-individual-connections)
      (doseq [association (expand-individual-associations api-individual-connections resource-id)]
        (db.favorite/new-stakeholder-association conn association)))
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
  (fn [{:keys [jwt-claims body-params parameters] :as req}]
    (try
      (jdbc/with-db-transaction [tx (:spec db)]
        (let [user (db.stakeholder/stakeholder-by-email tx jwt-claims)
              resource-id (create-resource config
                                           tx
                                           (assoc body-params
                                                  :created_by (:id user)
                                                  :source (get-in parameters [:body :source])))
              activity {:id (util/uuid)
                        :type "create_resource"
                        :owner_id (:id user)
                        :metadata {:resource_id resource-id
                                   :resource_type (:resource_type body-params)}}]
          (db.activity/create-activity tx activity)
          (resp/created (:referrer req) {:success? true
                                         :message "New resource created"
                                         :id resource-id})))
      (catch Exception e
        (log logger :error ::failed-to-create-resource {:exception-message (.getMessage e)})
        (let [response {:status 500
                        :body {:success? false
                               :reason :could-not-create-resource}}]

          (if (instance? SQLException e)
            response
            (assoc-in response [:body :error-details :error] (.getMessage e))))))))

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

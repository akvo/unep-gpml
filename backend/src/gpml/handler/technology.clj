(ns gpml.handler.technology
  (:require [clojure.java.jdbc :as jdbc]
            [duct.logger :refer [log]]
            [gpml.auth :as auth]
            [gpml.constants :as constants]
            [gpml.db.country :as db.country]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.language :as db.language]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.technology :as db.technology]
            [gpml.domain.types :as dom.types]
            [gpml.handler.auth :as h.auth]
            [gpml.handler.geo :as handler.geo]
            [gpml.handler.image :as handler.image]
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
         {:column_name "technology"
          :topic "technology"
          :topic_id resource-id
          :organisation (:entity connection)
          :association (:role connection)
          :remarks nil})))

(defn- expand-individual-associations
  [individual-connections resource-id]
  (vec (for [connection individual-connections]
         {:column_name "technology"
          :topic "technology"
          :topic_id resource-id
          :stakeholder (:stakeholder connection)
          :association (:role connection)
          :remarks nil})))

(defn- create-technology
  [{:keys [logger mailjet-config] :as config} tx
   {:keys [name organisation_type
           development_stage specifications_provided
           year_founded email country
           geo_coverage_type geo_coverage_value
           geo_coverage_countries geo_coverage_country_groups
           geo_coverage_value_subnational_city
           tags url urls created_by image owners info_docs
           sub_content_type related_content
           headquarter document_preview
           logo thumbnail attachments remarks
           entity_connections individual_connections language
           capacity_building source]}]
  (let [data (cond-> {:name name
                      :year_founded year_founded
                      :organisation_type organisation_type
                      :development_stage development_stage
                      :specifications_provided specifications_provided
                      :email email
                      :url url
                      :country country
                      :image (handler.image/assoc-image config tx image "technology")
                      :logo (handler.image/assoc-image config tx logo "technology")
                      :thumbnail (handler.image/assoc-image config tx thumbnail "technology")
                      :geo_coverage_type geo_coverage_type
                      :geo_coverage_value geo_coverage_value
                      :geo_coverage_countries geo_coverage_countries
                      :geo_coverage_country_groups geo_coverage_country_groups
                      :subnational_city geo_coverage_value_subnational_city
                      :remarks remarks
                      :attachments attachments
                      :created_by created_by
                      :owners owners
                      :info_docs info_docs
                      :sub_content_type sub_content_type
                      :headquarter headquarter
                      :document_preview document_preview
                      :review_status "SUBMITTED"
                      :language language
                      :source source}
               (not (nil? capacity_building))
               (assoc :capacity_building capacity_building))
        technology-id (->>
                       (update data :source #(sql-util/keyword->pg-enum % "resource_source"))
                       (db.technology/new-technology tx)
                       :id)
        api-individual-connections (handler.util/individual-connections->api-individual-connections tx individual_connections created_by)
        owners (distinct (remove nil? (flatten (conj owners
                                                     (map #(when (= (:role %) "owner")
                                                             (:stakeholder %))
                                                          api-individual-connections)))))]
    (when (seq related_content)
      (handler.resource.related-content/create-related-contents tx logger technology-id "technology" related_content))
    (when headquarter
      (db.country/add-country-headquarter tx {:id country :headquarter headquarter}))
    (doseq [stakeholder-id owners]
      (h.auth/grant-topic-to-stakeholder! tx {:topic-id technology-id
                                              :topic-type "technology"
                                              :stakeholder-id stakeholder-id
                                              :roles ["owner"]}))
    (when (not-empty entity_connections)
      (doseq [association (expand-entity-associations entity_connections technology-id)]
        (db.favorite/new-organisation-association tx association)))
    (when (not-empty api-individual-connections)
      (doseq [association (expand-individual-associations api-individual-connections technology-id)]
        (db.favorite/new-stakeholder-association tx association)))
    (when (not-empty tags)
      (handler.resource.tag/create-resource-tags tx logger mailjet-config {:tags tags
                                                                           :tag-category "general"
                                                                           :resource-name "technology"
                                                                           :resource-id technology-id}))
    (when (not-empty urls)
      (let [lang-urls (map #(vector technology-id
                                    (->> % :lang
                                         (assoc {} :iso_code)
                                         (db.language/language-by-iso-code tx)
                                         :id)
                                    (:url %)) urls)]
        (db.technology/add-technology-language-urls tx {:urls lang-urls})))
    (if (or (not-empty geo_coverage_country_groups)
            (not-empty geo_coverage_countries))
      (let [geo-data (handler.geo/get-geo-vector-v2 technology-id data)]
        (db.technology/add-technology-geo tx {:geo geo-data}))
      (when (not-empty geo_coverage_value)
        (let [geo-data (handler.geo/get-geo-vector technology-id data)]
          (db.technology/add-technology-geo tx {:geo geo-data}))))
    (email/notify-admins-pending-approval
     tx
     mailjet-config
     (merge data {:type "technology"}))
    technology-id))

(defmethod ig/init-key :gpml.handler.technology/post
  [_ {:keys [db logger] :as config}]
  (fn [{:keys [jwt-claims body-params parameters] :as req}]
    (try
      (jdbc/with-db-transaction [tx (:spec db)]
        (let [user (db.stakeholder/stakeholder-by-email tx jwt-claims)
              technology-id (create-technology config tx (assoc body-params
                                                                :created_by (:id user)
                                                                :source (get-in parameters [:body :source])))]
          (resp/created (:referrer req) {:success? true
                                         :message "New technology created"
                                         :id technology-id})))
      (catch Exception e
        (log logger :error ::failed-to-create-technology {:exception-message (.getMessage e)})
        (let [response {:status 500
                        :body {:success? false
                               :reason :could-not-create-technology}}]

          (if (instance? SQLException e)
            response
            (assoc-in response [:body :error-details :error] (.getMessage e))))))))

(def ^:private post-params
  (into [:map
         [:name string?]
         [:year_founded {:optional true} integer?]
         [:organisation_type {:optional true}
          [:enum "Established Company", "Research Lab", "Academic Institution",
           "Startup", "Non-Profit Org", "Partnerships"]]
         [:development_stage {:optional true}
          [:enum "In market", "Scale up", "Prototype", "Pilot"
           "Development", "Research"]]
         [:country {:optional true} integer?]
         [:geo_coverage_type
          [:enum "global", "national", "transnational",
           "sub-national"]]
         [:geo_coverage_value_subnational_city {:optional true} string?]
         [:image {:optional true} [:fn (comp util/base64? util/base64-headless)]]
         [:thumbnail {:optional true} [:fn (comp util/base64? util/base64-headless)]]
         [:logo {:optional true} string?]
         [:tags {:optional true}
          [:vector {:optional true}
           [:map {:optional true}
            [:id {:optional true} pos-int?]
            [:tag string?]]]]
         [:url {:optional true} string?]
         [:info_docs {:optional true} string?]
         [:related_content {:optional true}
          [:vector {:optional true}
           [:map {:optional true}
            [:id [:int]]
            [:type (vec (conj constants/resources :enum))]]]]
         [:sub_content_type {:optional true} string?]
         [:headquarter {:optional true} string?]
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
         [:urls {:optional true}
          [:vector {:optional true}
           [:map [:lang string?] [:url [:string {:min 1}]]]]]
         [:language string?]
         [:capacity_building {:optional true} boolean?]
         [:source {:default dom.types/default-resource-source
                   :decode/string keyword
                   :decode/json keyword}
          (apply conj [:enum] dom.types/resource-source-types)]
         auth/owners-schema]
        handler.geo/params-payload))

(defmethod ig/init-key :gpml.handler.technology/post-params [_ _]
  post-params)

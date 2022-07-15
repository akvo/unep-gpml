(ns gpml.handler.technology
  (:require [clojure.java.jdbc :as jdbc]
            [gpml.auth :as auth]
            [gpml.constants :as constants]
            [gpml.db.country :as db.country]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.language :as db.language]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.technology :as db.technology]
            [gpml.handler.auth :as h.auth]
            [gpml.handler.geo :as handler.geo]
            [gpml.handler.image :as handler.image]
            [gpml.handler.resource.related-content :as handler.resource.related-content]
            [gpml.handler.resource.tag :as handler.resource.tag]
            [gpml.handler.util :as handler.util]
            [gpml.util :as util]
            [gpml.util.email :as email]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defn expand-entity-associations
  [entity-connections resource-id]
  (vec (for [connection entity-connections]
         {:column_name "technology"
          :topic "technology"
          :topic_id resource-id
          :organisation (:entity connection)
          :association (:role connection)
          :remarks nil})))

(defn expand-individual-associations
  [individual-connections resource-id]
  (vec (for [connection individual-connections]
         {:column_name "technology"
          :topic "technology"
          :topic_id resource-id
          :stakeholder (:stakeholder connection)
          :association (:role connection)
          :remarks nil})))

(defn create-technology [conn mailjet-config
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
                                 entity_connections individual_connections]}]
  (let [data {:name name
              :year_founded year_founded
              :organisation_type organisation_type
              :development_stage development_stage
              :specifications_provided specifications_provided
              :email email
              :url url
              :country country
              :image (handler.image/assoc-image conn image "technology")
              :logo (handler.image/assoc-image conn logo "technology")
              :thumbnail (handler.image/assoc-image conn thumbnail "technology")
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
              :review_status "SUBMITTED"}
        technology-id (->> data (db.technology/new-technology conn) :id)
        api-individual-connections (handler.util/individual-connections->api-individual-connections conn individual_connections created_by)
        owners (distinct (remove nil? (flatten (conj owners
                                                     (map #(when (= (:role %) "owner")
                                                             (:stakeholder %))
                                                          api-individual-connections)))))]
    (when (seq related_content)
      (handler.resource.related-content/create-related-contents conn technology-id "technology" related_content))
    (when headquarter
      (db.country/add-country-headquarter conn {:id country :headquarter headquarter}))
    (doseq [stakeholder-id owners]
      (h.auth/grant-topic-to-stakeholder! conn {:topic-id technology-id
                                                :topic-type "technology"
                                                :stakeholder-id stakeholder-id
                                                :roles ["owner"]}))
    (when (not-empty entity_connections)
      (doseq [association (expand-entity-associations entity_connections technology-id)]
        (db.favorite/new-organisation-association conn association)))
    (when (not-empty api-individual-connections)
      (doseq [association (expand-individual-associations api-individual-connections technology-id)]
        (db.favorite/new-stakeholder-association conn association)))
    (when (not-empty tags)
      (handler.resource.tag/create-resource-tags conn mailjet-config {:tags tags
                                                                      :tag-category "general"
                                                                      :resource-name "technology"
                                                                      :resource-id technology-id}))
    (when (not-empty urls)
      (let [lang-urls (map #(vector technology-id
                                    (->> % :lang
                                         (assoc {} :iso_code)
                                         (db.language/language-by-iso-code conn)
                                         :id)
                                    (:url %)) urls)]
        (db.technology/add-technology-language-urls conn {:urls lang-urls})))
    (if (or (not-empty geo_coverage_country_groups)
            (not-empty geo_coverage_countries))
      (let [geo-data (handler.geo/get-geo-vector-v2 technology-id data)]
        (db.technology/add-technology-geo conn {:geo geo-data}))
      (when (not-empty geo_coverage_value)
        (let [geo-data (handler.geo/get-geo-vector technology-id data)]
          (db.technology/add-technology-geo conn {:geo geo-data}))))
    (email/notify-admins-pending-approval
     conn
     mailjet-config
     (merge data {:type "technology"}))
    technology-id))

(defmethod ig/init-key :gpml.handler.technology/post [_ {:keys [db mailjet-config]}]
  (fn [{:keys [jwt-claims body-params] :as req}]
    (jdbc/with-db-transaction [conn (:spec db)]
      (let [user (db.stakeholder/stakeholder-by-email conn jwt-claims)
            technology-id (create-technology conn mailjet-config (assoc body-params
                                                                        :created_by (:id user)))]
        (resp/created (:referrer req) {:message "New technology created" :id technology-id})))))

(def post-params
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
          [:enum "global", "regional", "national", "transnational",
           "sub-national", "global with elements in specific areas"]]
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
         auth/owners-schema]
        handler.geo/params-payload))

(defmethod ig/init-key :gpml.handler.technology/post-params [_ _]
  post-params)

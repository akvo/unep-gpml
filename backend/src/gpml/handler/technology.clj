(ns gpml.handler.technology
  (:require
   [clojure.java.jdbc :as jdbc]
   [clojure.set :as set]
   [duct.logger :refer [log]]
   [gpml.auth :as auth]
   [gpml.db.country :as db.country]
   [gpml.db.language :as db.language]
   [gpml.db.technology :as db.technology]
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
  (:import
   (java.sql SQLException)))

(defn- create-technology [{:keys [logger mailjet-config] :as config}
                          conn
                          user
                          {:keys [name organisation_type
                                  development_stage specifications_provided
                                  year_founded email country
                                  geo_coverage_type geo_coverage_value
                                  geo_coverage_countries geo_coverage_country_groups
                                  geo_coverage_value_subnational_city geo_coverage_country_states
                                  tags url urls created_by image owners info_docs
                                  sub_content_type related_content
                                  headquarter document_preview
                                  thumbnail attachments remarks
                                  entity_connections individual_connections language
                                  capacity_building source]}]
  (let [image-id (when (seq image)
                   (handler.file/create-file config conn image :technology :images :public))
        thumbnail-id (when (seq thumbnail)
                       (handler.file/create-file config conn thumbnail :technology :images :public))
        data (cond-> {:name name
                      :year_founded year_founded
                      :organisation_type organisation_type
                      :development_stage development_stage
                      :specifications_provided specifications_provided
                      :email email
                      :url url
                      :country country
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
               (assoc :capacity_building capacity_building)

               image-id
               (assoc :image_id image-id)

               thumbnail-id
               (assoc :thumbnail_id thumbnail-id))
        technology-id (->>
                       (update data :source #(sql-util/keyword->pg-enum % "resource_source"))
                       (db.technology/new-technology conn)
                       :id)
        api-individual-connections (handler.util/individual-connections->api-individual-connections conn individual_connections created_by)
        geo-coverage-type (keyword geo_coverage_type)
        org-associations (map #(set/rename-keys % {:entity :organisation}) entity_connections)]
    (when (seq related_content)
      (handler.resource.related-content/create-related-contents conn logger technology-id "technology" related_content))
    (when headquarter
      (db.country/add-country-headquarter conn {:id country :headquarter headquarter}))
    (srv.permissions/create-resource-context
     {:conn conn
      :logger logger}
     {:context-type :technology
      :resource-id technology-id})
    (srv.association/save-associations
     {:conn conn
      :logger logger}
     {:org-associations org-associations
      :sth-associations (if (seq api-individual-connections)
                          api-individual-connections
                          [{:role "owner"
                            :stakeholder (:id user)}])
      :resource-type "technology"
      :resource-id technology-id})
    (when (not-empty tags)
      (handler.resource.tag/create-resource-tags conn logger mailjet-config {:tags tags
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
    (handler.geo/create-resource-geo-coverage conn
                                              :technology
                                              technology-id
                                              geo-coverage-type
                                              {:countries geo_coverage_countries
                                               :country-groups geo_coverage_country_groups
                                               :country-states geo_coverage_country_states})
    (email/notify-admins-pending-approval
     conn
     mailjet-config
     (merge data {:type "technology"}))
    technology-id))

(defmethod ig/init-key :gpml.handler.technology/post
  [_ {:keys [db logger] :as config}]
  (fn [{:keys [body-params parameters user]}]
    (try
      (if-not (h.r.permission/operation-allowed?
               config
               {:user-id (:id user)
                :entity-type :technology
                :operation-type :create
                :root-context? true})
        (r/forbidden {:message "Unauthorized"})
        (jdbc/with-db-transaction [tx (:spec db)]
          (let [technology-id (create-technology
                               config
                               tx
                               user
                               (assoc body-params
                                      :created_by (:id user)
                                      :source (get-in parameters [:body :source])))]
            (r/created {:success? true
                        :message "New technology created"
                        :id technology-id}))))
      (catch Exception e
        (log logger :error :failed-to-create-technology e)
        (let [response {:success? false
                        :reason :could-not-create-technology}]

          (if (instance? SQLException e)
            (r/server-error response)
            (r/server-error (assoc-in response [:body :error-details :error] (.getMessage e)))))))))

(def ^:private post-params
  [:and
   (into
    [:map
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
        [:type (apply conj [:enum] dom.types/resources-types)]]]]
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
    handler.geo/api-geo-coverage-schemas)
   handler.geo/api-geo-coverage-validator-schema])

(defmethod ig/init-key :gpml.handler.technology/post-params [_ _]
  post-params)

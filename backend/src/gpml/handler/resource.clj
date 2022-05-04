(ns gpml.handler.resource
  (:require [clojure.java.jdbc :as jdbc]
            [gpml.auth :as auth]
            [gpml.db.activity :as db.activity]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.language :as db.language]
            [gpml.db.resource :as db.resource]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.email-util :as email]
            [gpml.handler.auth :as h.auth]
            [gpml.handler.geo :as handler.geo]
            [gpml.handler.image :as handler.image]
            [gpml.pg-util :as pg-util]
            [gpml.util :as util]
            [integrant.core :as ig]
            [ring.util.response :as resp]
            [gpml.db.tag :as db.tag]))

(defn expand-entity-associations
  [entity-connections resource-id]
  (vec (for [connection entity-connections]
         {:column_name "resource"
          :topic "resource"
          :topic_id resource-id
          :organisation (:entity connection)
          :association (:role connection)
          :remarks nil})))

(defn expand-individual-associations
  [individual-connections resource-id]
  (vec (for [connection individual-connections]
         {:column_name "resource"
          :topic "resource"
          :topic_id resource-id
          :stakeholder (:stakeholder connection)
          :association (:role connection)
          :remarks nil})))

(defn add-tags [conn mailjet-config tags resource-id]
  (let [tag-ids (map #(:id %) tags)]
    (if-not (some nil? tag-ids)
      (db.resource/add-resource-tags conn {:tags (map #(vector resource-id %) tag-ids)})
      (let [tag-category (:id (db.tag/tag-category-by-category-name conn {:category "general"}))
            new-tags (filter #(not (contains? % :id)) tags)
            tags-to-db (map #(vector % tag-category) (vec (map #(:tag %) new-tags)))
            new-tag-ids (map #(:id %) (db.tag/new-tags conn {:tags tags-to-db}))]
        (db.resource/add-resource-tags conn {:tags (map #(vector resource-id %) (concat (remove nil? tag-ids) new-tag-ids))})
        (map
         #(email/notify-admins-pending-approval
           conn
           mailjet-config
           (merge % {:type "tag"}))
         new-tags)))))

(defn create-resource [conn {:keys [resource_type title publish_year
                                    summary value value_currency
                                    value_remarks valid_from valid_to image
                                    geo_coverage_type geo_coverage_value
                                    geo_coverage_countries geo_coverage_country_groups
                                    geo_coverage_value_subnational_city
                                    attachments country urls tags remarks
                                    created_by url mailjet-config owners
                                    info_docs sub_content_type related_content
                                    first_publication_date latest_amendment_date document_preview
                                    entity_connections individual_connections]}]
  (let [data {:type resource_type
              :title title
              :publish_year publish_year
              :summary summary
              :value value
              :value_currency value_currency
              :value_remarks value_remarks
              :valid_from valid_from
              :valid_to valid_to
              :image (handler.image/assoc-image conn image "resource")
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
              :related_content (pg-util/->JDBCArray related_content "integer")
              :first_publication_date first_publication_date
              :latest_amendment_date latest_amendment_date
              :document_preview document_preview}
        resource-id (:id (db.resource/new-resource conn data))
        individual_connections (conj individual_connections {:stakeholder created_by
                                                             :role "owner"})
        owners (distinct (remove nil? (flatten (conj owners
                                                     (map #(when (= (:role %) "owner")
                                                             (:stakeholder %))
                                                          individual_connections)))))]
    (doseq [stakeholder-id owners]
      (h.auth/grant-topic-to-stakeholder! conn {:topic-id resource-id
                                                :topic-type "resource"
                                                :stakeholder-id stakeholder-id
                                                :roles ["owner"]}))
    (when (not-empty tags)
      (add-tags conn mailjet-config tags resource-id))
    (when (not-empty entity_connections)
      (doseq [association (expand-entity-associations entity_connections resource-id)]
        (db.favorite/new-organisation-association conn association)))
    (doseq [association (expand-individual-associations individual_connections resource-id)]
      (db.favorite/new-association conn association))
    (when (not-empty urls)
      (let [lang-urls (map #(vector resource-id
                                    (->> % :lang
                                         (assoc {} :iso_code)
                                         (db.language/language-by-iso-code conn)
                                         :id)
                                    (:url %)) urls)]
        (db.resource/add-resource-language-urls conn {:urls lang-urls})))
    (if (or (not-empty geo_coverage_country_groups)
            (not-empty geo_coverage_countries))
      (let [geo-data (handler.geo/get-geo-vector-v2 resource-id data)]
        (db.resource/add-resource-geo conn {:geo geo-data}))
      (when (not-empty geo_coverage_value)
        (let [geo-data (handler.geo/get-geo-vector resource-id data)]
          (db.resource/add-resource-geo conn {:geo geo-data}))))
    (email/notify-admins-pending-approval
     conn
     mailjet-config
     (merge data {:type resource_type}))
    resource-id))

(defmethod ig/init-key :gpml.handler.resource/post [_ {:keys [db mailjet-config]}]
  (fn [{:keys [jwt-claims body-params] :as req}]
    (jdbc/with-db-transaction [conn (:spec db)]
      (let [user (db.stakeholder/stakeholder-by-email conn jwt-claims)
            resource-id (create-resource conn (assoc body-params
                                                     :created_by (:id user)
                                                     :mailjet-config mailjet-config))
            activity {:id (util/uuid)
                      :type "create_resource"
                      :owner_id (:id user)
                      :metadata {:resource_id resource-id
                                 :resource_type (:resource_type body-params)}}]
        (db.activity/create-activity conn activity)
        (resp/created (:referrer req) {:message "New resource created" :id resource-id})))))

(defn or-and [resource_type validator]
  (or (= "Action Plan" resource_type)
      (and (= "Technical Resource" resource_type) (empty? validator))
      (and (= "Financing Resource" resource_type) (some? validator))))

(def post-params
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
              [:enum "global", "regional", "national", "transnational",
               "sub-national", "global with elements in specific areas"]]]
            handler.geo/params-payload)]
          [:publish_year {:optional true} integer?]
          [:summary {:optional true} string?]
          [:value {:optional true} integer?]
          [:value_currency {:optional true} string?]
          [:value_remarks {:optional true} string?]
          [:valid_from {:optional true} string?]
          [:valid_to {:optional true} string?]
          [:geo_coverage_type
           [:enum "global", "regional", "national", "transnational",
            "sub-national", "global with elements in specific areas"]]
          [:geo_coverage_value_subnational_city {:optional true} string?]
          [:image {:optional true} string?]
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
           [:vector {:optional true} integer?]]
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
          auth/owners-schema]
         handler.geo/params-payload)])

(defmethod ig/init-key :gpml.handler.resource/post-params [_ _]
  post-params)

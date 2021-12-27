(ns gpml.handler.resource
  (:require [clojure.java.jdbc :as jdbc]
            [gpml.auth :as auth]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.language :as db.language]
            [gpml.db.resource :as db.resource]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.email-util :as email]
            [gpml.handler.geo :as handler.geo]
            [gpml.handler.image :as handler.image]
            [gpml.handler.auth :as h.auth]
            [gpml.handler.organisation :as handler.org]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

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

(defn create-resource [conn {:keys [resource_type title org publish_year
                                    summary value value_currency
                                    value_remarks valid_from valid_to image
                                    geo_coverage_type geo_coverage_value
                                    geo_coverage_countries geo_coverage_country_groups
                                    attachments country urls tags remarks
                                    created_by url mailjet-config owners
                                    info_docs sub_content_type
                                    entity_connections individual_connections]}]
  (let [entity_connections [{:entity 8
                             :role "owner"}]
        individual_connections [{:stakeholder 10003
                                 :role "owner"}]
        organisation (if (= -1 (:id org))
                       [(handler.org/create conn org)]
                       [(:id org)])
        data {:type resource_type
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
              :country country
              :attachments attachments
              :remarks remarks
              :created_by created_by
              :url url
              :info-docs info_docs
              :sub_content_type sub_content_type}
        resource-id (:id (db.resource/new-resource conn data))]
    (when (not-empty owners)
      (doseq [stakeholder-id owners]
        (h.auth/grant-topic-to-stakeholder! conn {:topic-id resource-id
                                                  :topic-type "resource"
                                                  :stakeholder-id stakeholder-id
                                                  :roles ["owner"]})))
    (when (not-empty organisation)
      (db.resource/add-resource-organisations conn {:organisations
                                                    (map #(vector resource-id %) organisation)}))
    (when (not-empty tags)
      (db.resource/add-resource-tags conn {:tags
                                           (map #(vector resource-id %) tags)}))
    (when (not-empty entity_connections)
      (doseq [association (expand-entity-associations entity_connections resource-id)]
        (db.favorite/new-organisation-association conn association)))
    (when (not-empty individual_connections)
      (doseq [association (expand-individual-associations individual_connections resource-id)]
        (db.favorite/new-association conn association)))
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
                                                     :mailjet-config mailjet-config))]
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
          [:country integer?]
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
          [:publish_year integer?]
          [:summary {:optional true} string?]
          [:value {:optional true} integer?]
          [:value_currency {:optional true} string?]
          [:value_remarks {:optional true} string?]
          [:valid_from {:optional true} string?]
          [:valid_to {:optional true} string?]
          [:geo_coverage_type
           [:enum "global", "regional", "national", "transnational",
            "sub-national", "global with elements in specific areas"]]
          [:image {:optional true} string?]
          [:remarks {:optional true} string?]
          [:urls {:optional true}
           [:vector {:optional true}
            [:map [:lang string?] [:url [:string {:min 1}]]]]]
          [:tags {:optional true}
           [:vector {:optional true} integer?]]
          auth/owners-schema]
         handler.geo/params-payload)
   [:fn {:error/message "value is required" :error/path [:value]}
    (fn [{:keys [resource_type value]}] (or-and resource_type value))]
   [:fn {:error/message "value_currency is required" :error/path [:value_currency]}
    (fn [{:keys [resource_type value_currency]}] (or-and resource_type value_currency))]
   [:fn {:error/message "valid_from is required" :error/path [:valid_from]}
    (fn [{:keys [resource_type valid_from]}] (or-and resource_type valid_from))]
   [:fn {:error/message "valid_to is required" :error/path [:valid_to]}
    (fn [{:keys [resource_type valid_to]}] (or-and resource_type valid_to))]])

(defmethod ig/init-key :gpml.handler.resource/post-params [_ _]
  post-params)

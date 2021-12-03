(ns gpml.handler.resource
  (:require [clojure.java.jdbc :as jdbc]
            [gpml.handler.geo :as handler.geo]
            [gpml.handler.organisation :as handler.org]
            [gpml.handler.image :as handler.image]
            [gpml.db.language :as db.language]
            [gpml.db.resource :as db.resource]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.email-util :as email]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defn create-resource [conn {:keys [resource_type title org publish_year
                                    summary value value_currency
                                    value_remarks valid_from valid_to image
                                    geo_coverage_type geo_coverage_value
                                    geo_coverage_countries geo_coverage_country_groups
                                    attachments country urls tags remarks
                                    created_by mailjet-config]}]
  (let [organisation (if (= -1 (:id org))
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
              :created_by created_by}
        resource-id (->> data (db.resource/new-resource conn) :id)]
    (when (not-empty organisation)
      (db.resource/add-resource-organisations conn {:organisations
                                                    (map #(vector resource-id %) organisation)}))
    (when (not-empty tags)
      (db.resource/add-resource-tags conn {:tags
                                           (map #(vector resource-id %) tags)}))
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
           [:vector {:optional true} integer?]]]
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

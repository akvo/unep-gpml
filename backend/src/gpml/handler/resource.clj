(ns gpml.handler.resource
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.string :as str]
            [gpml.db.country :as db.country]
            [gpml.db.country-group :as db.country-group]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.language :as db.language]
            [gpml.db.resource :as db.resource]
            [gpml.db.stakeholder :as db.stakeholder]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defn get-country [conn country]
  (:id (db.country/country-by-code conn {:name country})))

(defn get-geo-data [db id geo-type geo-value]
  (cond
    (#{"regional" "global with elements in specific areas"} geo-type)
    (->> {:names geo-value}
         (db.country-group/country-group-by-names db)
         (map #(vector id (:id %) nil)))
    (#{"transnational" "national"} geo-type)
    (->> {:codes geo-value}
         (db.country/country-by-codes db)
         (map #(vector id nil (:id %))))))

(defn assoc-image [conn image]
  (cond
    (nil? image) nil
    (re-find #"^\/image\/" image) image
    :else (str/join ["/image/resource/"
                    (:id (db.resource/new-resource-image conn {:image image}))])))

(defn new-organisation [conn org]
  (let [country (get-country conn (:country org))
        org-id (:id (db.organisation/new-organisation conn (assoc (dissoc org :id) :country country)))
        org-geo (get-geo-data conn org-id (:geo_coverage_type org) (:geo_coverage_value org))]
    (when (seq org-geo)
      (db.organisation/add-geo-coverage conn {:geo org-geo}))
    org-id))

(defn create-resource [conn {:keys [resource_type title org publish_year
                                    summary value value_currency
                                    value_remarks valid_from valid_to image
                                    geo_coverage_type geo_coverage_value
                                    attachments country urls tags remarks
                                    created_by]}]
  (let [organisation (if (= -1 (:id org))
                      [(new-organisation conn org)]
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
              :image (assoc-image conn image)
              :geo_coverage_type geo_coverage_type
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
    (when (not-empty geo_coverage_value)
      (let [geo-data
            (cond
              (contains?
               #{"regional" "global with elements in specific areas"}
               geo_coverage_type)
              (->> {:names geo_coverage_value}
                   (db.country-group/country-group-by-names conn)
                   (map #(vector resource-id (:id %) nil)))
              (contains?
               #{"national" "transnational"}
               geo_coverage_type)
              (->> {:codes geo_coverage_value}
                   (db.country/country-by-codes conn)
                   (map #(vector resource-id nil (:id %)))))]
        (when (some? geo-data)
          (db.resource/add-resource-geo conn {:geo geo-data}))))
    resource-id))

(defmethod ig/init-key :gpml.handler.resource/post [_ {:keys [db]}]
  (fn [{:keys [jwt-claims body-params] :as req}]
    (jdbc/with-db-transaction [conn (:spec db)]
      (let [user (db.stakeholder/stakeholder-by-email conn jwt-claims)
            resource-id (create-resource conn (assoc body-params :created_by (:id user)))]
    (resp/created (:referrer req) {:message "New resource created" :id resource-id})))))

(defn or-and [resource_type validator]
  (or (and (= "Technical Resource" resource_type) (empty? validator))
      (and (= "Financing Resource" resource_type) (some? validator))))

(def post-params
  [:and
   [:map
    [:resource_type
     [:enum "Financing Resource", "Technical Resource", "Action Plan"]]
    [:title string?]
    [:country integer?]
    [:org {:optional true} map?
     [:map
      [:id {:optional true} int?]
      [:name {:optional true} string?]
      [:url {:optional true} string?]
      [:country {:optional true} string?]
      [:geo_coverage_type {:optional true}
       [:enum "global", "regional", "national", "transnational",
        "sub-national", "global with elements in specific areas"]]
      [:geo_coverage_value {:optional true}
       [:vector {:min 1 :error/message "Need at least one of geo coverage value"} string?]]]]
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
    [:geo_coverage_value {:optional true}
     [:vector {:min 1 :error/message "Need at least one geo coverage value"} string?]]
    [:image {:optional true} string?]
   [:remarks {:optional true} string?]
   [:urls {:optional true}
    [:vector {:optional true}
     [:map [:lang string?] [:url [:string {:min 1}]]]]]
   [:tags {:optional true}
    [:vector {:optional true} int?]]]
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

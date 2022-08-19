(ns gpml.handler.policy
  (:require [clojure.java.jdbc :as jdbc]
            [duct.logger :refer [log]]
            [gpml.auth :as auth]
            [gpml.constants :as constants]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.policy :as db.policy]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.handler.auth :as h.auth]
            [gpml.handler.geo :as handler.geo]
            [gpml.handler.image :as handler.image]
            [gpml.handler.resource.related-content :as handler.resource.related-content]
            [gpml.handler.resource.tag :as handler.resource.tag]
            [gpml.handler.util :as handler.util]
            [gpml.util :as util]
            [gpml.util.email :as email]
            [gpml.util.postgresql :as pg-util]
            [integrant.core :as ig]
            [ring.util.response :as resp])
  (:import [java.sql SQLException]))

(defn expand-entity-associations
  [entity-connections resource-id]
  (vec (for [connection entity-connections]
         {:column_name "policy"
          :topic "policy"
          :topic_id resource-id
          :organisation (:entity connection)
          :association (:role connection)
          :remarks nil})))

(defn expand-individual-associations
  [individual-connections resource-id]
  (vec (for [connection individual-connections]
         {:column_name "policy"
          :topic "policy"
          :topic_id resource-id
          :stakeholder (:stakeholder connection)
          :association (:role connection)
          :remarks nil})))

(defn create-policy [conn logger mailjet-config
                     {:keys [title original_title abstract url
                             data_source type_of_law record_number
                             first_publication_date latest_amendment_date
                             status country geo_coverage_type
                             geo_coverage_value implementing_mea
                             geo_coverage_countries geo_coverage_country_groups
                             geo_coverage_value_subnational_city
                             tags created_by image thumbnail language
                             owners info_docs sub_content_type
                             document_preview related_content topics
                             attachments remarks entity_connections individual_connections]}]
  (let [data {:title title
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
              :image (handler.image/assoc-image conn image "policy")
              :thumbnail (handler.image/assoc-image conn thumbnail "policy")
              :geo_coverage_type geo_coverage_type
              :geo_coverage_value geo_coverage_value
              :geo_coverage_countries geo_coverage_countries
              :geo_coverage_country_groups geo_coverage_country_groups
              :subnational_city geo_coverage_value_subnational_city
              :implementing_mea implementing_mea
              :attachments attachments
              :remarks remarks
              :created_by created_by
              :review_status "SUBMITTED"
              :language language}
        policy-geo-coverage-insert-cols ["policy" "country_group" "country"]
        policy-id (->> data (db.policy/new-policy conn) :id)
        api-individual-connections (handler.util/individual-connections->api-individual-connections conn individual_connections created_by)
        owners (distinct (remove nil? (flatten (conj owners
                                                     (map #(when (= (:role %) "owner")
                                                             (:stakeholder %))
                                                          api-individual-connections)))))]
    (when (seq related_content)
      (handler.resource.related-content/create-related-contents conn policy-id "policy" related_content))
    (when (not-empty tags)
      (handler.resource.tag/create-resource-tags conn logger mailjet-config {:tags tags
                                                                             :tag-category "general"
                                                                             :resource-name "policy"
                                                                             :resource-id policy-id}))
    (doseq [stakeholder-id owners]
      (h.auth/grant-topic-to-stakeholder! conn {:topic-id policy-id
                                                :topic-type "policy"
                                                :stakeholder-id stakeholder-id
                                                :roles ["owner"]}))
    (when (not-empty entity_connections)
      (doseq [association (expand-entity-associations entity_connections policy-id)]
        (db.favorite/new-organisation-association conn association)))
    (when (not-empty api-individual-connections)
      (doseq [association (expand-individual-associations api-individual-connections policy-id)]
        (db.favorite/new-stakeholder-association conn association)))
    (if (or (not-empty geo_coverage_country_groups)
            (not-empty geo_coverage_countries))
      (let [geo-data (handler.geo/get-geo-vector-v2 policy-id data)]
        (db.policy/add-policies-geo conn {:geo geo-data
                                          :insert-cols policy-geo-coverage-insert-cols}))
      (when (not-empty geo_coverage_value)
        (let [geo-data (handler.geo/get-geo-vector policy-id data)]
          (db.policy/add-policies-geo conn {:geo geo-data
                                            :insert-cols policy-geo-coverage-insert-cols}))))
    (email/notify-admins-pending-approval
     conn
     mailjet-config
     (merge data {:type "policy"}))
    policy-id))

(defmethod ig/init-key :gpml.handler.policy/post
  [_ {:keys [db logger mailjet-config]}]
  (fn [{:keys [jwt-claims body-params] :as req}]
    (try
      (jdbc/with-db-transaction [conn (:spec db)]
        (let [user (db.stakeholder/stakeholder-by-email conn jwt-claims)
              policy-id (create-policy conn logger mailjet-config (assoc body-params
                                                                         :created_by (:id user)))]
          (resp/created (:referrer req) {:success? true
                                         :message "New policy created"
                                         :id policy-id})))
      (catch Exception e
        (log logger :error ::failed-to-create-policy {:exception-message (.getMessage e)})
        (let [response {:status 500
                        :body {:success? false
                               :reason :could-not-create-event}}]

          (if (instance? SQLException e)
            response
            (assoc-in response [:body :error-details :error] (.getMessage e))))))))

(def post-params
  (->
   [:map
    [:title string?]
    [:original_title {:optional true} string?]
    [:abstract {:optional true} string?]
    [:data_source {:optional true} string?]
    [:type_of_law {:optional true}
     [:enum "Legislation", "Miscellaneous", "Regulation", "Constitution"]]
    [:record_number {:optional true} string?]
    [:first_publication_date {:optional true} string?]
    [:latest_amendment_date {:optional true} string?]
    [:status {:optional true} [:enum "Repealed", "In force", "Not yet in force"]]
    [:country {:optional true} integer?]
    [:geo_coverage_type
     [:enum "global", "regional", "national", "transnational",
      "sub-national", "global with elements in specific areas"]]
    [:geo_coverage_value_subnational_city {:optional true} string?]
    [:image {:optional true} [:fn (comp util/base64? util/base64-headless)]]
    [:thumbnail {:optional true} [:fn (comp util/base64? util/base64-headless)]]
    [:implementing_mea {:optional true} integer?]
    [:tags {:optional true}
     [:vector {:optional true}
      [:map {:optional true}
       [:id {:optional true} pos-int?]
       [:tag string?]]]]
    [:url {:optional true} string?]
    [:info_docs {:optional true} string?]
    [:sub_content_type {:optional true} string?]
    [:document_preview {:optional true} boolean?]
    [:related_content {:optional true}
     [:vector {:optional true}
      [:map {:optional true}
       [:id [:int]]
       [:type (vec (conj constants/resources :enum))]]]]
    [:topics {:optional true}
     [:vector {:optional true} string?]]
    [:entity_connections {:optional true}
     [:vector {:optional true}
      [:map
       [:entity int?]
       [:role
        [:enum "implementor" "owner" "partner" "donor"]]]]]
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
    auth/owners-schema]
   (into handler.geo/params-payload)))

(defmethod ig/init-key :gpml.handler.policy/post-params [_ _]
  post-params)

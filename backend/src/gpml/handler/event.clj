(ns gpml.handler.event
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.string :as str]
            [duct.logger :refer [log]]
            [gpml.auth :as auth]
            [gpml.constants :as constants]
            [gpml.db.event :as db.event]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.language :as db.language]
            [gpml.db.stakeholder :as db.stakeholder]
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
         {:column_name "event"
          :topic "event"
          :topic_id resource-id
          :organisation (:entity connection)
          :association (:role connection)
          :remarks nil})))

(defn- expand-individual-associations
  [individual-connections resource-id]
  (vec (for [connection individual-connections]
         {:column_name "event"
          :topic "event"
          :topic_id resource-id
          :stakeholder (:stakeholder connection)
          :association (:role connection)
          :remarks nil})))

(defn- create-event
  [{:keys [logger mailjet-config] :as config} tx
   {:keys [tags urls title start_date end_date
           description remarks geo_coverage_type
           country city geo_coverage_value image thumbnail
           geo_coverage_countries geo_coverage_country_groups
           geo_coverage_value_subnational_city
           created_by owners url info_docs sub_content_type
           recording document_preview related_content
           entity_connections individual_connections language
           capacity_building source]}]
  (let [data (cond-> {:title title
                      :start_date start_date
                      :end_date end_date
                      :description (or description "")
                      :remarks remarks
                      :image (handler.image/assoc-image config tx image "event")
                      :thumbnail (handler.image/assoc-image config tx thumbnail "event")
                      :geo_coverage_type geo_coverage_type
                      :geo_coverage_value geo_coverage_value
                      :geo_coverage_countries geo_coverage_countries
                      :geo_coverage_country_groups geo_coverage_country_groups
                      :subnational_city geo_coverage_value_subnational_city
                      :city city
                      :url url
                      :country country
                      :owners owners
                      :created_by created_by
                      :info_docs info_docs
                      :sub_content_type sub_content_type
                      :recording recording
                      :document_preview document_preview
                      :language language
                      :source (-> source str/lower-case keyword)}
               (not (nil? capacity_building))
               (assoc :capacity_building capacity_building))
        event-id (->>
                  (update data :source #(sql-util/keyword->pg-enum % "resource_source"))
                  (db.event/new-event tx) :id)
        api-individual-connections (handler.util/individual-connections->api-individual-connections tx individual_connections created_by)
        owners (distinct (remove nil? (flatten (conj owners
                                                     (map #(when (= (:role %) "owner")
                                                             (:stakeholder %))
                                                          api-individual-connections)))))]
    (when (not-empty tags)
      (handler.resource.tag/create-resource-tags tx logger mailjet-config {:tags tags
                                                                           :tag-category "general"
                                                                           :resource-name "event"
                                                                           :resource-id event-id}))
    (doseq [stakeholder-id owners]
      (h.auth/grant-topic-to-stakeholder! tx {:topic-id event-id
                                              :topic-type "event"
                                              :stakeholder-id stakeholder-id
                                              :roles ["owner"]}))
    (when (not-empty entity_connections)
      (doseq [association (expand-entity-associations entity_connections event-id)]
        (db.favorite/new-organisation-association tx association)))
    (when (not-empty api-individual-connections)
      (doseq [association (expand-individual-associations api-individual-connections event-id)]
        (db.favorite/new-stakeholder-association tx association)))
    (when (seq related_content)
      (handler.resource.related-content/create-related-contents tx logger event-id "event" related_content))
    (when (not-empty urls)
      (let [lang-urls (map #(vector event-id
                                    (->> % :lang
                                         (assoc {} :iso_code)
                                         (db.language/language-by-iso-code tx)
                                         :id)
                                    (:url %)) urls)]
        (db.event/add-event-language-urls tx {:urls lang-urls})))
    (if (or (not-empty geo_coverage_country_groups)
            (not-empty geo_coverage_countries))
      (let [geo-data (handler.geo/get-geo-vector-v2 event-id data)]
        (db.event/add-event-geo-coverage tx {:geo geo-data}))
      (when (not-empty geo_coverage_value)
        (let [geo-data (handler.geo/get-geo-vector event-id data)]
          (db.event/add-event-geo-coverage tx {:geo geo-data}))))
    (email/notify-admins-pending-approval
     tx
     mailjet-config
     (merge data {:type "event"}))
    {:id event-id}))

(def ^:private post-params
  (->
   [:map
    [:title string?]
    [:start_date {:optional true} string?]
    [:end_date {:optional true} string?]
    [:description {:optional true} string?]
    [:image {:optional true} [:fn (comp util/base64? util/base64-headless)]]
    [:thumbnail {:optional true} [:fn (comp util/base64? util/base64-headless)]]
    [:remarks {:optional true} string?]
    [:geo_coverage_type
     [:enum "global", "national", "transnational", "sub-national"]]
    [:geo_coverage_value_subnational_city {:optional true} string?]
    [:country {:optional true} integer?]
    [:city {:optional true} string?]
    [:url {:optional true} string?]
    [:info_docs {:optional true} string?]
    [:sub_content_type {:optional true} string?]
    [:related_content {:optional true}
     [:vector {:optional true}
      [:map {:optional true}
       [:id [:int]]
       [:type (vec (conj constants/resources :enum))]]]]
    [:capacity_building {:optional true} boolean?]
    [:event_type {:optional true} string?]
    [:recording {:optional true} string?]
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
        [:enum "resource_editor" "owner"]]]]]
    [:urls {:optional true}
     [:vector {:optional true}
      [:map
       [:lang string?]
       [:url [:string {:min 1}]]]]]
    [:tags {:optional true}
     [:vector
      [:map
       [:id {:optional true} pos-int?]
       [:tag string?]]]]
    [:language string?]
    [:source {:default dom.types/default-resource-source}
     (apply conj [:enum] dom.types/resource-source-types)]
    auth/owners-schema]
   (into handler.geo/params-payload)))

(defmethod ig/init-key :gpml.handler.event/post
  [_ {:keys [db logger] :as config}]
  (fn [{:keys [jwt-claims body-params parameters] :as req}]
    (try
      (jdbc/with-db-transaction [tx (:spec db)]
        (let [result (create-event config tx (assoc body-params
                                                    :created_by
                                                    (-> (db.stakeholder/stakeholder-by-email tx jwt-claims) :id)
                                                    :source (get-in parameters [:body :source])))]
          (resp/created (:referrer req) {:success? true
                                         :message "New event created"
                                         :id (:id result)})))
      (catch Exception e
        (log logger :error ::failed-to-create-event {:exception-message (.getMessage e)})
        (let [response {:status 500
                        :body {:success? false
                               :reason :could-not-create-event}}]

          (if (instance? SQLException e)
            response
            (assoc-in response [:body :error-details :error] (.getMessage e))))))))

(defmethod ig/init-key :gpml.handler.event/post-params [_ _]
  post-params)

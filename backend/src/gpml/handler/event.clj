(ns gpml.handler.event
  (:require
   [clojure.java.jdbc :as jdbc]
   [gpml.auth :as auth]
   [gpml.constants :as constants]
   [gpml.db.event :as db.event]
   [gpml.db.favorite :as db.favorite]
   [gpml.db.language :as db.language]
   [gpml.db.stakeholder :as db.stakeholder]
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
         {:column_name "event"
          :topic "event"
          :topic_id resource-id
          :organisation (:entity connection)
          :association (:role connection)
          :remarks nil})))

(defn expand-individual-associations
  [individual-connections resource-id]
  (vec (for [connection individual-connections]
         {:column_name "event"
          :topic "event"
          :topic_id resource-id
          :stakeholder (:stakeholder connection)
          :association (:role connection)
          :remarks nil})))

(defn create-event [conn mailjet-config
                    {:keys [tags urls title start_date end_date
                            description remarks geo_coverage_type
                            country city geo_coverage_value image thumbnail
                            geo_coverage_countries geo_coverage_country_groups
                            geo_coverage_value_subnational_city
                            created_by owners url info_docs sub_content_type
                            recording document_preview related_content
                            entity_connections individual_connections]}]
  (let [data {:title title
              :start_date start_date
              :end_date end_date
              :description (or description "")
              :remarks remarks
              :image (handler.image/assoc-image conn image "event")
              :thumbnail (handler.image/assoc-image conn thumbnail "event")
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
              :document_preview document_preview}
        event-id (->> data (db.event/new-event conn) :id)
        api-individual-connections (handler.util/individual-connections->api-individual-connections conn individual_connections created_by)
        owners (distinct (remove nil? (flatten (conj owners
                                                     (map #(when (= (:role %) "owner")
                                                             (:stakeholder %))
                                                          api-individual-connections)))))]
    (when (not-empty tags)
      (handler.resource.tag/create-resource-tags conn mailjet-config {:tags tags
                                                                      :tag-category "general"
                                                                      :resource-name "event"
                                                                      :resource-id event-id}))
    (doseq [stakeholder-id owners]
      (h.auth/grant-topic-to-stakeholder! conn {:topic-id event-id
                                                :topic-type "event"
                                                :stakeholder-id stakeholder-id
                                                :roles ["owner"]}))
    (when (not-empty entity_connections)
      (doseq [association (expand-entity-associations entity_connections event-id)]
        (db.favorite/new-organisation-association conn association)))
    (when (not-empty api-individual-connections)
      (doseq [association (expand-individual-associations api-individual-connections event-id)]
        (db.favorite/new-stakeholder-association conn association)))
    (when (seq related_content)
      (handler.resource.related-content/create-related-contents conn event-id "event" related_content))
    (when (not-empty urls)
      (let [lang-urls (map #(vector event-id
                                    (->> % :lang
                                         (assoc {} :iso_code)
                                         (db.language/language-by-iso-code conn)
                                         :id)
                                    (:url %)) urls)]
        (db.event/add-event-language-urls conn {:urls lang-urls})))
    (if (or (not-empty geo_coverage_country_groups)
            (not-empty geo_coverage_countries))
      (let [geo-data (handler.geo/get-geo-vector-v2 event-id data)]
        (db.event/add-event-geo-coverage conn {:geo geo-data}))
      (when (not-empty geo_coverage_value)
        (let [geo-data (handler.geo/get-geo-vector event-id data)]
          (db.event/add-event-geo-coverage conn {:geo geo-data}))))
    (email/notify-admins-pending-approval
     conn
     mailjet-config
     (merge data {:type "event"}))
    {:id event-id}))

(def post-params
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
     [:enum "global", "regional", "national", "transnational",
      "sub-national", "global with elements in specific areas"]]
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
    auth/owners-schema
    [:tags {:optional true}
     [:vector {:optional true}
      [:map {:optional true}
       [:id {:optional true} pos-int?]
       [:tag string?]]]]]
   (into handler.geo/params-payload)))

(defmethod ig/init-key :gpml.handler.event/post [_ {:keys [db mailjet-config]}]
  (fn [{:keys [jwt-claims body-params] :as req}]
    (jdbc/with-db-transaction [conn (:spec db)]
      (let [result (create-event conn mailjet-config (assoc body-params
                                                            :created_by
                                                            (-> (db.stakeholder/stakeholder-by-email conn jwt-claims) :id)))]
        (resp/created (:referrer req) {:message "New event created" :id (:id result)})))))

(defmethod ig/init-key :gpml.handler.event/post-params [_ _]
  post-params)

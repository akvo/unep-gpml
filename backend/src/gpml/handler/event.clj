(ns gpml.handler.event
  (:require [clojure.java.jdbc :as jdbc]
            [gpml.handler.geo :as handler.geo]
            [gpml.handler.image :as handler.image]
            [gpml.db.event :as db.event]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.language :as db.language]
            [gpml.handler.auth :as h.auth]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.email-util :as email]
            [gpml.auth :as auth]
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

(defn create-event [conn {:keys [tags urls title start_date end_date
                                 description remarks geo_coverage_type
                                 country city geo_coverage_value photo
                                 geo_coverage_countries geo_coverage_country_groups
                                 created_by mailjet-config owners url
                                 info_docs sub_content_type
                                 entity_connections individual_connections]}]
  (let [data {:title title
              :start_date start_date
              :end_date end_date
              :description (or description "")
              :remarks remarks
              :image (handler.image/assoc-image conn photo "event")
              :geo_coverage_type geo_coverage_type
              :geo_coverage_value geo_coverage_value
              :geo_coverage_countries geo_coverage_countries
              :geo_coverage_country_groups geo_coverage_country_groups
              :city city
              :url url
              :country country
              :owners owners
              :created_by created_by
              :info-docs info_docs
              :sub_content_type sub_content_type}
        event-id (->> data (db.event/new-event conn) :id)]
    (when (not-empty tags)
      (db.event/add-event-tags conn {:tags (map #(vector event-id %) tags)}))
    (when (not-empty owners)
      (doseq [stakeholder-id owners]
        (h.auth/grant-topic-to-stakeholder! conn {:topic-id event-id
                                                  :topic-type "event"
                                                  :stakeholder-id stakeholder-id
                                                  :roles ["owner"]})))
    (when (not-empty entity_connections)
      (doseq [association (expand-entity-associations entity_connections event-id)]
        (db.favorite/new-organisation-association conn association)))
    (when (not-empty individual_connections)
      (doseq [association (expand-individual-associations individual_connections event-id)]
        (db.favorite/new-association conn association)))
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
    [:photo {:optional true} string?]
    [:remarks {:optional true} string?]
    [:geo_coverage_type
     [:enum "global", "regional", "national", "transnational",
      "sub-national", "global with elements in specific areas"]]
    [:country {:optional true} integer?]
    [:city {:optional true} string?]
    [:url {:optional true} string?]
    [:info_docs {:optional true} string?]
    [:sub_content_type {:optional true} string?]
    [:capacity_building {:optional true} boolean?]
    [:event_type {:optional true} string?]
    [:recording {:optional true} string?]
    [:entity_connections {:optional true}
     [:vector {:optional true}
      [:map
       [:entity int?]
       [:role
        [:enum "resource person" "organiser" "participant"
         "sponsor" "host" "interested in" "implementor"
         "partner" "donor" "other"]]]]]
    [:individual_connections {:optional true}
     [:vector {:optional true}
      [:map
       [:stakeholder int?]
       [:role
        [:enum "resource person" "organiser" "participant"
         "sponsor" "host" "interested in" "implementor"
         "partner" "donor" "other"]]]]]
    [:urls {:optional true}
     [:vector {:optional true}
      [:map
       [:lang string?]
       [:url [:string {:min 1}]]]]]
    auth/owners-schema
    [:tags {:optional true}
     [:vector {:optional true} integer?]]]
   (into handler.geo/params-payload)))

(defmethod ig/init-key :gpml.handler.event/post [_ {:keys [db mailjet-config]}]
  (fn [{:keys [jwt-claims body-params] :as req}]
    (jdbc/with-db-transaction [conn (:spec db)]
      (let [result (create-event conn (assoc body-params
                                        :mailjet-config mailjet-config
                                        :created_by
                                        (-> (db.stakeholder/stakeholder-by-email conn jwt-claims) :id)))]
        (resp/created (:referrer req) {:message "New event created" :id (:id result)})))))

(defmethod ig/init-key :gpml.handler.event/post-params [_ _]
  post-params)

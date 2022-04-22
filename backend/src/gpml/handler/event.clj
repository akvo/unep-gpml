(ns gpml.handler.event
  (:require [clojure.java.jdbc :as jdbc]
            [gpml.auth :as auth]
            [gpml.email-util :as email]
            [gpml.db.tag :as db.tag]
            [gpml.db.event :as db.event]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.language :as db.language]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.handler.auth :as h.auth]
            [gpml.handler.geo :as handler.geo]
            [gpml.handler.image :as handler.image]
            [gpml.pg-util :as pg-util]
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

(defn add-tags [conn mailjet-config tags event-id]
  (let [tag-ids (map #(:id %) tags)]
    (if-not (some nil? tag-ids)
      (db.event/add-event-tags conn {:tags (map #(vector event-id %) tag-ids)})
      (let [tag-category (:id (db.tag/tag-category-by-category-name conn {:category "general"}))
            new-tags (filter #(not (contains? % :id)) tags)
            tags-to-db (map #(vector % tag-category) (vec (map #(:tag %) new-tags)))
            new-tag-ids (map #(:id %) (db.tag/new-tags conn {:tags tags-to-db}))]
        (db.event/add-event-tags conn {:tags (map #(vector event-id %) (concat (remove nil? tag-ids) new-tag-ids))})
        (map
          #(email/notify-admins-pending-approval
             conn
             mailjet-config
             (merge % {:type "tag"}))
          new-tags)))))

(defn create-event [conn {:keys [tags urls title start_date end_date
                                 description remarks geo_coverage_type
                                 country city geo_coverage_value photo
                                 geo_coverage_countries geo_coverage_country_groups
                                 geo_coverage_value_subnational_city
                                 created_by mailjet-config owners url
                                 info_docs sub_content_type
                                 recording document_preview related_content
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
              :related_content (pg-util/->JDBCArray related_content "integer")}
        event-id (->> data (db.event/new-event conn) :id)
        individual_connections (conj individual_connections {:stakeholder created_by
                                                             :role "owner"})
        owners (distinct (remove nil? (flatten (conj owners
                                                 (map #(when (= (:role %) "owner")
                                                         (:stakeholder %))
                                                   individual_connections)))))]
    (when (not-empty tags)
      (add-tags conn mailjet-config tags event-id))
    (doseq [stakeholder-id owners]
      (h.auth/grant-topic-to-stakeholder! conn {:topic-id event-id
                                                :topic-type "event"
                                                :stakeholder-id stakeholder-id
                                                :roles ["owner"]}))
    (when (not-empty entity_connections)
      (doseq [association (expand-entity-associations entity_connections event-id)]
        (db.favorite/new-organisation-association conn association)))
    (doseq [association (expand-individual-associations individual_connections event-id)]
      (db.favorite/new-association conn association))
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
    [:geo_coverage_value_subnational_city {:optional true} string?]
    [:country {:optional true} integer?]
    [:city {:optional true} string?]
    [:url {:optional true} string?]
    [:info_docs {:optional true} string?]
    [:sub_content_type {:optional true} string?]
    [:related_content {:optional true}
     [:vector {:optional true} integer?]]
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
      (let [result (create-event conn (assoc body-params
                                        :mailjet-config mailjet-config
                                        :created_by
                                        (-> (db.stakeholder/stakeholder-by-email conn jwt-claims) :id)))]
        (resp/created (:referrer req) {:message "New event created" :id (:id result)})))))

(defmethod ig/init-key :gpml.handler.event/post-params [_ _]
  post-params)

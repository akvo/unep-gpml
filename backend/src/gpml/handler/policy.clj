(ns gpml.handler.policy
  (:require [clojure.java.jdbc :as jdbc]
            [gpml.handler.geo :as handler.geo]
            [gpml.handler.image :as handler.image]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.language :as db.language]
            [gpml.db.policy :as db.policy]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.email-util :as email]
            [integrant.core :as ig]
            [gpml.handler.auth :as h.auth]
            [gpml.auth :as auth]
            [ring.util.response :as resp]))

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

(defn create-policy [conn {:keys [title original_title abstract url
                                  data_source type_of_law record_number
                                  first_publication_date latest_amendment_date
                                  status country geo_coverage_type
                                  geo_coverage_value implementing_mea
                                  geo_coverage_countries geo_coverage_country_groups
                                  tags urls created_by image
                                  owners
                                  attachments remarks mailjet-config
                                  entity_connections individual_connections]}]
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
              :image (handler.image/assoc-image conn image "policy")
              :geo_coverage_type geo_coverage_type
              :geo_coverage_value geo_coverage_value
              :geo_coverage_countries geo_coverage_countries
              :geo_coverage_country_groups geo_coverage_country_groups
              :implementing_mea implementing_mea
              :attachments attachments
              :remarks remarks
              :created_by created_by
              :review_status "SUBMITTED"}
        policy-id (->> data (db.policy/new-policy conn) :id)]
    (when (not-empty tags)
      (db.policy/add-policy-tags
        conn {:tags (map #(vector policy-id %) tags)}))
    (when (not-empty urls)
      (let [lang-urls (map #(vector policy-id
                                    (->> % :lang
                                         (assoc {} :iso_code)
                                         (db.language/language-by-iso-code conn)
                                         :id)
                                    (:url %)) urls)]
        (db.policy/add-policy-language-urls conn {:urls lang-urls})))
    (when (not-empty owners)
      (doseq [stakeholder-id owners]
        (h.auth/grant-topic-to-stakeholder! conn {:topic-id policy-id
                                                  :topic-type "policy"
                                                  :stakeholder-id stakeholder-id
                                                  :roles ["owner"]})))
    (when (not-empty entity_connections)
      (doseq [association (expand-entity-associations entity_connections policy-id)]
        (db.favorite/new-organisation-association conn association)))
    (when (not-empty individual_connections)
      (doseq [association (expand-individual-associations individual_connections policy-id)]
        (db.favorite/new-association conn association)))
    (if (or (not-empty geo_coverage_country_groups)
            (not-empty geo_coverage_countries))
      (let [geo-data (handler.geo/get-geo-vector-v2 policy-id data)]
        (db.policy/add-policy-geo conn {:geo geo-data}))
      (when (not-empty geo_coverage_value)
        (let [geo-data (handler.geo/get-geo-vector policy-id data)]
          (db.policy/add-policy-geo conn {:geo geo-data}))))
    (email/notify-admins-pending-approval
     conn
     mailjet-config
     (merge data {:type "policy"}))
    policy-id))

(defmethod ig/init-key :gpml.handler.policy/post [_ {:keys [db mailjet-config]}]
  (fn [{:keys [jwt-claims body-params] :as req}]
    (jdbc/with-db-transaction [conn (:spec db)]
      (let [user (db.stakeholder/stakeholder-by-email conn jwt-claims)
            policy-id (create-policy conn (assoc body-params
                                                 :created_by (:id user)
                                                 :mailjet-config mailjet-config))]
        (resp/created (:referrer req) {:message "New policy created" :id policy-id})))))

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
    [:image {:optional true} string?]
    [:implementing_mea {:optional true} integer?]
    [:tags {:optional true}
     [:vector {:optional true} integer?]]
    [:url {:optional true} string?]
    [:info_docs {:optional true} string?]
    [:sub_content_type {:optional true} string?]
    [:entity_connections {:optional true}
     [:vector {:optional true}
      [:map
       [:entity int?]
       [:role
        [:enum "regulator" "implementor" "reviewer" "owner"
         "interested in" "partner" "donor" "other"]]]]]
    [:individual_connections {:optional true}
     [:vector {:optional true}
      [:map
       [:stakeholder int?]
       [:role
        [:enum "regulator" "implementor" "reviewer" "owner"
         "interested in" "partner" "donor" "other"]]]]]
    [:urls {:optional true}
     [:vector {:optional true}
      [:map [:lang string?] [:url [:string {:min 1}]]]]]
    auth/owners-schema]
   (into handler.geo/params-payload)))

(defmethod ig/init-key :gpml.handler.policy/post-params [_ _]
  post-params)

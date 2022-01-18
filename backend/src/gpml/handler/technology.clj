(ns gpml.handler.technology
  (:require [clojure.java.jdbc :as jdbc]
            [gpml.handler.geo :as handler.geo]
            [gpml.handler.image :as handler.image]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.language :as db.language]
            [gpml.db.technology :as db.technology]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.email-util :as email]
            [gpml.handler.auth :as h.auth]
            [gpml.auth :as auth]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defn expand-entity-associations
  [entity-connections resource-id]
  (vec (for [connection entity-connections]
         {:column_name "technology"
          :topic "technology"
          :topic_id resource-id
          :organisation (:entity connection)
          :association (:role connection)
          :remarks nil})))

(defn expand-individual-associations
  [individual-connections resource-id]
  (vec (for [connection individual-connections]
         {:column_name "technology"
          :topic "technology"
          :topic_id resource-id
          :stakeholder (:stakeholder connection)
          :association (:role connection)
          :remarks nil})))

(defn create-technology [conn {:keys [name organisation_type
                                      development_stage specifications_provided
                                      year_founded email country
                                      geo_coverage_type geo_coverage_value
                                      geo_coverage_countries geo_coverage_country_groups
                                      tags url urls created_by image owners info_docs
                                      logo attachments remarks mailjet-config
                                      entity_connections individual_connections]}]
  (let [data {:name name
              :year_founded year_founded
              :organisation_type organisation_type
              :development_stage development_stage
              :specifications_provided specifications_provided
              :email email
              :url url
              :country country
              :image (handler.image/assoc-image conn image "technology")
              :logo (handler.image/assoc-image conn logo "technology")
              :geo_coverage_type geo_coverage_type
              :geo_coverage_value geo_coverage_value
              :geo_coverage_countries geo_coverage_countries
              :geo_coverage_country_groups geo_coverage_country_groups
              :remarks remarks
              :attachments attachments
              :created_by created_by
              :owners owners
              :info_docs info_docs
              :review_status "SUBMITTED"}
        technology-id (->> data (db.technology/new-technology conn) :id)]
    (when (not-empty owners)
      (doseq [stakeholder-id owners]
        (h.auth/grant-topic-to-stakeholder! conn {:topic-id technology-id
                                                  :topic-type "technology"
                                                  :stakeholder-id stakeholder-id
                                                  :roles ["owner"]})))
    (when (not-empty entity_connections)
      (doseq [association (expand-entity-associations entity_connections technology-id)]
        (db.favorite/new-organisation-association conn association)))
    (when (not-empty individual_connections)
      (doseq [association (expand-individual-associations entity_connections technology-id)]
        (db.favorite/new-association conn association)))
    (when (not-empty tags)
      (db.technology/add-technology-tags
        conn {:tags (map #(vector technology-id %) tags)}))
    (when (not-empty urls)
      (let [lang-urls (map #(vector technology-id
                                    (->> % :lang
                                         (assoc {} :iso_code)
                                         (db.language/language-by-iso-code conn)
                                         :id)
                                    (:url %)) urls)]
        (db.technology/add-technology-language-urls conn {:urls lang-urls})))
    (if (or (not-empty geo_coverage_country_groups)
            (not-empty geo_coverage_countries))
      (let [geo-data (handler.geo/get-geo-vector-v2 technology-id data)]
        (db.technology/add-technology-geo conn {:geo geo-data}))
      (when (not-empty geo_coverage_value)
        (let [geo-data (handler.geo/get-geo-vector technology-id data)]
          (db.technology/add-technology-geo conn {:geo geo-data}))))
    (email/notify-admins-pending-approval
     conn
     mailjet-config
     (merge data {:type "technology"}))
    technology-id))

(defmethod ig/init-key :gpml.handler.technology/post [_ {:keys [db mailjet-config]}]
  (fn [{:keys [jwt-claims body-params] :as req}]
    (jdbc/with-db-transaction [conn (:spec db)]
      (let [user (db.stakeholder/stakeholder-by-email conn jwt-claims)
            technology-id (create-technology conn (assoc body-params
                                                         :created_by (:id user)
                                                         :mailjet-config mailjet-config))]
        (resp/created (:referrer req) {:message "New technology created" :id technology-id})))))

(def post-params
  (into [:map
    [:name string?]
    [:year_founded integer?]
    [:organisation_type {:optional true}
     [:enum "Established Company", "Research Lab", "Academic Institution",
      "Startup", "Non-Profit Org", "Partnerships"]]
    [:development_stage {:optional true}
     [:enum "In market", "Scale up", "Prototype", "Pilot"
      "Development", "Research"]]
    [:country {:optional true} integer?]
    [:geo_coverage_type
     [:enum "global", "regional", "national", "transnational",
      "sub-national", "global with elements in specific areas"]]
    [:image {:optional true} string?]
    [:logo {:optional true} string?]
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
        [:enum "owner" "user" "reviewer" "interested in"
         "implementor" "partner" "donor" "other"]]]]]
    [:individual_connections {:optional true}
      [:vector {:optional true}
       [:map
        [:stakeholder int?]
        [:role
         [:enum "owner" "user" "reviewer" "interested in"
          "implementor" "partner" "donor" "other"]]]]]
    [:urls {:optional true}
     [:vector {:optional true}
      [:map [:lang string?] [:url [:string {:min 1}]]]]]
    auth/owners-schema]
  handler.geo/params-payload))

(defmethod ig/init-key :gpml.handler.technology/post-params [_ _]
  post-params)

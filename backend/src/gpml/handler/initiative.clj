(ns gpml.handler.initiative
  (:require [clojure.java.jdbc :as jdbc]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.initiative :as db.initiative]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.email-util :as email]
            [gpml.handler.geo :as handler.geo]
            [gpml.handler.auth :as h.auth]
            [gpml.handler.image :as handler.image]
            [gpml.pg-util :as pg-util]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defn- add-geo-initiative [conn initiative-id {:keys [geo_coverage_country_groups geo_coverage_countries] :as data}]
  (when (or (not-empty geo_coverage_country_groups)
            (not-empty geo_coverage_countries))
    (let [geo-data (handler.geo/get-geo-vector-v2 initiative-id data)]
      (db.initiative/add-initiative-geo-coverage conn {:geo geo-data}))))

(defn update-geo-initiative [conn initiative-id {:keys [geo_coverage_country_groups geo_coverage_countries] :as data}]
  (when (or (not-empty geo_coverage_country_groups)
            (not-empty geo_coverage_countries))
    (let [geo-data (handler.geo/get-geo-vector-v2 initiative-id data)]
      (db.initiative/delete-initiative-geo-coverage conn {:id initiative-id})
      (db.initiative/add-initiative-geo-coverage conn {:geo geo-data}))))

(defn extract-geo-data [params]
  {:geo_coverage_country_groups (mapv (comp #(Integer/parseInt %) name ffirst) (:q24_4 params))
   :geo_coverage_countries (mapv (comp #(Integer/parseInt %) name ffirst) (:q24_2 params))})

(defn expand-entity-associations
  [entity-connections resource-id]
  (vec (for [connection entity-connections]
         {:column_name "initiative"
          :topic "initiative"
          :topic_id resource-id
          :organisation (:entity connection)
          :association (:role connection)
          :remarks nil})))

(defn expand-individual-associations
  [individual-connections resource-id]
  (vec (for [connection individual-connections]
         {:column_name "initiative"
          :topic "initiative"
          :topic_id resource-id
          :stakeholder (:stakeholder connection)
          :association (:role connection)
          :remarks nil})))

(defn create-initiative [conn {:keys [mailjet-config tags owners related_content
                                      entity_connections individual_connections qimage] :as initiative}]
  (let [data (-> initiative
               (dissoc :tags :owners :mailjet-config :entity_connections :individual_connections :related_content)
               (assoc :qimage (handler.image/assoc-image conn qimage "initiative")
                      :related_content (pg-util/->JDBCArray related_content "integer")))
        initiative-id (:id (db.initiative/new-initiative conn data))]
    (add-geo-initiative conn initiative-id (extract-geo-data data))
    (when (not-empty owners)
      (doseq [stakeholder-id owners]
        (h.auth/grant-topic-to-stakeholder! conn {:topic-id initiative-id
                                                  :topic-type "initiative"
                                                  :stakeholder-id stakeholder-id
                                                  :roles ["owner"]})))
    (when (not-empty entity_connections)
      (doseq [association (expand-entity-associations entity_connections initiative-id)]
        (db.favorite/new-organisation-association conn association)))
    (when (not-empty individual_connections)
      (doseq [association (expand-individual-associations individual_connections initiative-id)]
        (db.favorite/new-association conn association)))
    (when (not-empty tags)
      (db.initiative/add-initiative-tags conn {:tags (map #(vector initiative-id %) tags)}))
    (email/notify-admins-pending-approval
      conn
      mailjet-config
      {:type "initiative" :title (:q2 data)})
    initiative-id))

(defmethod ig/init-key :gpml.handler.initiative/post [_ {:keys [db mailjet-config]}]
  (fn [{:keys [jwt-claims body-params] :as req}]
    (jdbc/with-db-transaction [conn (:spec db)]
      (let [user (db.stakeholder/stakeholder-by-email conn jwt-claims)
            initiative-id (create-initiative conn (assoc body-params
                                                    :created_by (:id user)
                                                    :mailjet-config mailjet-config))]
        (resp/created (:referrer req) {:message "New initiative created" :id initiative-id})))))


(defmethod ig/init-key :gpml.handler.initiative/get [_ {:keys [db]}]
  (fn [{{{:keys [id]} :path} :parameters}]
    (let [conn (:spec db)
          data (db.initiative/initiative-by-id conn {:id id})]
      (resp/response data))))

(defmethod ig/init-key :gpml.handler.initiative/post-params [_ _]
  [:map [:version integer?]])

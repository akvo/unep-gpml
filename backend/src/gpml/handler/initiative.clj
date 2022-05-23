(ns gpml.handler.initiative
  (:require [clojure.java.jdbc :as jdbc]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.initiative :as db.initiative]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.tag :as db.tag]
            [gpml.email-util :as email]
            [gpml.handler.geo :as handler.geo]
            [gpml.handler.auth :as h.auth]
            [gpml.handler.image :as handler.image]
            [gpml.handler.util :as util]
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

(defn add-tags [conn mailjet-config tags initiative-id]
  (let [tag-ids (map #(:id %) tags)]
    (if-not (some nil? tag-ids)
      (db.initiative/add-initiative-tags conn {:tags (map #(vector initiative-id %) tag-ids)})
      (let [tag-category (:id (db.tag/tag-category-by-category-name conn {:category "general"}))
            new-tags (filter #(not (contains? % :id)) tags)
            tags-to-db (map #(vector % tag-category) (vec (map #(:tag %) new-tags)))
            new-tag-ids (map #(:id %) (db.tag/new-tags conn {:tags tags-to-db}))]
        (db.initiative/add-initiative-tags conn {:tags (map #(vector initiative-id %) (concat (remove nil? tag-ids) new-tag-ids))})
        (map
         #(email/notify-admins-pending-approval
           conn
           mailjet-config
           (merge % {:type "tag"}))
         new-tags)))))

(defn create-initiative [conn {:keys [mailjet-config tags owners related_content created_by
                                      entity_connections individual_connections qimage] :as initiative}]
  (let [data (-> initiative
                 (dissoc :tags :owners :mailjet-config :entity_connections :individual_connections :related_content)
                 (assoc :qimage (handler.image/assoc-image conn qimage "initiative")
                        :related_content (pg-util/->JDBCArray related_content "integer")))
        initiative-id (:id (db.initiative/new-initiative conn data))
        api-individual-connections (util/individual-connections->api-individual-connections conn individual_connections created_by)
        owners (distinct (remove nil? (flatten (conj owners
                                                     (map #(when (= (:role %) "owner")
                                                             (:stakeholder %))
                                                          api-individual-connections)))))]
    (add-geo-initiative conn initiative-id (extract-geo-data data))
    (doseq [stakeholder-id owners]
      (h.auth/grant-topic-to-stakeholder! conn {:topic-id initiative-id
                                                :topic-type "initiative"
                                                :stakeholder-id stakeholder-id
                                                :roles ["owner"]}))
    (when (not-empty entity_connections)
      (doseq [association (expand-entity-associations entity_connections initiative-id)]
        (db.favorite/new-organisation-association conn association)))
    (when (not-empty api-individual-connections)
      (doseq [association (expand-individual-associations api-individual-connections initiative-id)]
        (db.favorite/new-association conn association)))
    (when (not-empty tags)
      (add-tags conn mailjet-config tags initiative-id))
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

(defn expand-related-initiative-content [db initiative-id]
  (let [related_content (db.initiative/related-content-by-id db {:id initiative-id})]
    (for [item related_content]
      (merge item
             {:entity_connections (db.initiative/entity-connections-by-id db (select-keys item [:id]))
              :stakeholder_connections (db.initiative/stakeholder-connections-by-id db (select-keys item [:id]))}))))

(defmethod ig/init-key :gpml.handler.initiative/get [_ {:keys [db]}]
  (fn [{{{:keys [id]} :path} :parameters}]
    (let [conn (:spec db)
          data (db.initiative/initiative-by-id conn {:id id})
          extra-details (merge {:entity_connections (db.initiative/entity-connections-by-id conn {:id id})
                                :stakeholder_connections (db.initiative/stakeholder-connections-by-id conn {:id id})
                                :tags (db.initiative/tags-by-id conn {:id id})
                                :type "Initiative"}
                               (when-not (empty? (:related_content data))
                                 {:related_content (expand-related-initiative-content conn id)}))]
      (resp/response (merge data extra-details)))))

(defmethod ig/init-key :gpml.handler.initiative/post-params [_ _]
  [:map [:version integer?]])

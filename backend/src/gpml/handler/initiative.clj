(ns gpml.handler.initiative
  (:require
   [clojure.java.jdbc :as jdbc]
   [gpml.db.favorite :as db.favorite]
   [gpml.db.initiative :as db.initiative]
   [gpml.db.resource.connection :as db.resource.connection]
   [gpml.db.resource.tag :as db.resource.tag]
   [gpml.db.stakeholder :as db.stakeholder]
   [gpml.db.tag :as db.tag]
   [gpml.email-util :as email]
   [gpml.handler.auth :as h.auth]
   [gpml.handler.geo :as handler.geo]
   [gpml.handler.image :as handler.image]
   [gpml.handler.resource.related-content :as handler.resource.related-content]
   [gpml.handler.util :as util]
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
            tag-entity-columns ["tag" "tag_category"]
            new-tag-ids (map #(:id %) (db.tag/new-tags conn {:tags tags-to-db
                                                             :insert-cols tag-entity-columns}))]
        (db.initiative/add-initiative-tags conn {:tags (map #(vector initiative-id %) (concat (remove nil? tag-ids) new-tag-ids))})
        (map
         #(email/notify-admins-pending-approval
           conn
           mailjet-config
           (merge % {:type "tag"}))
         new-tags)))))

(defn create-initiative [conn {:keys [mailjet-config tags owners related_content created_by
                                      entity_connections individual_connections qimage thumbnail] :as initiative}]
  (let [data (-> initiative
                 (dissoc :tags :owners :mailjet-config :entity_connections :individual_connections :related_content)
                 (assoc :qimage (handler.image/assoc-image conn qimage "initiative")
                        :thumbnail (handler.image/assoc-image conn thumbnail "initiative")))
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
    (when (seq related_content)
      (handler.resource.related-content/create-related-contents conn initiative-id "initiative" related_content))
    (when (not-empty entity_connections)
      (doseq [association (expand-entity-associations entity_connections initiative-id)]
        (db.favorite/new-organisation-association conn association)))
    (when (not-empty api-individual-connections)
      (doseq [association (expand-individual-associations api-individual-connections initiative-id)]
        (db.favorite/new-stakeholder-association conn association)))
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

(defn expand-related-initiative-content [conn initiative-id]
  (let [related_content (handler.resource.related-content/get-related-contents conn initiative-id "initiative")]
    (for [item related_content]
      (merge item
             {:entity_connections (db.resource.connection/get-resource-entity-connections conn {:resource-type "initiative"
                                                                                                :resource-id (:id item)})
              :stakeholder_connections (db.resource.connection/get-resource-stakeholder-connections conn {:resource-type "initiative"
                                                                                                          :resource-id (:id item)})}))))

(defmethod ig/init-key :gpml.handler.initiative/get [_ {:keys [db]}]
  (fn [{{{:keys [id]} :path} :parameters}]
    (let [conn (:spec db)
          data (db.initiative/initiative-by-id conn {:id id})
          entity-connections
          (db.resource.connection/get-resource-entity-connections conn {:resource-type "initiative"
                                                                        :resource-id id})
          stakeholder-connections
          (db.resource.connection/get-resource-stakeholder-connections conn {:resource-type "initiative"
                                                                             :resource-id id})
          extra-details {:entity_connections entity-connections
                         :stakeholder_connections stakeholder-connections
                         :tags (db.resource.tag/get-resource-tags conn {:table "initiative_tag"
                                                                        :resource-col "initiative"
                                                                        :resource-id id})
                         :related_content (expand-related-initiative-content conn id)
                         :type "Initiative"}]
      (resp/response (merge data extra-details)))))

(defmethod ig/init-key :gpml.handler.initiative/post-params [_ _]
  [:map [:version integer?]])

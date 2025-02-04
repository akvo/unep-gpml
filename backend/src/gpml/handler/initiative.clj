(ns gpml.handler.initiative
  (:require
   [clojure.java.jdbc :as jdbc]
   [clojure.set :as set]
   [duct.logger :refer [log]]
   [gpml.db.initiative :as db.initiative]
   [gpml.db.resource.connection :as db.resource.connection]
   [gpml.db.resource.tag :as db.resource.tag]
   [gpml.domain.types :as dom.types]
   [gpml.handler.file :as handler.file]
   [gpml.handler.resource.geo-coverage :as handler.geo]
   [gpml.handler.resource.related-content :as handler.resource.related-content]
   [gpml.handler.resource.tag :as handler.resource.tag]
   [gpml.handler.responses :as r]
   [gpml.handler.util :as util]
   [gpml.service.association :as srv.association]
   [gpml.service.permissions :as srv.permissions]
   [gpml.util.email :as email]
   [gpml.util.sql :as sql-util]
   [integrant.core :as ig]
   [ring.util.response :as resp])
  (:import
   (java.sql SQLException)))

(defn- add-geo-initiative [conn initiative-id geo-coverage-type
                           {:keys [geo_coverage_country_groups
                                   geo_coverage_countries
                                   geo_coverage_country_states]}]
  (handler.geo/create-resource-geo-coverage conn
                                            :initiative
                                            initiative-id
                                            geo-coverage-type
                                            {:countries geo_coverage_countries
                                             :country-groups geo_coverage_country_groups
                                             :country-states geo_coverage_country_states}))

(defn extract-geo-data
  "FIXME: we should deprecate geo coverage functions like this in favor
  of a more generic approach for all resources. This also should be in
  the domain layer."
  [params]
  {:geo_coverage_country_groups (mapv (comp #(Integer/parseInt %) name ffirst) (:q24_4 params))
   :geo_coverage_countries (mapv (comp #(Integer/parseInt %) name ffirst) (:q24_2 params))})

(defn- create-initiative [{:keys [logger mailjet-config] :as config}
                          conn
                          user
                          {:keys [q24 tags related_content created_by
                                  entity_connections individual_connections qimage thumbnail capacity_building] :as initiative}]
  (let [image-id (when (seq qimage)
                   (handler.file/create-file config conn qimage :initiative :images :public))
        thumbnail-id (when (seq thumbnail)
                       (handler.file/create-file config conn thumbnail :initiative :images :public))
        data (cond-> (dissoc initiative
                             :tags :owners :entity_connections
                             :individual_connections :related_content
                             :qimage :thumbnail)
               image-id
               (assoc :image_id image-id)

               thumbnail-id
               (assoc :thumbnail_id thumbnail-id)

               (some? capacity_building)
               (assoc :capacity_building capacity_building))
        initiative-id (:id (db.initiative/new-initiative
                            conn
                            (update data :source #(sql-util/keyword->pg-enum % "resource_source"))))
        api-individual-connections (util/individual-connections->api-individual-connections conn individual_connections created_by)
        geo-coverage-type (keyword (first (keys q24)))
        org-associations (map #(set/rename-keys % {:entity :organisation}) entity_connections)]
    (add-geo-initiative conn initiative-id geo-coverage-type (extract-geo-data data))
    (when (seq related_content)
      (handler.resource.related-content/create-related-contents conn logger initiative-id "initiative" related_content))
    (srv.permissions/create-resource-context
     {:conn conn
      :logger logger}
     {:context-type :initiative
      :resource-id initiative-id})
    (srv.association/save-associations
     {:conn conn
      :logger logger}
     {:org-associations org-associations
      :sth-associations (if (seq api-individual-connections)
                          api-individual-connections
                          [{:role "owner"
                            :stakeholder (:id user)}])
      :resource-type "initiative"
      :resource-id initiative-id})
    (when (not-empty tags)
      (handler.resource.tag/create-resource-tags conn logger mailjet-config {:tags tags
                                                                             :tag-category "general"
                                                                             :resource-name "initiative"
                                                                             :resource-id initiative-id}))
    (email/notify-admins-pending-approval
     conn
     mailjet-config
     {:type "initiative" :title (:q2 data)})
    initiative-id))

(defmethod ig/init-key :gpml.handler.initiative/post
  [_ {:keys [db logger] :as config}]
  (fn [{:keys [body-params parameters user]}]
    (try
      (if-not (= (:review_status user) "APPROVED")
        (r/forbidden {:message "Unauthorized"})
        (jdbc/with-db-transaction [tx (:spec db)]
          (let [initiative-id (create-initiative
                               config
                               tx
                               user
                               (assoc body-params
                                      :created_by (:id user)
                                      :source (get-in parameters [:body :source])))]
            (r/created {:success? true
                        :message "New initiative created"
                        :id initiative-id}))))
      (catch Exception e
        (log logger :error :failed-to-create-initiative e)
        (let [response {:success? false
                        :reason :could-not-create-initiative}]

          (if (instance? SQLException e)
            (r/server-error response)
            (r/server-error (assoc-in response [:body :error-details :error] (.getMessage e)))))))))

(defn- expand-related-initiative-content [conn initiative-id]
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
                                                                        :resource-id id
                                                                        :review_status "APPROVED"})
                         :related_content (expand-related-initiative-content conn id)
                         :type "Initiative"}]
      (resp/response (merge data extra-details)))))

;; FIXME: We should define a specific domain model for initiatives and
;; strip extra parameter keys from the request.
(defmethod ig/init-key :gpml.handler.initiative/post-params [_ _]
  [:map
   [:version integer?]
   [:language string?]
   [:capacity_building {:optional true} boolean?]
   [:source {:default dom.types/default-resource-source
             :decode/string keyword
             :decode/json keyword}
    (apply conj [:enum] dom.types/resource-source-types)]])

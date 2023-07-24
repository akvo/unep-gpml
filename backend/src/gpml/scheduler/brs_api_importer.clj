(ns gpml.scheduler.brs-api-importer
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.string :as str]
            [duct.logger :refer [log]]
            [gpml.boundary.port.datasource :as datasource]
            [gpml.db.country :as db.country]
            [gpml.db.event :as db.event]
            [gpml.db.initiative :as db.initiative]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.resource :as db.resource]
            [gpml.db.resource.connection :as db.r.conn]
            [gpml.db.resource.geo-coverage :as db.r.geo]
            [gpml.db.resource.tag :as db.r.tag]
            [gpml.db.resource.translation :as db.translation]
            [gpml.db.tag :as db.tag]
            [gpml.domain.event :as dom.event]
            [gpml.domain.initiative :as dom.initiative]
            [gpml.domain.resource :as dom.resource]
            [gpml.domain.translation :as dom.translation]
            [gpml.domain.types :as dom.types]
            [gpml.handler.image :as handler.img]
            [gpml.util :as util]
            [gpml.util.http-client :as http-client]
            [gpml.util.malli :as util.malli]
            [gpml.util.sql :as sql-util]
            [integrant.core :as ig]
            [java-time :as jt]
            [java-time.temporal]
            [medley.core :as medley]
            [twarc.core :refer [defjob]]))

(def ^:private brs-api-tag-category-name "brs api")

(def ^:private default-gpml-entity-values
  {:resource {:review_status :APPROVED
              :geo_coverage_type :global
              :type "Technical Resource"
              :language "en"
              :source dom.types/default-resource-source}
   :event {:review_status :APPROVED
           :language "en"
           :source dom.types/default-resource-source}
   :initiative {:review_status :APPROVED
                :language "en"
                :version 2
                :q36_1 {"USD" "USD United States dollar"}
                :source dom.types/default-resource-source}
   :tag {:review_status :SUBMITTED}})

(defn- get-entity-schema-keys
  [entity-name]
  (case entity-name
    :resource (util.malli/keys dom.resource/Resource)
    :event (util.malli/keys dom.event/Event)
    :initiative (util.malli/keys dom.initiative/Initiative)
    []))

(defn- remove-tags-duplicates
  [tags]
  (->> tags
       (group-by (comp str/lower-case :tag))
       vals
       (map first)))

(defn- get-brs-tag-category-id
  [conn]
  (->> (db.tag/get-tag-categories conn {:filters {:categories [brs-api-tag-category-name]}})
       first
       :id))

(defn- get-english-translation-value
  [value]
  (->> value
       (filter #(= (:language %) "en"))
       first
       :value))

(defn- get-entity-translation-keys
  [entity-name]
  (get dom.translation/translatable-fields-by-entity entity-name))

(defn- default-to-en-translations
  "Sets translatable fields' values to English translation values. Every
  translatable field, defined by `translation-keys`, has an English
  translation. Resources' translatable fields' values MUST ALWAYS use
  English translation value as the default."
  [entity-data translation-keys]
  (reduce
   (fn [acc k]
     (util/update-if-not-nil acc k get-english-translation-value))
   entity-data
   translation-keys))

(defn- add-country-id
  [countries-by-iso-code geo-coverage]
  (map (fn [{:keys [iso_code_a2 iso_code_a3] :as geo}]
         (assoc geo :country (-> (medley/find-first
                                  (fn [[iso-codes _]]
                                    (get iso-codes (or iso_code_a2 iso_code_a3)))
                                  countries-by-iso-code)
                                 second
                                 first
                                 :id)))
       geo-coverage))

(defn- build-translations
  [entity-name brs-entities brs-translations]
  (map (fn [{:keys [brs_api_id] :as translation}]
         (let [resource-id (get-in brs-entities [brs_api_id 0 :id])]
           (-> translation
               (assoc (keyword (str (name entity-name) "_id")) resource-id)
               (dissoc :brs_api_id))))
       brs-translations))

(defn- build-tags
  [brs-tag-category-id brs-tags stored-tags]
  (reduce (fn [acc {:keys [tag] :as tag-m}]
            (if (get (set stored-tags) (str/lower-case tag))
              acc
              (conj acc (merge (-> tag-m
                                   (assoc :tag_category brs-tag-category-id)
                                   (dissoc :brs_api_id))
                               (get default-gpml-entity-values :tag)))))
          []
          brs-tags))

(defn- build-tags-relations
  [entity-name brs-entities brs-tags-relations stored-tags]
  (apply
   concat
   (map (fn [{:keys [id brs_api_id]}]
          (map (fn [{:keys [tag]}]
                 {entity-name id
                  :tag (get-in stored-tags [(str/lower-case tag) 0 :id])})
               (get (group-by :brs_api_id brs-tags-relations) brs_api_id)))
        brs-entities)))

(defn- build-geo-coverage-relations
  [entity-name brs-entities brs-geo-coverage]
  (map (fn [{:keys [brs_api_id country]}]
         {entity-name (get-in brs-entities [brs_api_id 0 :id])
          :country country})
       brs-geo-coverage))

(defn- build-connections-relations
  [entity-name entities brs-org-connections organisations]
  (reduce (fn [acc {:keys [brs_api_id name role]}]
            (let [org-id (get-in organisations [(str/lower-case name) 0 :id])]
              (if-not org-id
                acc
                (conj acc {entity-name (get-in entities [brs_api_id 0 :id])
                           :organisation (get-in organisations [(str/lower-case name) 0 :id])
                           :association role}))))
          []
          brs-org-connections))

(defn- save-translations
  [tx entity-name translations]
  (let [insert-cols (-> translations first keys)
        insert-values (sql-util/get-insert-values insert-cols translations)
        result (db.translation/create-or-update-translations tx
                                                             {:table (str (name entity-name) "_translation")
                                                              :resource-col (str (name entity-name) "_id")
                                                              :insert-cols (map name insert-cols)
                                                              :translations insert-values})]
    (if (= (first result) (count translations))
      result
      (throw (ex-info "Failed to save all translations" {:expected (count translations)
                                                         :actual (first result)})))))

(defn- create-entities*
  [tx entity-name db-create-fn db-transformer-fn relation? data-coll]
  (let [insert-cols (keys (first data-coll))
        insert-values (->> data-coll
                           (map db-transformer-fn)
                           (sql-util/get-insert-values insert-cols))
        result (db-create-fn tx
                             (merge
                              {:insert-cols (map name insert-cols)
                               :insert-values insert-values}
                              (when relation?
                                {:table (name entity-name)})))]
    (if (= (count result) (count data-coll))
      result
      (throw (ex-info (str "Failed to create all " (name entity-name) "s.") {:expected (count data-coll)
                                                                             :actual (count result)})))))

(defn- update-entities*
  [tx entity-name db-update-fn db-transformer-fn data-coll]
  (let [expected (count data-coll)
        db-entities (map db-transformer-fn data-coll)
        affected (reduce (fn [acc {:keys [id] :as db-entity}]
                           (let [result (db-update-fn tx {:id id
                                                          :updates (dissoc db-entity :id)})]
                             (+ acc result)))
                         0
                         db-entities)]
    (if (= affected (count data-coll))
      affected
      (throw (ex-info (str "Failed to update all " (name entity-name) "s.") {:expected expected
                                                                             :actual affected})))))

(defmulti ^:private update-entities
  (fn [_ entity-name _] entity-name))

(defmethod update-entities :resource
  [tx entity-name data-coll]
  (update-entities* tx
                    entity-name
                    db.resource/update-resource
                    db.resource/resource->db-resource
                    data-coll))

(defmethod update-entities :event
  [tx entity-name data-coll]
  (update-entities* tx
                    entity-name
                    db.event/update-event
                    db.event/event->db-event
                    data-coll))

(defmethod update-entities :initiative
  [tx entity-name data-coll]
  (update-entities* tx
                    entity-name
                    db.initiative/update-initiative
                    db.initiative/initiative->db-initiative
                    data-coll))

(defmulti ^:private create-entities
  (fn [_ entity-name _] entity-name))

(defmethod create-entities :resource
  [tx entity-name data-coll]
  (create-entities* tx
                    entity-name
                    db.resource/create-resources
                    db.resource/resource->db-resource
                    false
                    data-coll))

(defmethod create-entities :event
  [tx entity-name data-coll]
  (create-entities* tx
                    entity-name
                    db.event/create-events
                    db.event/event->db-event
                    false
                    data-coll))

(defmethod create-entities :tag
  [tx entity-name data-coll]
  (create-entities* tx
                    entity-name
                    db.tag/create-tags
                    db.tag/tag->db-tag
                    false
                    data-coll))

(defmethod create-entities :initiative
  [tx entity-name data-coll]
  (create-entities* tx
                    entity-name
                    db.initiative/create-initiatives
                    db.initiative/initiative->db-initiative
                    false
                    data-coll))

(defn- create-resource-geo-coverage-entities
  [tx entity-name data-coll]
  (create-entities* tx
                    entity-name
                    db.r.geo/create-resource-geo-coverage
                    identity
                    true
                    data-coll))

(defn- create-resource-tag-entities
  [tx entity-name data-coll]
  (create-entities* tx
                    entity-name
                    db.r.tag/create-resource-tags-v2
                    identity
                    true
                    data-coll))

(defn- create-resource-entity-connections
  [tx entity-name association-type data-coll]
  (create-entities* tx
                    entity-name
                    db.r.conn/create-resource-connections
                    #(db.r.conn/connection->db-connection % association-type)
                    true
                    data-coll))

(defmethod create-entities :organisation_initiative
  [tx entity-name data-coll]
  (create-resource-entity-connections tx entity-name "initiative_association" data-coll))

(defmethod create-entities :event_geo_coverage
  [tx entity-name data-coll]
  (create-resource-geo-coverage-entities tx entity-name data-coll))

(defmethod create-entities :initiative_geo_coverage
  [tx entity-name data-coll]
  (create-resource-geo-coverage-entities tx entity-name data-coll))

(defmethod create-entities :resource_tag
  [tx entity-name data-coll]
  (create-resource-tag-entities tx entity-name data-coll))

(defmethod create-entities :event_tag
  [tx entity-name data-coll]
  (create-resource-tag-entities tx entity-name data-coll))

(defmethod create-entities :initiative_tag
  [tx entity-name data-coll]
  (create-resource-tag-entities tx entity-name data-coll))

(defn- handle-translations-batch-import-or-update
  [tx entity-name entities-by-brs-api-id translations-table-data]
  (let [translations-to-create-or-update
        (build-translations entity-name entities-by-brs-api-id translations-table-data)]
    (when (seq translations-to-create-or-update)
      (save-translations tx entity-name translations-to-create-or-update))))

(defn- handle-geo-coverage-batch-import
  [tx entity-name entities-by-brs-api-id geo-coverage-table-data]
  (let [geo-coverage-to-create
        (build-geo-coverage-relations entity-name entities-by-brs-api-id geo-coverage-table-data)]
    (when (seq geo-coverage-to-create)
      (create-entities tx (keyword (str (name entity-name) "_geo_coverage")) geo-coverage-to-create))))

(defn- handle-tags-batch-import
  [tx entity-name entities tags-table-data {:keys [brs-tag-category-id old-tags-relations]}]
  (let [tags-without-duplicates (remove-tags-duplicates tags-table-data)
        tags (map :tag tags-without-duplicates)
        tags-db-opts {:filters (db.tag/opts->db-opts {:tags tags})}
        stored-tags (db.tag/get-tags tx tags-db-opts)
        tags-by-tags (group-by (comp str/lower-case :tag) stored-tags)
        tags-to-create (build-tags brs-tag-category-id tags-without-duplicates (keys tags-by-tags))
        created-tags (when (seq tags-to-create)
                       (create-entities tx :tag tags-to-create))
        tags-by-tags (merge tags-by-tags (group-by (comp str/lower-case :tag) created-tags))
        tags-relations-to-create (->> (build-tags-relations entity-name entities tags-table-data tags-by-tags)
                                      (filter #(nil? (get-in old-tags-relations [[(entity-name %) (:tag %)] 0]))))
        created-tags-relations (when (seq tags-relations-to-create)
                                 (create-entities tx
                                                  (keyword (str (name entity-name) "_tag"))
                                                  tags-relations-to-create))]
    {:created-tags (count created-tags)
     :created-tags-relations (count created-tags-relations)}))

(defn- handle-entity-connections
  [tx entity-name entities connections-table-data {:keys [old-connections-relations]}]
  (let [db-opts {:filters {:names (map :name connections-table-data)}}
        organisations (->> (db.organisation/get-organisations tx db-opts)
                           (group-by (comp str/lower-case :name)))
        connections-to-create
        (-> (build-connections-relations entity-name
                                         entities
                                         connections-table-data
                                         organisations)
            ((fn [conns]
               (if-not (seq old-connections-relations)
                 conns
                 (filter #(nil? (get-in old-connections-relations [[(entity-name %) (:organisation %)] 0])) conns)))))]
    (when (seq connections-to-create)
      (create-entities tx
                       (keyword (str "organisation_" (name entity-name)))
                       connections-to-create))))

(defn- get-entities-and-sub-entities-data
  "Given the entity name and a data collection from datasource, separates
  the data into main entity and sub entities dependent on the former."
  [entity-name data-coll {:keys [countries]}]
  (let [countries-by-iso-code (group-by (comp set (juxt :iso_code_a2 :iso_code_a3)) countries)]
    (reduce (fn [acc data]
              (let [domain-entity-keys (get-entity-schema-keys entity-name)
                    translation-keys (get-entity-translation-keys entity-name)
                    geo-coverage (:geo_coverage data)
                    domain-entity-data (select-keys data domain-entity-keys)
                    entity-table-data (-> domain-entity-data
                                          (default-to-en-translations translation-keys)
                                          (merge (get default-gpml-entity-values entity-name)))
                    translations-table-data (->> translation-keys
                                                 (select-keys domain-entity-data)
                                                 vals
                                                 (apply concat)
                                                 (remove #(= (:language %) "en")))
                    geo-coverage-table-data (add-country-id countries-by-iso-code geo-coverage)]
                (-> acc
                    (update :entity-table-data conj entity-table-data)
                    (update :translations-table-data concat translations-table-data)
                    (update :tags-table-data concat (:tags data))
                    (update :geo-coverage-table-data concat geo-coverage-table-data)
                    (update :connections-table-data concat (:entity_connections data)))))
            {}
            data-coll)))

(defn- handle-entities-batch-import
  [tx logger entity-name data-coll opts]
  (let [start-time (System/currentTimeMillis)
        ;; Entities data normalization
        {:keys [entity-table-data translations-table-data tags-table-data
                geo-coverage-table-data connections-table-data]}
        (get-entities-and-sub-entities-data entity-name data-coll opts)
        created-entities (create-entities tx entity-name entity-table-data)
        entities-by-brs-api-id (group-by :brs_api_id created-entities)
        ;; Translations
        created-or-updated-translations
        (handle-translations-batch-import-or-update tx
                                                    entity-name
                                                    entities-by-brs-api-id
                                                    translations-table-data)
        ;; Geo Coverage
        created-geo-coverage
        (handle-geo-coverage-batch-import tx
                                          entity-name
                                          entities-by-brs-api-id
                                          geo-coverage-table-data)
        ;; Tags
        {:keys [created-tags-relations created-tags]}
        (when (seq tags-table-data)
          (handle-tags-batch-import tx
                                    entity-name
                                    created-entities
                                    tags-table-data opts))
        ;; Entity connections
        created-connections
        (handle-entity-connections tx
                                   entity-name
                                   entities-by-brs-api-id
                                   connections-table-data
                                   {})
        end-time (System/currentTimeMillis)]
    (log logger :info ::finished-importing-entities {:entities-created (count created-entities)
                                                     :translations-processed created-or-updated-translations
                                                     :tags-created created-tags
                                                     :resource-tags-created created-tags-relations
                                                     :resource-geo-coverage-created (count created-geo-coverage)
                                                     :entity-connections-created (count created-connections)
                                                     :started-at (.toString (jt/instant start-time))
                                                     :finished-at (.toString (jt/instant end-time))
                                                     :time-elapsed (str (- end-time start-time) "ms")})))

(defn- handle-entities-batch-update
  [tx logger entity-name data-coll opts]
  (let [start-time (System/currentTimeMillis)
        ;; Entities data normalization
        {:keys [entity-table-data translations-table-data tags-table-data
                geo-coverage-table-data connections-table-data]}
        (get-entities-and-sub-entities-data entity-name data-coll opts)
        affected-entities (update-entities tx entity-name entity-table-data)
        entities-ids (map :id entity-table-data)
        entities-by-brs-api-id (group-by :brs_api_id entity-table-data)
        ;; Translations
        created-or-updated-translations
        (handle-translations-batch-import-or-update tx
                                                    entity-name
                                                    entities-by-brs-api-id
                                                    translations-table-data)
        ;; Geo Coverage
        old-geo-coverage-relations
        (->> (db.r.geo/get-resource-geo-coverage tx
                                                 {:table (str (name entity-name) "_geo_coverage")
                                                  :resource-col (name entity-name)
                                                  :filters {:resources-ids entities-ids}})
             (group-by (juxt entity-name :country)))
        new-geo-coverage (build-geo-coverage-relations entity-name
                                                       entities-by-brs-api-id
                                                       geo-coverage-table-data)
        geo-coverage-to-create (filter #(nil? (get-in old-geo-coverage-relations [[(entity-name %) (:country %)] 0])) new-geo-coverage)
        created-geo-coverage (when (seq geo-coverage-to-create)
                               (create-entities tx
                                                (keyword (str (name entity-name) "_geo_coverage"))
                                                geo-coverage-to-create))
        ;; Tags
        old-tags-relations
        (when (seq tags-table-data)
          (->> (db.r.tag/get-tags-from-resources tx
                                                 {:table (str (name entity-name) "_tag")
                                                  :resource-col (name entity-name)
                                                  :resource-ids entities-ids})
               (group-by (juxt entity-name :tag))))
        {:keys [created-tags-relations created-tags]}
        (when (seq tags-table-data)
          (handle-tags-batch-import tx
                                    entity-name
                                    entity-table-data
                                    tags-table-data
                                    (assoc opts :old-tags-relations old-tags-relations)))
        ;; Connections
        old-connections-relations
        (->> (db.r.conn/get-resource-connections tx
                                                 {:table (str "organisation_" (name entity-name))
                                                  :entity-col "organisation"
                                                  :resource-col (name entity-name)
                                                  :filters {:resources-ids entities-ids}})
             (group-by (juxt entity-name :organisation)))
        created-connections (handle-entity-connections tx
                                                       entity-name
                                                       entities-by-brs-api-id
                                                       connections-table-data
                                                       {:old-connections-relations old-connections-relations})
        end-time (System/currentTimeMillis)]
    (log logger :info ::finished-updating-entities {:affected-entities affected-entities
                                                    :translations-processed (first created-or-updated-translations)
                                                    :created-geo-coverage (count created-geo-coverage)
                                                    :created-connections (count created-connections)
                                                    :created-tags-relations created-tags-relations
                                                    :created-tags created-tags
                                                    :started-at (.toString (jt/instant start-time))
                                                    :finished-at (.toString (jt/instant end-time))
                                                    :time-elapsed (str (- end-time start-time) "ms")})))

(defn- download-image
  [logger url]
  (let [{:keys [status headers body]}
        (http-client/do-request logger
                                {:method :get
                                 :url url
                                 :as :byte-array}
                                {})]
    (when (<= 200 status 299)
      (->> body
           util/encode-base64
           (util/add-base64-header (get headers "Content-Type"))))))

(defn- with-safe-db-transaction
  [?tx logger entity-name data-coll {:keys [update?] :as opts}]
  (try
    (jdbc/with-db-transaction [tx ?tx]
      (if update?
        (handle-entities-batch-update tx logger entity-name data-coll opts)
        (handle-entities-batch-import tx logger entity-name data-coll opts)))
    {:success? true}
    (catch Throwable e
      (let [error-details {:entity-name entity-name
                           :exception-message (ex-message e)
                           :exception-data (ex-data e)
                           :stack-trace (map str (.getStackTrace e))}]
        (log logger :error ::failed-to-save-entity error-details)
        {:success? false
         :reason :failed-to-save-entity
         :error-details error-details}))))

(defn- add-gpml-image-url
  [config tx logger entity-name data-coll]
  (reduce
   (fn [acc {:keys [image qimage] :as entity}]
     (let [url (or image qimage)]
       (if-not url
         (conj acc entity)
         (let [downloaded-image (download-image logger url)
               image-url (when-not (nil? downloaded-image)
                           (handler.img/assoc-image config tx downloaded-image (name entity-name)))]
           (if (= entity-name :initiative)
             (conj acc (assoc entity :qimage image-url))
             (conj acc (assoc entity :image image-url)))))))
   []
   data-coll))

(defn- delete-images
  [config images-urls]
  (doseq [img-url images-urls
          :when (seq img-url)
          :let [[resource-name img-name] (subvec (str/split img-url #"/") 4 6)]]
    (handler.img/delete-blob config (str resource-name "/" img-name))))

(defmulti ^:private save-as-gpml-entity
  (fn [_ entity-name _ _]
    entity-name))

(defmethod save-as-gpml-entity :resource
  [{:keys [db logger] :as config} entity-name data-coll opts]
  (try
    (let [updated-data-coll (add-gpml-image-url config (:spec db) logger entity-name data-coll)
          result (with-safe-db-transaction (:spec db) logger entity-name updated-data-coll opts)]
      (if (:success? result)
        result
        (delete-images config (map :image updated-data-coll))))
    (catch Throwable e
      (let [error-details {:entity-name entity-name
                           :exception-message (ex-message e)
                           :exception-data (ex-data e)
                           :stack-trace (map str (.getStackTrace e))}]
        (log logger :error ::failed-to-save-entity error-details)
        {:success? false
         :reason :failed-to-save-entity
         :error-details error-details}))))

(defmethod save-as-gpml-entity :event
  [{:keys [logger db] :as config} entity-name data-coll opts]
  (try
    (jdbc/with-db-transaction [tx (:spec db)]
      (let [updated-data-coll (add-gpml-image-url config tx logger entity-name data-coll)]
        (with-safe-db-transaction tx logger entity-name updated-data-coll opts)))
    {:success? true}
    (catch Throwable e
      (let [error-details {:entity-name entity-name
                           :exception-message (ex-message e)
                           :exception-data (ex-data e)
                           :stack-trace (map str (.getStackTrace e))}]
        (log logger :error ::failed-to-save-entity error-details)
        {:success? false
         :reason :failed-to-save-entity
         :error-details error-details}))))

(defmethod save-as-gpml-entity :initiative
  [{:keys [db logger] :as config} entity-name data-coll opts]
  (try
    (let [updated-data-coll (add-gpml-image-url config (:spec db) logger entity-name data-coll)
          result (with-safe-db-transaction (:spec db) logger entity-name updated-data-coll opts)]
      (if (:success? result)
        result
        (delete-images config (map :qimage updated-data-coll))))
    (catch Throwable e
      (let [error-details {:entity-name entity-name
                           :exception-message (ex-message e)
                           :exception-data (ex-data e)
                           :stack-trace (map str (.getStackTrace e))}]
        (log logger :error ::failed-to-save-entity error-details)
        {:success? false
         :reason :failed-to-save-entity
         :error-details error-details}))))

(defn- get-import-and-update-entities
  [{:keys [db logger]} entity-name entities]
  (let [conn (:spec db)
        db-opts {:filters {:brs-api-ids (map :brs_api_id entities)}}
        stored-entities (->> (case entity-name
                               :resource (db.resource/get-resources conn db-opts)
                               :event (db.event/get-events conn db-opts)
                               :initiative (db.initiative/get-initiatives conn db-opts))
                             (group-by :brs_api_id))]
    (reduce (fn [acc {:keys [brs_api_id brs_api_modified] :as entity}]
              (let [{old-brs-api-modified :brs_api_modified id :id :as old-entity}
                    (get-in stored-entities [brs_api_id 0])]
                (if (seq old-entity)
                  (if (jt/after? brs_api_modified (sql-util/sql-timestamp->instant old-brs-api-modified))
                    (do
                      (log logger :debug ::updating-entity {:entity entity-name
                                                            :gpml-id id
                                                            :brs-api-id brs_api_id})
                      (update acc :to-update conj (assoc entity :id id)))
                    (do
                      (log logger :debug ::skipping-entity {:entity entity-name
                                                            :brs-api-id brs_api_id})
                      acc))
                  (update acc :to-import conj entity))))
            {}
            entities)))

(defn- import-or-update-entity
  [{:keys [brs-ds-adapter logger] :as config}
   {:keys [gpml-entity-name brs-entity-name]}
   opts]
  (try
    (loop [skip-token 0
           more-pages? true]
      (when more-pages?
        (let [{:keys [success? entities skip-token more-pages?] :as result}
              (datasource/get-data brs-ds-adapter {:entity brs-entity-name
                                                   :skip-token skip-token})]
          (if success?
            (let [{:keys [to-import to-update]}
                  (get-import-and-update-entities config gpml-entity-name entities)]
              (when (seq to-update)
                (save-as-gpml-entity config gpml-entity-name to-update (assoc opts :update? true)))
              (when (seq to-import)
                (save-as-gpml-entity config gpml-entity-name to-import opts)))
            (log logger :error ::failed-to-get-data-from-datasource {:result result}))
          (recur skip-token more-pages?))))
    (catch Throwable e
      (log logger :error ::something-bad-happened {:exception-message (ex-message e)
                                                   :stack-trace (map str (.getStackTrace e))
                                                   :entity gpml-entity-name})))
  (log logger :info ::finished {}))

(defn import-or-update-entities
  "Imports and/or updates existing data records from BRS API."
  [{:keys [db brs-entities-to-import] :as config}]
  (let [countries (db.country/get-countries (:spec db) {})
        brs-tag-category-id (get-brs-tag-category-id (:spec db))]
    (doseq [brs-entity-to-import brs-entities-to-import]
      (import-or-update-entity config
                               brs-entity-to-import
                               {:countries countries
                                :brs-tag-category-id brs-tag-category-id}))))

(defjob handle-import
  [_scheduler config]
  (import-or-update-entities config))

(defn- schedule-job [{:keys [scheduler logger] :as config} scheduler-config]
  (let [time-zone (java.util.TimeZone/getTimeZone ^String (:time-zone scheduler-config))]
    (log logger :info :handle-brs-api-import scheduler-config)
    (handle-import scheduler
                   [config]
                   :trigger {:cron {:expression (:cron scheduler-config)
                                    :misfire-handling :fire-and-process
                                    :time-zone time-zone}}
                   :job {:identity (:identity scheduler-config)})))

(defmethod ig/init-key :gpml.scheduler/brs-api-importer
  [_ {:keys [config scheduler-config]}]
  (schedule-job config scheduler-config))

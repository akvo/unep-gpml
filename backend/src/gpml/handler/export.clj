(ns gpml.handler.export
  (:require [clojure.set :as set]
            [duct.logger :refer [log]]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.tag :as db.tag]
            [gpml.db.topic :as db.topic]
            [gpml.domain.export :as dom.exp]
            [gpml.domain.file :as dom.file]
            [gpml.domain.types :as dom.types]
            [gpml.handler.resource.permission :as h.r.permission]
            [gpml.handler.responses :as r]
            [gpml.service.file :as srv.file]
            [gpml.util :as util]
            [gpml.util.csv :as csv]
            [integrant.core :as ig]
            [medley.core :as medley]))

(defn- add-export-files-urls
  [config src-dst-files-keys-mapping {:keys [files] :as export}]
  (if-not (seq files)
    (apply dissoc export (concat [:files] (keys src-dst-files-keys-mapping)))
    (let [files-w-urls (->> files
                            (map dom.file/decode-file)
                            (srv.file/add-files-urls config)
                            (medley/index-by :id))
          updated-export (reduce (fn [updated-export [src-file-key dst-file-key]]
                                   (assoc updated-export
                                          dst-file-key (get-in files-w-urls [(get updated-export src-file-key) :url])))
                                 export
                                 src-dst-files-keys-mapping)]
      (apply dissoc updated-export (concat [:files] (keys src-dst-files-keys-mapping))))))

(defn- org->org-export
  [{:keys [app-domain] :as config} src-dst-files-keys-mapping org]
  (as-> org export
    (dissoc export :is_member)
    (assoc export :platform-link (str app-domain "/organisation/" (:id org)))
    (add-export-files-urls config src-dst-files-keys-mapping export)))

(defn- create-csv-file
  [entities]
  (let [csv-data (csv/preserve-sort-coll->csv entities)
        csv-file (util/create-tmp-file "data_export_" ".csv")]
    (csv/write-to-csv-file csv-file csv-data)
    {:csv-file csv-file}))

(defn- sort-result-map
  [ordered-keys result-map]
  (let [keys->idx (zipmap ordered-keys (range))
        order-fn (fn [x y]
                   (< (keys->idx x)
                      (keys->idx y)))]
    (into (sorted-map-by order-fn) result-map)))

(defn- get-export-values
  [export-type export-type-key-map sorted-export-type-columns]
  (let [exports-to-sort (map #(set/rename-keys % export-type-key-map) export-type)]
    (if (empty? exports-to-sort)
      (->>
       (list (zipmap sorted-export-type-columns (repeat (count sorted-export-type-columns) nil)))
       (map #(sort-result-map sorted-export-type-columns %)))
      (map #(sort-result-map sorted-export-type-columns %) exports-to-sort))))

(defn- export-users
  [{:keys [db] :as config} review-status]
  (let [src-dst-files-keys-mapping {:picture_id :picture
                                    :cv_id :cv}
        users (->> (db.stakeholder/all-public-users (:spec db) {:review-status review-status})
                   (mapv (partial add-export-files-urls config src-dst-files-keys-mapping)))
        export-users (get-export-values users dom.exp/users-key-map dom.exp/sorted-user-columns)]
    (:csv-file (create-csv-file export-users))))

(defn- export-entities
  [{:keys [db] :as config} review-status]
  (let [src-dst-files-keys-mapping {:logo_id :logo}
        entities (->> (db.organisation/all-public-entities (:spec db) {:review-status review-status})
                      (map (partial org->org-export config src-dst-files-keys-mapping)))
        export-entities (get-export-values entities dom.exp/entities-key-map dom.exp/sorted-entity-columns)]
    (:csv-file (create-csv-file export-entities))))

(defn- export-non-member-entities
  [{:keys [db] :as config} review-status]
  (let [src-dst-files-keys-mapping {:logo_id :logo}
        non-member-entities
        (->> (db.organisation/all-public-non-member-entities (:spec db) {:review-status review-status})
             (map (partial org->org-export config src-dst-files-keys-mapping)))
        export-entities
        (get-export-values non-member-entities dom.exp/entities-key-map dom.exp/sorted-entity-columns)]
    (:csv-file (create-csv-file export-entities))))

(defn- export-tags
  [{:keys [db]} review-status]
  (let [tags (db.tag/get-flat-tags (:spec db) {:review-status review-status})
        export-tags (get-export-values tags dom.exp/tags-key-map dom.exp/sorted-tag-columns)]
    (:csv-file (create-csv-file export-tags))))

(defn- export-topics
  [{:keys [db] :as config} review-status]
  (let [src-dst-files-keys-mapping {:image_id :image}
        topics (->> (db.topic/get-flat-topics (:spec db) {:review-status review-status})
                    (map (partial add-export-files-urls config src-dst-files-keys-mapping)))
        export-topics (get-export-values topics dom.exp/topics-key-map dom.exp/sorted-topic-columns)]
    (:csv-file (create-csv-file export-topics))))

(defn- export
  [config export-type review-status]
  (case export-type
    "users" (export-users config review-status)
    "entities" (export-entities config review-status)
    "non-member-entities" (export-non-member-entities config review-status)
    "tags" (export-tags config review-status)
    "topics" (export-topics config review-status)))

(defmethod ig/init-key :gpml.handler.export/get
  [_ {:keys [logger] :as config}]
  (fn [{{:keys [path query]} :parameters user :user}]
    (try
      (if-not (h.r.permission/super-admin? config (:id user))
        (r/forbidden {:message "Unauthorized"})
        (let [export-type (:export-type path)
              review-status (:review_status query)]
          (r/ok (export config export-type review-status))))
      (catch Exception e
        (log logger :error :failed-to-create-export-file {:exception (class e)
                                                          :exception-message (ex-message e)})
        (r/server-error {:success? false
                         :reason :failed-to-create-export-file})))))

(defmethod ig/init-key :gpml.handler.export/get-params [_ _]
  {:path [:map
          [:export-type
           {:swagger {:description "Type of database entity to export."
                      :type "string"
                      :enum dom.exp/export-types}}
           (apply conj [:enum] dom.exp/export-types)]]
   :query [:map
           [:review_status
            {:optional true
             :swagger {:description "Database entity possible review statuses values."
                       :type "string"
                       :enum dom.types/review-statuses}}
            (apply conj [:enum] dom.types/review-statuses)]]})

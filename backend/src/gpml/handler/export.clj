(ns gpml.handler.export
  (:require [clojure.set :as set]
            [gpml.constants :as constants]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.tag :as db.tag]
            [gpml.db.topic :as db.topic]
            [gpml.util :as util]
            [gpml.util.csv :as csv]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(def export-types ["users" "entities" "non-member-entities" "topics" "tags"])

(defn create-csv-file [invoices]
  (let [csv-data (csv/preserve-sort-coll->csv invoices)
        csv-file (util/create-tmp-file "data_export_" ".csv")]
    (csv/write-to-csv-file csv-file csv-data)
    {:csv-file csv-file}))

(defn sort-result-map [ordered-keys result-map]
  (let [keys->idx (zipmap ordered-keys (range))
        order-fn (fn [x y]
                   (< (keys->idx x)
                      (keys->idx y)))]
    (into (sorted-map-by order-fn) result-map)))

(defn get-export-values [export-type export-type-key-map sorted-export-type-columns]
  (let [exports-to-sort (map #(set/rename-keys % export-type-key-map) export-type)]
    (if (empty? exports-to-sort)
      (->>
       (list (zipmap sorted-export-type-columns (repeat (count sorted-export-type-columns) nil)))
       (map #(sort-result-map sorted-export-type-columns %)))
      (map #(sort-result-map sorted-export-type-columns %) exports-to-sort))))

(defn export-users [db review-status]
  (let [users (db.stakeholder/all-public-users db {:review-status review-status})
        export-users (get-export-values users constants/users-key-map constants/sorted-user-columns)]
    (:csv-file (create-csv-file export-users))))

(defn export-entities [db review-status]
  (let [entities (db.organisation/all-public-entities db {:review-status review-status})
        export-entities (get-export-values (map #(dissoc % :is_member) entities) constants/entities-key-map constants/sorted-entity-columns)]
    (:csv-file (create-csv-file export-entities))))

(defn export-non-member-entities [db review-status]
  (let [non-member-entities (db.organisation/all-public-non-member-entities db {:review-status review-status})
        export-entities (get-export-values (map #(dissoc % :is_member) non-member-entities)
                                           constants/entities-key-map constants/sorted-entity-columns)]
    (:csv-file (create-csv-file export-entities))))

(defn export-tags [db review-status]
  (let [tags (db.tag/get-flat-tags db {:review-status review-status})
        export-tags (get-export-values tags constants/tags-key-map constants/sorted-tag-columns)]
    (:csv-file (create-csv-file export-tags))))

(defn export-topics [db review-status]
  (let [topics (db.topic/get-flat-topics db {:review-status review-status})
        export-topics (get-export-values topics constants/topics-key-map constants/sorted-topic-columns)]
    (:csv-file (create-csv-file export-topics))))

(defn export [db export-type review-status]
  (case export-type
    "users" (export-users db review-status)
    "entities" (export-entities db review-status)
    "non-member-entities" (export-non-member-entities db review-status)
    "tags" (export-tags db review-status)
    "topics" (export-topics db review-status)))

(defmethod ig/init-key :gpml.handler.export/get [_ {:keys [db]}]
  (fn [{{:keys [path query]} :parameters}]
    (let [conn (:spec db)
          export-type (:export-type path)
          review-status (:review_status query)]
      (resp/response (export conn export-type review-status)))))

(defmethod ig/init-key :gpml.handler.export/get-params [_ _]
  {:path [:map
          [:export-type (apply conj [:enum] export-types)]]
   :query [:map
           [:review_status {:optional true} [:enum "APPROVED" "REJECTED" "SUBMITTED"]]]})

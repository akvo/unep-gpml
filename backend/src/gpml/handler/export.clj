(ns gpml.handler.export
  (:require [clojure.set :as set]
            [gpml.constants :as constants]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.topic :as db.topic]
            [gpml.util.csv :as csv]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(def export-types ["users" "entities" "non-member-entities" "topics"])

(defmethod ig/init-key ::export-types [_ _]
  (apply conj [:enum] export-types))

(defn create-csv-file [invoices]
  (let [csv-data (csv/preserve-sort-coll->csv invoices)
        csv-file (csv/create-tmp-file ".csv")]
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

(defn export-users [db]
  (let [users (db.stakeholder/all-public-stakeholders db)
        export-users (get-export-values users constants/users-key-map constants/sorted-user-columns)]
    (create-csv-file export-users)))

(defn export-entities [db]
  (let [entities (db.organisation/all-public-entities db)
        export-entities (get-export-values (map #(dissoc % :is_member) entities) constants/entities-key-map constants/sorted-entity-columns)]
    (create-csv-file export-entities)))

(defn export-non-member-entities [db]
  (let [non-member-entities (db.organisation/all-public-non-member-entities db)
        export-entities (get-export-values (map #(dissoc % :is_member) non-member-entities)
                          constants/entities-key-map constants/sorted-entity-columns)]
    (create-csv-file export-entities)))

(defn export-topics [db]
  (let [topics (db.topic/get-flat-topics db)
        export-topics (get-export-values topics constants/topics-key-map constants/sorted-topic-columns)]
    (create-csv-file export-topics)))

(defn export [db export-type]
  (case export-type
    "users" (export-users db)
    "entities" (export-entities db)
    "non-member-entities" (export-non-member-entities db)
    "topics" (export-topics db)))

(defmethod ig/init-key :gpml.handler.export/get [_ {:keys [db]}]
  (fn [{{:keys [path]} :parameters}]
    (let [conn (:spec db)
          export-type (:export-type path)]
      (resp/response (export conn export-type)))))

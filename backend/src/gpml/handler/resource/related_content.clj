(ns gpml.handler.resource.related-content
  (:require [clojure.set :as set]
            [clojure.string :as str]
            [duct.logger :refer [log]]
            [gpml.db.resource.related-content :as db.resource.related-content]
            [gpml.handler.util :as handler.util]
            [gpml.util.sql :as sql-util]))

(def ^:const ^:private related-content-shared-keys
  [:id :title :description :image :thumbnail])

(def ^:const ^:private related-content-non-shared-keys-mapping
  {:initiative {:q2 :title
                :q3 :description
                :qimage :image}
   :technology {:name :title}
   :policy {:abstract :description}
   :resource {:summary :description}})

(defn- unwrap-related-contents
  [related-contents]
  (->> related-contents
       (map
        (fn [{:keys [resource_type resource_data]}]
          (let [resource-type (case resource_type
                                "resource" (str/replace (str/lower-case (:type resource_data)) #" " "_")
                                "initiative" "project"
                                resource_type)
                non-shared-keys-mapping (get related-content-non-shared-keys-mapping (keyword resource_type))]
            (-> resource_data
                (select-keys related-content-shared-keys)
                (merge (set/rename-keys (select-keys resource_data (keys non-shared-keys-mapping)) non-shared-keys-mapping))
                (assoc :type resource-type)))))
       (sort (fn [el1 _] (if (or (:thumbnail el1) (:image el1)) true false)))))

(defn create-related-contents
  "Creates related contents records for a given `resource-id` and `resource-table-name`"
  [conn logger resource-id resource-table-name related-contents]
  (try
    (let [related-contents (map
                            (fn [{related-resource-id :id
                                  related-resource-table-name :type
                                  related-content-relation-type :related_content_relation_type}]
                              {:resource_id resource-id
                               :resource_table_name (handler.util/get-internal-topic-type resource-table-name)
                               :related_resource_id related-resource-id
                               :related_resource_table_name (handler.util/get-internal-topic-type related-resource-table-name)
                               :related_content_relation_type related-content-relation-type})
                            related-contents)
          insert-cols (sql-util/get-insert-columns-from-entity-col related-contents)
          insert-values (sql-util/entity-col->persistence-entity-col related-contents)
          affected-rows (db.resource.related-content/create-related-contents conn
                                                                             {:insert-cols insert-cols
                                                                              :insert-values insert-values})]
      (if (= affected-rows (count related-contents))
        {:success? true}
        {:success? false}))
    (catch Exception e
      (log logger :error :could-not-create-related-contents {:exception-message (.getMessage e)})
      {:success? false
       :reason :could-not-create-related-contents
       :error-details {:message (.getMessage e)}})))

(defn update-related-contents
  "Updates the related contents records for a given `resource-id` and
  `resource-table-name`. Note that it deletes previous related content
  and creates everything from scratch."
  [conn logger resource-id resource-table-name related-contents]
  (db.resource.related-content/delete-related-contents conn {:resource-id resource-id
                                                             :resource-table-name resource-table-name})
  (create-related-contents conn logger resource-id resource-table-name related-contents))

(defn get-related-contents
  "Gets the related content for a give `resource-id` and
  `resource-table-name`. Returns a vector of maps with all the
  information about each related resource."
  [conn resource-id resource-table-name]
  (let [related-contents (db.resource.related-content/get-related-contents conn {:resource-id resource-id
                                                                                 :resource-table-name resource-table-name})]
    (unwrap-related-contents related-contents)))

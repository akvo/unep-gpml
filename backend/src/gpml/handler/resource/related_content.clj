(ns gpml.handler.resource.related-content
  (:require
   [clojure.set :as set]
   [clojure.string :as str]
   [gpml.constants :as constants]
   [gpml.db.resource.related-content :as db.resource.related-content]))

(def ^:const ^:private related-content-shared-keys
  [:id :title :description :image])

(def ^:const ^:private related-content-non-shared-keys-mapping
  {:initiative {:q2 :title
                :q3 :description
                :qimage :image}
   :technology {:name :title}
   :policy {:abstract :description}
   :resource {:summary :description}})

(defn- unwrap-related-contents
  [related-contents]
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
           (assoc :type resource-type))))
   related-contents))

(defn create-related-contents
  "Creates related contents records for a given `resource-id` and `resource-table-name`"
  [conn resource-id resource-table-name related-contents]
  (try
    (let [related-contents (map
                            (fn [{id :id resource-type :type}]
                              (vector
                               resource-id resource-table-name id
                               (if (some #{resource-type} constants/resource-types)
                                 "resource"
                                 resource-type)))
                            related-contents)
          affected-rows (db.resource.related-content/create-related-contents conn {:related-contents related-contents})]
      (if (= affected-rows (count related-contents))
        {:success? true}
        {:success? false}))
    (catch Exception e
      {:success? false
       :reason :could-not-create-related-contents
       :error-details {:message (.getMessage e)}})))

(defn update-related-contents
  "Updates the related contents records for a given `resource-id` and
  `resource-table-name`. Note that it deletes previous related content
  and creates everything from scratch."
  [conn resource-id resource-table-name related-contents]
  (db.resource.related-content/delete-related-contents conn {:resource-id resource-id
                                                             :resource-table-name resource-table-name})
  (create-related-contents conn resource-id resource-table-name related-contents))

(defn get-related-contents
  "Gets the related content for a give `resource-id` and
  `resource-table-name`. Returns a vector of maps with all the
  information about each related resource."
  [conn resource-id resource-table-name]
  (let [related-contents (db.resource.related-content/get-related-contents conn {:resource-id resource-id
                                                                                 :resource-table-name resource-table-name})]
    (unwrap-related-contents related-contents)))

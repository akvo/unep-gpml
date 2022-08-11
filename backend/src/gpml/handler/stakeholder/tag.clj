(ns gpml.handler.stakeholder.tag
  (:require [clojure.data :as dt]
            [clojure.set :as set]
            [clojure.walk :as w]
            [gpml.db.resource.tag :as db.resource.tag]
            [gpml.db.tag :as db.tag]
            [gpml.handler.resource.tag :as handler.resource.tag]))

(defn- add-tags-ids-for-categories
  [conn tags categories]
  (if-let [filtered-tags (seq (filter #(some #{(:tag_category %)} categories) tags))]
    (let [result (db.tag/tag-by-tags conn {:tags (map :tag filtered-tags)})]
      (map (fn [{tag-name :tag :as tag}]
             (let [grouped-result-tags (group-by :tag result)]
               (assoc tag :id (get-in grouped-result-tags [tag-name 0 :id]))))
           tags))
    tags))

(defn api-stakeholder-tags->stakeholder-tags
  "Transforms the `seeking`, `offering` and `expertise` keys into the
  canonical representation of `stakeholder_tag`.

  e.g.: `{:seeking [\"foo\"]
          :offering [\"bar\"]
          :expertise [\"barz\"]}`
                 to
       `[{:tag \"foo\" :tag_category \"seeking\"}
         {:tag \"bar\" :tag_category \"offering\"}
         {:tag \"barz\" :tag_category \"expertise\"}]`"
  [stakeholder]
  (reduce (fn [acc [category tags]]
            (concat acc (map (fn [tag] {:tag tag :tag_category (name category)}) tags)))
          []
          (select-keys stakeholder [:seeking :offering :expertise])))

(defn stakeholder-tags->api-stakeholder-tags
  "Transforms the `tags` data structure into three separate tag key
  types `seeking`, `offering` and `expertise`. Basically, the inverse
  operation of `api-stakeholder-tags->stakeholder-tags`."
  [tags]
  (reduce (fn [acc [k v]]
            (assoc acc k (map :tag v)))
          {}
          (-> (group-by :tag_relation_category tags)
              (w/keywordize-keys)
              (select-keys [:seeking :offering :expertise]))))

(defn- tag-diff
  [new-tags old-tags]
  (let [old-tags (->> old-tags
                      (map (comp #(set/rename-keys % {:tag_relation_category :tag_category})
                                 #(select-keys % [:tag :tag_relation_category])))
                      (group-by :tag_category))
        new-tags (group-by :tag_category new-tags)]
    (->> (reduce (fn [acc [category tags]]
                   (let [old-tags (map :tag (get acc category))
                         new-tags (map :tag tags)
                         [to-add _to-delete to-keep] (dt/diff new-tags old-tags)
                         tags-to-create (into [] (comp (map #(assoc {} :tag % :tag_category category))
                                                       (filter #(not (nil? (:tag %)))))
                                              (concat to-add to-keep))]
                     (assoc acc category tags-to-create)))
                 old-tags
                 new-tags)
         (vals)
         (apply concat))))

(defn save-stakeholder-tags
  "Saves the stakeholder tags. Tag resolution is done by name to check
  if they exist. Non-existent tags will be created with the provided
  `tag-category`.
  It handles errors during resource tag creation, returning the results for each operation if it fails, when creating
  resource tags."
  [conn logger mailjet-config
   {:keys [tags stakeholder-id update? handle-errors?]
    :or {update? false}}]
  (let [db-params {:table "stakeholder_tag"
                   :resource-col "stakeholder"
                   :resource-id stakeholder-id}
        old-tags (db.resource.tag/get-resource-tags conn db-params)
        tags (tag-diff tags old-tags)]
    (when (seq tags)
      (let [categories (->> tags (group-by :tag_category) keys)
            grouped-tags (group-by :tag_category (add-tags-ids-for-categories conn tags categories))]
        (when update?
          (db.resource.tag/delete-resource-tags conn db-params))
        (let [create-res-tags-results (mapv (fn [[tag-category tags]]
                                              (let [opts {:tags tags
                                                          :tag-category tag-category
                                                          :resource-name "stakeholder"
                                                          :resource-id stakeholder-id}]
                                                (handler.resource.tag/create-resource-tags
                                                 conn
                                                 logger
                                                 mailjet-config
                                                 (assoc opts :handle-errors? handle-errors?))))
                                            grouped-tags)]
          (if (every? #(get % :success?) create-res-tags-results)
            {:success? true}
            {:success? false
             :reason (-> create-res-tags-results first :reason)
             :results create-res-tags-results}))))))

(defn unwrap-tags
  "Unwrap `:tags` key into three different keys `seeking`, `offering`
  and `expertise`. Returns a map with the three keys."
  [stakeholder]
  (reduce (fn [acc [k v]]
            (assoc acc k (map :tag v)))
          {}
          (-> (group-by :tag_relation_category (:tags stakeholder))
              (w/keywordize-keys)
              (select-keys [:seeking :offering :expertise]))))

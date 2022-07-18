(ns gpml.handler.stakeholder.tag
  (:require [clojure.data :as dt]
            [clojure.set :as set]
            [clojure.string :as str]
            [clojure.walk :as w]
            [gpml.db.resource.tag :as db.resource.tag]
            [gpml.db.tag :as db.tag]
            [gpml.handler.resource.tag :as handler.resource.tag]))

(defn- add-tags-ids-for-categories
  [conn tags categories]
  (if-let [filtered-tags (seq (filter #(some #{(:tag_category %)} categories) tags))]
    (let [result (db.tag/tag-by-tags conn {:tags (map (comp str/lower-case :tag) filtered-tags)})]
      (map (fn [{tag-name :tag :as tag}]
             (let [grouped-result-tags (->> result
                                            (map #(update % :tag str/lower-case))
                                            (group-by :tag))]
               (assoc tag :id (get-in grouped-result-tags [(str/lower-case tag-name) 0 :id]))))
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
  (let [old-tags (map (comp #(set/rename-keys % {:tag_relation_category :tag_category})
                            #(select-keys % [:tag :tag_relation_category]))
                      old-tags)
        new-tags (map #(update % :tag str/lower-case) new-tags)]
    (dt/diff old-tags new-tags)))

(defn save-stakeholder-tags
  "Saves the stakeholder tags. Tag resolution is done by name to check
  if they exist. Non-existent tags will be created with the provided
  `tag-category`."
  [conn mailjet-config
   {:keys [tags stakeholder-id update?]
    :or {update? false}}]
  (let [db-params {:table "stakeholder_tag"
                   :resource-col "stakeholder"
                   :resource-id stakeholder-id}
        old-tags (db.resource.tag/get-resource-tags conn db-params)
        [_to-delete to-update-or-create to-keep] (tag-diff tags old-tags)
        tags (when (seq to-update-or-create) (concat to-keep to-update-or-create))]
    (when (seq tags)
      (let [categories (->> tags (group-by :tag_category) keys)
            grouped-tags (group-by :tag_category (add-tags-ids-for-categories conn tags categories))]
        (when update?
          (db.resource.tag/delete-resource-tags conn db-params))
        (doseq [[tag-category tags] grouped-tags
                :let [opts {:tags tags
                            :tag-category tag-category
                            :resource-name "stakeholder"
                            :resource-id stakeholder-id}]]
          (handler.resource.tag/create-resource-tags conn mailjet-config opts))))))

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

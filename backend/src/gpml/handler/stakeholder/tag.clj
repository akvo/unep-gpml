(ns gpml.handler.stakeholder.tag
  (:require [clojure.walk :as w]))

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

(ns gpml.handler.tag
  (:require [gpml.db.tag :as db.tag]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(def ^:const offerings-seekings
  "Mapping between offerings and seekings."
  {"software development" #{"software products"}
   "legal services" #{"funds" "legal expert"}
   "marine litter consultancy" #{"marine biologists" "marine litter experts"
                                 "plastic expert" "recyclers" "environmental scientists"
                                 "waste management services"}
   "knowledge management" #{"marine litter experts"}})

(defn get-offerings-seekings-matches [db offerings-ids seekings-ids]
  (let [offering-seekings (->> (db.tag/tag-by-category (:spec db) {:category "offering"})
                               (filter #(some #{(:id %)} offerings-ids))
                               (map :tag)
                               (reduce (fn [acc offering] (concat acc (get offerings-seekings offering))) []))
        seekings-to-search (->> (db.tag/tag-by-category (:spec db) {:category "seeking"})
                                (filter #(some #{(:id %)} seekings-ids))
                                (map :tag))
        seeking-offerings (reduce (fn [acc [offering seekings]]
                                    (if (seq (filter #(some #{%} seekings) seekings-to-search))
                                      (conj acc offering)
                                      acc))
                                  []
                                  offerings-seekings)]
    {:offering-seekings offering-seekings
     :seeking-offerings seeking-offerings}))

(defmethod ig/init-key :gpml.handler.tag/by-topic [_ {:keys [db]}]
  (fn [{{topic-type :topic-type} :path-params}]
    (let [conn (:spec db)
          category (format "%s%%" topic-type)
          category-tags (db.tag/tag-by-category conn {:category category})]
      (resp/response category-tags))))

(defn all-tags
  [db]
  (reduce-kv (fn [m k v]
               (assoc m k (mapv #(dissoc % :category) v)))
             {}
             (group-by :category (db.tag/all-tags db))))

(defmethod ig/init-key :gpml.handler.tag/all [_ {:keys [db]}]
  (fn [_]
    (resp/response (all-tags (:spec db)))))

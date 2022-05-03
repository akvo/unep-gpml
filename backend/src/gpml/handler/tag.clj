(ns gpml.handler.tag
  (:require
   [clojure.string :as str]
   [gpml.db.tag :as db.tag]
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
(defn create-tags
  "Creates N `tags` given a `tag-category`. `tags` are expected to have
  to have the following structure:
  - `[{:tag \"some tag\"} . . .]`"
  [conn tags tag-category]
  (let [tag-category ((comp :id first) (db.tag/get-tag-categories conn {:filters {:categories [tag-category]}}))
        new-tags (filter (comp not :id) tags)
        tags-to-create (map #(vector % tag-category) (map :tag new-tags))]
    (map :id (db.tag/new-tags conn {:tags tags-to-create}))))

(defn all-tags
  [db]
  (reduce-kv (fn [m k v]
               (assoc m k (mapv #(dissoc % :category) v)))
             {}
             (group-by :category (db.tag/all-tags db))))

(defmethod ig/init-key :gpml.handler.tag/all [_ {:keys [db]}]
  (fn [_]
    (resp/response (all-tags (:spec db)))))

(defmethod ig/init-key ::get-popular-topics-tags-params
  [_ _]
  {:query
   [:map
    [:tags
     {:optional true
      :swagger {:description "A comma separated list of tag names."
                :type "string"
                :allowEmptyValue true}}
     string?]
    [:limit
     {:optional true
      :default 20
      :swagger {:description "Limit the number of popular topic tags results"
                :type "int"
                :allowEmptyValue true}}
     pos-int?]]})

(defn- api-opts->opts
  [{:keys [limit tags]}]
  (cond-> {}
    limit
    (assoc :limit limit)

    (seq tags)
    (assoc-in [:filters :tags] (str/split tags #","))))

(defmethod ig/init-key ::get-popular-topics-tags
  [_ {:keys [db]}]
  (fn [{{:keys [query]} :parameters}]
    (resp/response (db.tag/get-popular-topics-tags (:spec db)
                                                   (api-opts->opts query)))))

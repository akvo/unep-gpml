(ns gpml.db.tag
  {:ns-tracker/resource-deps ["tag.sql"]}
  (:require [clojure.string :as str]
            [gpml.constants :as constants]
            [gpml.util :as util]
            [gpml.util.sql :as sql-util]
            [hugsql.core :as hugsql]))

(declare get-tags
         tag-by-tags
         new-tag-category
         new-tag
         new-tags
         tag-by-category
         tag-category-by-category-name
         all-tags
         get-flat-tags
         get-popular-topics-tags
         get-popular-topics-tags-subset
         get-more-popular-topics-tags
         get-tag-categories
         update-tag
         tag->db-tag
         create-tags)

(hugsql/def-db-fns "gpml/db/tag.sql" {:quoting :ansi})

(defn popular-tags->db-popular-tags [popular-tags]
  (str "('" (str/join "','" popular-tags) "')"))

(defn- generic-topic-tag-count-query
  [entity-name]
  (apply format "SELECT t.id, t.tag, COUNT(*) AS count
                 FROM %s e
                 JOIN %s_tag et ON et.%s = e.id
                 JOIN tag t ON t.id = et.tag
                 WHERE e.review_status = 'APPROVED' AND t.tag IN %s
                 GROUP BY t.id, t.tag"
         (flatten [(repeat 3 entity-name) (popular-tags->db-popular-tags constants/popular-tags)])))

(defn generate-popular-topics-tags-count-cte
  "Generates a CTE to get a result set of `tag` and the number of
  ocurrences in each topic. Since it unions N queries depending on the
  number of `topic-tables` it will return the results aggregated by
  each topic type. Therefore a final query is needed to aggregate the
  results by tag."
  [_params _opts]
  (str
   "WITH popular_topics_tags_count AS ("
   (reduce (fn [acc topic]
             (let [query (generic-topic-tag-count-query topic)]
               (if (seq acc)
                 (str acc " UNION ALL " query)
                 query)))
           ""
           constants/topic-tables)
   ")"))

(defn- generic-more-topic-tag-count-query
  [entity-name ids]
  (apply format "SELECT t.id, t.tag, COUNT(*) AS count
                 FROM %s e
                 JOIN %s_tag et ON et.%s = e.id
                 JOIN tag t ON t.id = et.tag
                 WHERE e.review_status = 'APPROVED' AND e.id IN %s
                 AND t.tag IN %s
                 GROUP BY t.id, t.tag"
         (flatten [(repeat 3 entity-name) ids (popular-tags->db-popular-tags constants/popular-tags)])))

(defn generate-more-popular-topics-tags-count-cte
  "Generates a CTE to get a result set of `tag` and the number of
  ocurrences in each topic. Since it unions N queries depending on the
  number of `topic-tables` it will return the results aggregated by
  each topic type. Therefore a final query is needed to aggregate the
  results by tag."
  [_params _opts]
  (str
   "WITH popular_topics_tags_count AS ("
   (reduce (fn [acc topic]
             (let [query (generic-more-topic-tag-count-query topic (get _params topic))]
               (if (seq acc)
                 (str acc " UNION ALL " query)
                 query)))
           ""
           _opts)
   ")"))

(defn- generic-topic-tag-subset-query
  [entity-name]
  (apply format "SELECT ARRAY_AGG(DISTINCT e.id) AS ids, t.tag, '%s' AS type
                 FROM %s e
                 JOIN %s_tag et ON et.%s = e.id
                 JOIN tag t ON t.id = et.tag
                 WHERE e.review_status = 'APPROVED'
                 GROUP BY t.tag"
         (repeat 4 entity-name)))

(defn generate-popular-topics-tags-subset-cte
  "Generates a CTE to get a result set the topics where the `tag` appears."
  [_params _opts]
  (str
   "WITH popular_topics_tags_subset_cte AS ("
   (reduce (fn [acc topic]
             (let [query (generic-topic-tag-subset-query topic)]
               (if (seq acc)
                 (str acc " UNION ALL " query)
                 query)))
           ""
           constants/topic-tables)
   ")"))

(defn tag->db-tag
  "Transform tag to be ready to be persisted in DB

   We want to have a specific function for this, since thus we can keep untouched
   the canonical entity representation."
  [tag]
  (-> tag
      (util/update-if-not-nil :review_status #(sql-util/keyword->pg-enum % "review_status"))))

(defn opts->db-opts
  "FIXME"
  [opts]
  (-> opts
      (util/update-if-not-nil :tags #(map str/lower-case %))))

(comment
  (require 'dev)

  (let [db (dev/db-conn)]
    (mapv #(:tag %) (gpml.db.tag/tag-by-category db {:category "event%"}))))

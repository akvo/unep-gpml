(ns gpml.db.tag
  (:require [hugsql.core :as hugsql]
            [gpml.constants :as constants]))

(declare all-countries
         tag-by-id
         tag-by-tags
         new-tag-category
         new-tag
         new-tags
         tag-by-category
         tag-category-by-category-name
         all-tags
         get-popular-topics-tags
         get-tag-categories

(hugsql/def-db-fns "gpml/db/tag.sql")

(defn- generic-topic-tag-count-query
  [entity-name]
  (apply format "SELECT t.id, t.tag, COUNT(*) AS count
                 FROM %s e
                 JOIN %s_tag et ON et.%s = e.id
                 JOIN tag t ON t.id = et.tag
                 WHERE e.review_status = 'APPROVED'
                 GROUP BY t.id, t.tag"
         (repeat 3 entity-name)))

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

(comment
  (require 'dev)

  (let [db (dev/db-conn)]
    (mapv #(:tag %) (gpml.db.tag/tag-by-category db {:category "event%"}))))

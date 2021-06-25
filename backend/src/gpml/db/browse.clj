(ns gpml.db.browse
  (:require [gpml.db.country :as db.country]
            [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/browse.sql")

(comment
  (require 'dev)

  (declare filter-topic) ;; to make clj-kondo happy
  (declare topic-counts) ;; to make clj-kondo happy
  (def params {:favorites 1 :user 1 :resource-types 1 :limit nil}) ;; to make clj-kondo happy
  (when (seq (:search-text params)) "AND search_text @@ to_tsquery(:search-text)")
  (when (seq (:geo-coverage params)) "AND geo_coverage IN (:v*:geo-coverage)")
  (when (seq (:topic params)) "AND topic IN (:v*:topic)")
  (when-not (or (seq (:geo-coverage params)) (seq (:search-text params))) "LIMIT 50")

  (format "LIMIT %s" (or (and (contains? params :limit) (:limit params)) 20) )

  (when (and (:favorites params) (:user params) (:resource-types params)) "JOIN v_stakeholder_association a ON a.stakeholder = :user AND a.id = (t.json->>'id')::int AND (a.topic = t.topic OR (a.topic = 'resource' AND t.topic IN (:v*:resource-types)))")

  (def db (dev/db-conn))

  (count (filter-topic db {:search-text "marine" :limit nil :offset nil}))

  (count (filter-topic db {:geo-coverage (->> {:codes ["ESP"]}
                                              (db.country/country-by-codes db)
                                              (map :id))}))
  ;; => 50


  (count (filter-topic db {:search-text "act"}))
  ;; => 50

  (count (filter-topic db {:search-text "act"
                           :geo-coverage [0, (-> (db.country/country-by-code db {:name "IND"}) :id)]}))
  ;; => 5

  (count (filter-topic db {:search-text "float"
                           :topic ["technology"]}))
  ;; => 5

  (filter-topic db {:search-text "act"
                    :geo-coverage [0, (-> (db.country/country-by-code db {:name "IND"}) :id)]})

  (count (filter-topic db {:search-text "closed" :topic ["technical_resource"]}))

  ,)

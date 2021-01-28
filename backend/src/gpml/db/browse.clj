(ns gpml.db.browse
  (:require [hugsql.core :as hugsql]))


(hugsql/def-db-fns "gpml/db/browse.sql")

(comment
  (require 'dev)

  (declare filter-topic) ;; to make clj-kondo happy
  (def params) ;; to make clj-kondo happy
  (when (seq (:search-text params)) "AND search_text @@ to_tsquery(:search-text)")
  (when (seq (:geo-coverage params)) "AND geo_coverage_iso_code IN (:v*:geo-coverage)")
  (when (seq (:topic params)) "AND topic IN (:v*:topic)")
  (when-not (or (seq (:geo-coverage params)) (seq (:search-text params))) "LIMIT 50")

  (def db (dev/db-conn))

  (filter-topic db {})

  (count (filter-topic db {:geo-coverage ["***" "ESP"]}))
  ;; => 84

  (count (filter-topic db {:search-text "act"}))
  ;; => 120

  (count (filter-topic db {:search-text "act"
                           :geo-coverage ["***", "IND"]}))
  ;; => 1

  (count (filter-topic db {:search-text "float"
                           :topic ["technology"]}))
  ;; => 1

  (filter-topic db {:search-text "act"
                    :geo-coverage ["***", "IND"]})

  (count (filter-topic db {:search-text "closed" :topic ["technical_resource"]}))

  ,)

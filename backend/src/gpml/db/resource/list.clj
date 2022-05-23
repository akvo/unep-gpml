(ns gpml.db.resource.list
  (:require
   [clojure.string :as str]
   [gpml.constants :as constants]
   [hugsql.core :as hugsql]))

(def ^:const default-limit 100)

(declare get-resources)

(hugsql/def-db-fns "gpml/db/resource/list.sql" {:quoting :ansi})

(defn generate-get-resources-query
  []
  (str/join " UNION ALL "
            (for [table constants/topic-tables]
              (let [title-column (case table
                                   "technology" "name"
                                   "initiative" "q2->>0"
                                   "title")]
                (format "SELECT id, %s AS title
                         FROM %s"
                        title-column
                        table)))))

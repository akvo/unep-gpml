(ns gpml.db.resource.list
  {:ns-tracker/resource-deps ["resource/list.sql"]}
  (:require [clojure.string :as str]
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
                                   "title")
                    type-column (if-not (= table "resource")
                                  (str "'" table "'")
                                  "REPLACE(LOWER(type), ' ', '_')")]
                (format "SELECT id, %s AS title, %s AS type
                         FROM %s"
                        title-column
                        type-column
                        table)))))

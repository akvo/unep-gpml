(ns gpml.db.resources
  #:ns-tracker{:resource-deps ["resources.sql"]}
  (:require
   [clojure.string :as str]
   [hugsql.core :as hugsql]))

(declare get-resources)

(hugsql/def-db-fns "gpml/db/resources.sql" {:quoting :ansi})

(def generic-cte-opts
  "Common set of options for all CTE generation functions."
  {:tables ["event" "technology" "policy" "initiative" "resource" "case_study"]
   :search-text-fields {"event" ["title" "description" "remarks"]
                        "technology" ["name"]
                        "policy" ["title" "original_title" "abstract" "remarks"]
                        "initiative" ["q2" "q3"]
                        "resource" ["title" "summary" "remarks"]
                        "case_study" ["title" "description"]}
   :select-fields {"event"      ["id" "'event' as type" "title" "created"]
                   "technology" ["id" "'technology' AS type" "name as title" "created"]
                   "policy"     ["id" "'policy' AS type" "title" "created"]
                   "initiative" ["id" "'initiative' AS type" "btrim((e.q2)::text, '\"'::text) AS title" "created"]
                   "resource"   ["id" "type" "title" "created"]
                   "case_study" ["id" "'case_study' AS type" "title" "created"]}})

#_{:clj-kondo/ignore [:clojure-lsp/unused-public-var]}
(def generic-entity-cte-opts
  "Common set of options for entity related CTE generation functions."
  {:tables ["stakeholder" "organisation"]})

(def table-rename-mapping
  "Some topics like financing_resource aren't the real table
  names we want to query. Therefore, when passing the following topic
  options as tables we need to rename them to their proper source
  table."
  {"financing_resource" "resource"
   "action_plan" "resource"
   "technical_resource" "resource"})

(defn- rename-tables [tables]
  (let [tables-to-rename (filter #(some #{%} (keys table-rename-mapping)) tables)
        renamed-tables (into #{}
                             (map #(get table-rename-mapping %))
                             tables-to-rename)]
    (into renamed-tables
          (remove #(some #{%} tables-to-rename))
          tables)))

(defn generate-resources-query
  [{:keys [topic sub-content-type] :as params}]
  (let [opts generic-cte-opts
        sql-per-resource (for [table (:tables opts)
                               :let [fields (get-in opts [:select-fields table])]]
                           (format "SELECT %s FROM %s e"
                                   (str/join "," fields)
                                   table))
        sql (str/join " UNION ALL " sql-per-resource)
        sql (str sql " ORDER BY created DESC, title ASC")]
    (prn sql)
    sql))

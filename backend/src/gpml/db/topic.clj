(ns gpml.db.topic
  {:ns-tracker/resource-deps ["topic.sql"]}
  (:require [clojure.string :as str]
            [hugsql.core :as hugsql]))

(declare get-topics get-flat-topics)

(hugsql/def-db-fns "gpml/db/topic.sql" {:quoting :ansi})

(def ^:const generic-cte-opts
  "Common set of options for all CTE generation functions."
  {:tables ["event" "technology" "policy" "initiative" "resource"]
   :search-text-fields {"event" ["title" "description" "remarks"]
                        "technology" ["name"]
                        "policy" ["title" "original_title" "abstract" "remarks"]
                        "initiative" ["q2" "q3"]
                        "resource" ["title" "summary" "remarks"]}})

#_{:clj-kondo/ignore [:clojure-lsp/unused-public-var]}
(def ^:const generic-entity-cte-opts
  "Common set of options for entity related CTE generation functions."
  {:tables ["stakeholder" "organisation"]})

(def ^:const table-rename-mapping
  "Some topics like financing_resource aren't the real table
  names we want to query. Therefore, when passing the following topic
  options as tables we need to rename them to their proper source
  table."
  {"financing_resource" "resource"
   "action_plan" "resource"
   "technical_resource" "resource"})

(defn- rename-tables
  [tables]
  (let [tables-to-rename (filter #(some #{%} (keys table-rename-mapping)) tables)
        renamed-tables (set (map #(get table-rename-mapping %) tables-to-rename))]
    (concat renamed-tables (remove #(some #{%} tables-to-rename) tables))))

(def ^:const ^:private initiative-cols
  "e.id,
   NULL::text AS uuid,
   NULL::text AS phase,
   e.q36 AS funds,
   e.q37 AS contribution,
   e.created,
   e.modified,
   btrim((e.q2)::text, '\"'::text) AS title,
   (SELECT jsonb_object_keys(e.q24)) AS geo_coverage_type,
   btrim((e.q3)::text, '\"'::text) AS summary,
   e.reviewed_at,
   e.reviewed_by,
   e.review_status,
   e.url,
   e.info_docs,
   e.sub_content_type,
   e.qimage,
   e.document_preview,
   btrim((e.q41_1)::text, '\"'::text) AS q41_1_url,
   e.q24_subnational_city,
   e.qimage AS image,
   e.thumbnail,
   e.capacity_building")

(def ^:const ^:private policy-cols
  "e.abstract AS summary,
   e.*")

(def ^:const ^:private event-cols
  "e.description AS summary,
   e.*")

(def ^:const ^:private technology-cols
  "e.name AS title,
   e.remarks AS summary,
   e.*")

(defn- generic-topic-search-text-field-query
  [search-text-field]
  (format "COALESCE(e.%s, '')" search-text-field))

(defn- initiative-topic-search-text-field-query
  "The columns used from initiative table are mostly JSON objects or
  JSON values so we need to convert them to the proper type when
  building the search text value."
  [search-text-field]
  (format "COALESCE(btrim((e.%s)::text), '')" search-text-field))

(defn- generate-tsvector-str
  "Generates SQL statements to concatenate the values of the columns
  specified in `search-text-fields` vector. It is meant to be used
  with `tsvector` to generate search strings for full text search.

  There is one exception to the generic query that is considered, when
  the content table is `initiative` the concatenation SQL statement
  changes because `initiative` table uses JSONB objects to store part
  of content (because of forms) and so the treament is slightly
  different."
  [entity-name search-text-fields]
  (reduce (fn [acc search-text-field]
            (let [query (if (= "initiative" entity-name)
                          (initiative-topic-search-text-field-query search-text-field)
                          (generic-topic-search-text-field-query search-text-field))]
              (if (seq acc)
                (str acc " || ' ' || " query)
                query)))
          ""
          search-text-fields))

(defn- get-table-specific-cols-exp
  [entity-name]
  (case entity-name
    "initiative" initiative-cols
    "policy" policy-cols
    "event" event-cols
    "technology" technology-cols
    "e.*"))

(defn- build-topic-data-query
  [entity-name
   {:keys [entity tag representative-group
           geo-coverage-types sub-content-type
           search-text review-status featured capacity-building upcoming] :as _params}
   {:keys [search-text-fields] :as _opts}]
  (let [entity-connections-join (if-not (or (seq entity) (seq representative-group))
                                  ""
                                  (format "LEFT JOIN organisation_%s oe ON e.id = oe.%s
                                           LEFT JOIN organisation org ON oe.organisation = org.id"
                                          entity-name entity-name))
        table-specific-cols (get-table-specific-cols-exp entity-name)
        search-text-fields (get search-text-fields entity-name)
        tsvector-str (generate-tsvector-str entity-name search-text-fields)
        geo-coverage-type-cond (if (= entity-name "initiative")
                                 "(select jsonb_object_keys(q24) from initiative where id = e.id)::geo_coverage_type"
                                 "e.geo_coverage_type")
        where-cond (cond-> "WHERE 1=1"
                     (seq review-status)
                     (str " AND e.review_status = :review-status::REVIEW_STATUS")

                     (seq entity)
                     (str " AND org.id IN (:v*:entity)")

                     (seq tag)
                     (str " AND t.tag IN (:v*:tag)")

                     (seq representative-group)
                     (str " AND org.type IN (:v*:representative-group)")

                     (seq geo-coverage-types)
                     (str " AND " geo-coverage-type-cond " = any(array[:v*:geo-coverage-types]::geo_coverage_type[])")

                     (seq sub-content-type)
                     (str " AND e.sub_content_type IN (:v*:sub-content-type)")

                     (seq search-text)
                     (str " AND " tsvector-str " @@ to_tsquery(:search-text)")

                     featured
                     (str " AND e.featured = :featured")

                     capacity-building
                     (str " AND e.capacity_building = :capacity-building")

                     (and upcoming (= entity-name "event"))
                     (str " AND now() < e.start_date"))]
    (apply
     format
     "SELECT
       %s,
       array_remove(array_agg(DISTINCT eg.country_group), NULL) AS geo_coverage_country_groups,
       array_remove(array_agg(DISTINCT eg.country), NULL) AS geo_coverage_countries,
       array_remove(array_agg(DISTINCT COALESCE(eg.country, eg.country_group)), NULL) AS geo_coverage_values,
       json_agg(json_build_object('id', t.id, 'tag', t.tag)) FILTER (WHERE t.id IS NOT NULL) AS tags
   FROM %s e
   LEFT JOIN %s_tag et ON et.%s = e.id LEFT JOIN tag t ON et.tag = t.id
   %s
   LEFT JOIN %s_geo_coverage eg ON eg.%s = e.id
   %s
   GROUP BY e.id"
     (concat [table-specific-cols]
             (repeat 3 entity-name)
             [entity-connections-join]
             (repeat 2 entity-name)
             [where-cond]))))

;;======================= Topic queries =================================
(defn- generic-topic-query
  "Generic query to generate topics."
  [topic-name-query entity-name]
  (apply format
         "SELECT
          %s AS topic,
          row_to_json(d.*) AS json
        FROM
          cte_%s_data d"
         (concat [topic-name-query] (repeat 2 entity-name))))

(defn- generic-topic-name-query
  [topic-name]
  (format "'%s'::text" topic-name))

(def ^:const ^:private resource-topic-name-query
  "replace(lower(d.type), ' ', '_')")

;;======================= Topic CTE query =================================
(defn- generic-topic-cte-query
  [entity-name]
  (format
   "SELECT
       cte.topic,
       cte.json
    FROM
        cte_%s_topic cte"
   entity-name))

;;======================= Utility functions =================================
(defn- generate-cte-sql
  "Generates raw SQL for a CTE construct. The caller is responsible for
  adding the trailing comma."
  [cte-name query]
  (str/join
   " "
   [(str cte-name " AS (")
    query
    ")"]))

;;======================= Functions to generate topic queries ================
(defn- build-topic-query
  "Generates SQL statements for querying topic information.

  There is one exception to the generic query that are
  considered. When the content table is `resource` the
  `topic-name-query` changes because `resource` table contains three
  types of resources and we should use their names instead of the
  table `entity-name`."
  [entity-name _ _]
  (let [topic-name entity-name
        topic-name-query (if (= "resource" entity-name)
                           resource-topic-name-query
                           (generic-topic-name-query topic-name))]
    (generic-topic-query topic-name-query entity-name)))

;;======================= Core functions to generate topic CTEs ================
(defn- generate-ctes*
  [cte-type query-builder-fn params opts]
  (reduce (fn [ctes entity-name]
            (let [normalized-cte-type (str/replace (name cte-type) "-" "_")
                  cte-name (str "cte_" entity-name "_" normalized-cte-type)
                  query (query-builder-fn entity-name params opts)
                  ctes (str ctes (generate-cte-sql cte-name query))]
              (if (= (last (:tables opts)) entity-name)
                ctes
                (str ctes ","))))
          ""
          (:tables opts)))

(defmulti generate-ctes
  "Generates the raw CTE SQL for the given query type."
  (fn [cte-type _ _] cte-type))

(defmethod generate-ctes :data
  [cte-type params opts]
  (generate-ctes* cte-type build-topic-data-query params opts))

(defmethod generate-ctes :entity_data
  [_ params opts]
  (generate-ctes* :data build-topic-data-query params opts))

(defmethod generate-ctes :topic
  [cte-type params opts]
  (generate-ctes* cte-type build-topic-query params opts))

(defn- generate-topic-cte
  "Generate the topic CTE by combining all topics CTEs."
  [_params opts]
  (generate-cte-sql "cte_topic"
                    (reduce (fn [cte-query entity-name]
                              (let [query (generic-topic-cte-query entity-name)
                                    cte-query (str cte-query " " query)]
                                (if (= (last (:tables opts)) entity-name)
                                  cte-query
                                  (str cte-query " UNION ALL "))))
                            ""
                            (:tables opts))))

#_{:clj-kondo/ignore [:clojure-lsp/unused-public-var]}
(defn generate-topic-query
  "Generates the SQL to query topic's (resources) data."
  [params opts]
  (let [opts (merge generic-cte-opts (when (seq (:tables opts))
                                       (update opts :tables rename-tables)))
        topic-data-ctes (generate-ctes :data params opts)
        topic-ctes (generate-ctes :topic params opts)
        topic-cte (generate-topic-cte {} opts)]
    (str
     "WITH "
     (str/join
      ","
      [topic-data-ctes
       topic-ctes
       topic-cte]))))

#_{:clj-kondo/ignore [:clojure-lsp/unused-public-var]}
(defn generate-entity-topic-query
  "Generates the SQL to query entity topics (stakeholders and
  organisations) data."
  [params opts]
  (let [topic-data-ctes (generate-ctes :entity_data params opts)
        topic-ctes (generate-ctes :topic params opts)
        topic-cte (generate-topic-cte {} opts)]
    (str
     "WITH "
     (str/join
      ","
      [topic-data-ctes
       topic-ctes
       topic-cte]))))

(def ^:const ^:private count-aggregate-query-raw-sql
  "SELECT topic, COUNT(*) FROM cte_results GROUP BY topic")

(def ^:const ^:private capacity-building-count-aggregate-query-raw-sql
  "SELECT 'capacity_building' AS topic, COUNT(*)
   FROM cte_results
   WHERE CAST(json->>'capacity_building' AS BOOLEAN) IS TRUE")

(def ^:const  ^:private tags-count-aggregate-hugsql
  "This fragment counts tags ignoring duplicates when comparing them as lowercase,
   since that is the desired behaviour.

   Regarding the ON TRUE lateral join statement, we do it in this way since we have all the tags
   in each row that comes from cte_results' json column.

   The results with no tags are also omitted so no extra rows are added.

   Before doing the join we are removing tags that do not match the set of tags-to-count."

  "SELECT LOWER(tags.tag) AS topic, COUNT(*)
   FROM cte_results t
   JOIN LATERAL (SELECT DISTINCT LOWER(tag) AS tag
                 FROM json_populate_recordset
                   (null::record,
                    CASE WHEN (t.json->>'tags'::TEXT = '') IS NOT FALSE THEN '[]'::JSON
                    ELSE (t.json->>'tags')::JSON END)
                 AS (id INTEGER, tag TEXT)
                 WHERE LOWER(tag) IN (:v*:tags-to-count)) tags
   ON TRUE
   GROUP BY 1")

(defn- generate-count-aggregate-query
  [{:keys [tags-to-count capacity-building]}]
  (str
   count-aggregate-query-raw-sql
   (when (seq tags-to-count)
     (str " UNION ALL " tags-count-aggregate-hugsql))
   (when-not (nil? capacity-building)
     (str " UNION ALL " capacity-building-count-aggregate-query-raw-sql))))

(defn- generate-get-topics-query
  [{:keys [order-by limit offset descending upcoming topic]}]
  (let [order (if descending "DESC" "ASC")
        order-by-clause (cond
                          ;; We assume the upcoming filter will always
                          ;; be together with the event topic. The
                          ;; browse API disallows its usage if there
                          ;; are multiple topics.
                          (and upcoming (= (first topic) "event"))
                          "ORDER BY json->>'start_date' ASC"

                          (seq order-by)
                          (format "ORDER BY json->>'%s' %s" order-by order)

                          :else
                          "ORDER BY (COALESCE(json->>'start_date', json->>'created'))::timestamptz DESC")]
    (str/join
     " "
     ["SELECT * FROM cte_results"
      order-by-clause
      (when limit
        "LIMIT :limit")
      (when offset
        "OFFSET :offset")])))

#_{:clj-kondo/ignore [:clojure-lsp/unused-public-var]}
(defn generate-get-topics
  "Generates the SQL for querying topic's data. If `count-only?` is true
  then generates the SQL for counting topics."
  [{:keys [count-only?] :as opts}]
  (if count-only?
    (generate-count-aggregate-query opts)
    (generate-get-topics-query opts)))

(defn- generic-json-array-lookup-cond
  [json-column values-to-lookup]
  (format
   "(SELECT COUNT(*)
     FROM json_array_elements_text((CASE WHEN (%s::TEXT = '') IS NOT FALSE THEN '[]'::JSON
                                         ELSE (%s)::JSON END))
     WHERE value::INTEGER IN (:v*:%s)) > 0" json-column json-column values-to-lookup))

#_{:clj-kondo/ignore [:clojure-lsp/unused-public-var]}
(defn generate-filter-topic-snippet
  "Generates the SQL to apply filters to the topics aggregate."
  [{:keys [favorites user-id topic start-date end-date transnational
           geo-coverage resource-types geo-coverage-countries
           affiliation]}]
  (let [geo-coverage? (seq geo-coverage)
        transnational? (seq transnational)
        geo-coverage-countries? (seq geo-coverage-countries)]
    (str/join
     " "
     (list
      "SELECT t.* FROM cte_topic t"
      ;; FIXME fix this to user a query instead of a view.
      (when (and favorites user-id resource-types)
        "JOIN v_stakeholder_association a
         ON a.stakeholder = :user-id
         AND a.id = (t.json->>'id')::int
         AND (a.topic = t.topic OR (a.topic = 'resource'
              AND t.topic IN (:v*:resource-types)))")
      " WHERE 1=1"
      (when (seq topic)
        " AND topic IN (:v*:topic)")
      (when (seq affiliation)
        " AND (t.json->'affiliation'->>'id')::int IN (:v*:affiliation)")
      (when (and (= (count topic) 1)
                 (= (first topic) "event"))
        (cond
          (and (seq start-date) (seq end-date))
          " AND (TO_DATE(json->>'start_date', 'YYYY-MM-DD'), (TO_DATE(json->>'end_date', 'YYYY-MM-DD'))) OVERLAPS
                (:start-date::date, :end-date::date)"
          (seq start-date)
          " AND TO_DATE(json->>'start_date', 'YYYY-MM-DD') >= :start-date::date"
          (seq end-date)
          " AND TO_DATE(json->>'end_date', 'YYYY-MM-DD') <= :end-date::date"))
      (cond
        (and geo-coverage-countries? transnational?)
        (str " AND (" (generic-json-array-lookup-cond "t.json->>'geo_coverage_values'" "geo-coverage-countries")
             " OR t.json->>'geo_coverage_type'='transnational'
               AND " (generic-json-array-lookup-cond "t.json->>'geo_coverage_country_groups'" "transnational") ")")

        (and geo-coverage? transnational?)
        (str " AND (" (generic-json-array-lookup-cond "t.json->>'geo_coverage_countries'" "geo-coverage")
             " OR t.json->>'geo_coverage_type'='transnational'
                 AND " (generic-json-array-lookup-cond "t.json->>'geo_coverage_country_groups'" "transnational") ")")

        geo-coverage?
        (str " AND " (generic-json-array-lookup-cond "t.json->>'geo_coverage_countries'" "geo-coverage"))

        geo-coverage-countries?
        (str " AND " (generic-json-array-lookup-cond "t.json->>'geo_coverage_values'" "geo-coverage-countries")))))))

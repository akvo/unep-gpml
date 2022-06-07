(ns gpml.db.topic
  (:require [clojure.string :as str]
            [hugsql.core :as hugsql]))

;; FIXME: for some reason unknown to clj-kondo give 'unresolved var'
;; warnings about the hugSQL functions. It only happens if there are
;; other functions defined in the same namespace where
;; husql/def-db-fns is run.
;;
;; Lucas Sousa 2022-01-20
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

(def ^:const generic-entity-cte-opts
  "Common set of options for entity related CTE generation functions."
  {:tables ["stakeholder" "organisation"]
   :search-text-fields {"stakeholder" ["first_name" "last_name" "about"]
                        "organisation" ["name" "program" "contribution" "expertise"]}})

(def ^:const table-rename-mapping
  "Some topics like financing_resource and project aren't the real table
  names we want to query. Therefore, when passing the following topic
  options as tables we need to rename them to their proper source
  table."
  {"financing_resource" "resource"
   "action_plan" "resource"
   "technical_resource" "resource"
   "project" "initiative"})

(defn- rename-tables
  [tables]
  (let [tables-to-rename (filter #(some #{%} (keys table-rename-mapping)) tables)
        renamed-tables (set (map #(get table-rename-mapping %) tables-to-rename))]
    (concat renamed-tables (remove #(some #{%} tables-to-rename) tables))))

;;======================= Entity connections ==========================
(defn generic-topic-entity-connections-query
  [entity-name]
  (apply format
         "LEFT JOIN (
        SELECT
            e.id,
            json_agg(json_build_object('id', oe.id,
                                       'entity_id', org.id,
                                       'entity', org.name,
                                       'role', oe.association,
                                       'image', org.logo,
                                       'representative_group', (
                        CASE WHEN representative_group_government IS NOT NULL THEN
                            'government'
                        WHEN representative_group_private_sector IS NOT NULL THEN
                            'private-sector'
                        WHEN representative_group_academia_research IS NOT NULL THEN
                            'academia-research'
                        WHEN representative_group_civil_society IS NOT NULL THEN
                            'civil-society'
                        WHEN representative_group_other IS NOT NULL THEN
                            'other'
                        ELSE
                            NULL
                        END))) FILTER (WHERE oe.id IS NOT NULL) AS entity_connections
        FROM
            %s e
            JOIN organisation_%s oe ON e.id = oe.%s
            JOIN organisation org ON oe.organisation = org.id
        GROUP BY
            e.id) ec ON ec.id = e.id"
         (repeat 3 entity-name)))

;;======================= Data queries =================================
(def ^:const ^:private organisation-topic-data-geo-coverage-values-query
  "LEFT JOIN (
       SELECT
           og.organisation,
           json_agg(COALESCE(c.iso_code, (cg.name)::bpchar)) AS geo_coverage_values
       FROM
            organisation_geo_coverage og
            LEFT JOIN country c ON og.country = c.id
            LEFT JOIN country_group cg ON og.country_group = cg.id
    GROUP BY
        og.organisation) geo ON e.id = geo.organisation")

(def ^:const ^:private resource-topic-data-organisations-query
  "LEFT JOIN (
        SELECT
            ro.resource,
            json_agg(json_build_object('id', o.id, 'name', o.name)) AS organisations
        FROM
            resource_organisation ro
            JOIN organisation o ON ro.organisation = o.id
    GROUP BY
        ro.resource
   ) orgs ON e.id = orgs.resource")

(def ^:const ^:private stakeholder-topic-data-organisation-query
  "LEFT JOIN organisation o ON e.affiliation = o.id")

(def ^:const ^:private generic-topic-data-select-clause
  "SELECT
       e.*,
       geo.geo_coverage_values,
       geo.geo_coverage_country_groups,
       geo.geo_coverage_countries,
       lang.languages,
       tag.tags,
       ec.entity_connections")

(def ^:const ^:private initiative-topic-data-select-clause
  "SELECT
       e.id,
       'Initiative' AS type,
       NULL::text AS uuid,
       NULL::text AS phase,
       e.q36 AS funds,
       e.q37 AS contribution,
       e.created,
       e.modified,
       btrim((e.q2)::text, '\"'::text) AS title,
       jsonb_object_keys(e.q24) AS geo_coverage_type,
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
       NULL::text AS image,
       tag.tags,
       geo.geo_coverage_values,
       geo.geo_coverage_country_groups,
       geo.geo_coverage_countries,
       ec.entity_connections")

(def ^:const ^:private policy-topic-data-select-clause
  "SELECT
       e.abstract AS summary,
       'Policy' AS type,
       e.*,
       geo.geo_coverage_values,
       geo.geo_coverage_country_groups,
       geo.geo_coverage_countries,
       lang.languages,
       tag.tags,
       ec.entity_connections")

(def ^:const ^:private event-topic-data-select-clause
  "SELECT
       e.description AS summary,
       'Event' AS type,
       e.*,
       geo.geo_coverage_values,
       geo.geo_coverage_country_groups,
       geo.geo_coverage_countries,
       lang.languages,
       tag.tags,
       ec.entity_connections")

(def ^:const ^:private technology-topic-data-select-clause
  "SELECT
       e.name AS title,
       'Technology' AS type,
       e.remarks AS summary,
       e.*,
       geo.geo_coverage_values,
       geo.geo_coverage_country_groups,
       geo.geo_coverage_countries,
       lang.languages,
       tag.tags,
       ec.entity_connections")

(def ^:const ^:private stakeholder-topic-data-select-clause
  "SELECT
       e.id,
       e.picture,
       e.title,
       e.first_name,
       e.last_name,
       CASE WHEN (e.public_email = TRUE) THEN
           e.email
       ELSE
           ''::text
       END AS email,
       e.linked_in,
       e.twitter,
       e.url,
       e.representation,
       e.about,
       e.geo_coverage_type,
       e.created,
       e.modified,
       e.reviewed_at,
       e.role,
       e.job_title,
       e.cv,
       e.reviewed_by,
       e.review_status,
       e.public_email,
       e.country,
       e.organisation_role,
       geo.geo_coverage_values,
       row_to_json(o.*) AS affiliation,
       tag.tags,
       geo.geo_coverage_country_groups,
       geo.geo_coverage_countries")

(def ^:const ^:private organisation-topic-data-select-clause
  "SELECT
       e.*,
       geo.geo_coverage_values")

(def ^:const ^:private resource-topic-data-organisations-field
  "orgs.organisations")

(def ^:const ^:private initiative-topic-data-tags-query
  "LEFT JOIN (
       SELECT
           i.id,
           json_agg(tag_text.*) AS tags
       FROM
           initiative i
           JOIN LATERAL jsonb_array_elements(i.q32) tag_elements(value) ON true
           JOIN LATERAL jsonb_each_text(tag_elements.value) tag_text(id, tag) ON true
       GROUP BY
           i.id
   ) tag ON e.id = tag.id")

(def ^:const ^:private generic-topic-data-order-by-clause
  "ORDER BY
       e.created")

(defn generic-topic-data-languages-query
  [entity-name]
  (apply format
         "LEFT JOIN (
              SELECT
                  elu. %s,
                  json_agg(json_build_object('url', elu.url, 'iso_code', l.iso_code)) AS languages
              FROM
                  %s_language_url elu
              JOIN
                  LANGUAGE l
                  ON elu.language = l.id
              GROUP BY
                  elu.%s) lang ON e.id = lang.%s"
         (repeat 4 entity-name)))

(defn generic-topic-data-tags-query
  [entity-name]
  (apply format
         "LEFT JOIN (
              SELECT
                  et.%s,
                  json_agg(json_build_object('id', t.id, 'tag', t.tag)) AS tags
              FROM
                  %s_tag et
              JOIN tag t ON et.tag = t.id
              GROUP BY
                  et.%s) tag ON e.id = tag.%s"
         (repeat 4 entity-name)))

(defn generic-topic-data-geo-coverage-values-query
  [entity-name]
  (apply format
         "LEFT JOIN (
              SELECT
                  eg.%s,
                  json_agg(COALESCE(eg.country_group, 0)) FILTER (WHERE (eg.country_group IS NOT NULL)) AS geo_coverage_country_groups,
                  json_agg(COALESCE(eg.country, 0)) FILTER (WHERE (eg.country IS NOT NULL)) AS geo_coverage_countries,
                  json_agg(COALESCE(eg.country, eg.country_group, 0)) AS geo_coverage_values
              FROM
                  %s_geo_coverage eg
              GROUP BY
                  eg.%s
   ) geo ON e.id = geo.%s"
         (repeat 4 entity-name)))

(defn generic-topic-data-from-clause
  [entity-name]
  (format
   "FROM
        %s e"
   entity-name))

;;======================= Geo Coverage queries =================================
(defn generic-topic-geo-coverage-query
  "Generic query for geo coverage data. The `e` alias stands for
  `entity`."
  [entity-name]
  (let [non-global-where-cond (if (= entity-name "initiative")
                                "e.q24->>'global'::TEXT IS NULL"
                                "e.geo_coverage_type <> 'global'::geo_coverage_type")
        global-where-cond (if (= entity-name "initiative")
                            "e.q24->>'global'::TEXT IS NOT NULL"
                            "e.geo_coverage_type = 'global'::geo_coverage_type")]
    (apply format
           "SELECT
        e.id,
        json_agg(COALESCE(cgc.country, egc.country)) AS geo_coverage
    FROM
        %s e
        LEFT JOIN %s_geo_coverage egc ON e.id = egc.%s
        LEFT JOIN country_group_country cgc ON cgc.country_group = egc.country_group
    WHERE
         %s
    GROUP BY e.id
    UNION ALL
    SELECT e.id,
         '[0]'::json
    FROM
        %s e
    WHERE
        %s
    GROUP BY e.id"
           (concat
            (repeat 3 entity-name)
            [non-global-where-cond entity-name global-where-cond]))))

(defn generic-entity-geo-coverage-query
  [entity-name]
  (format
   "SELECT e.id, json_agg(c.id) AS geo_coverage
    FROM %s e
    LEFT JOIN country c ON e.country = c.id
    GROUP BY e.id"
   entity-name))

;;======================= Search Text queries =================================
(def ^:const ^:private organisation-topic-search-text-where-cond
  "WHERE (organisation.review_status = 'APPROVED'::public.review_status)")

(defn generic-topic-search-text-query
  [tsvector-str entity-name where-cond]
  (format
   "SELECT
        id,
        to_tsvector('english'::regconfig, %s) AS search_text
     FROM
         %s
     %s
     ORDER BY
         created"
   tsvector-str
   entity-name
   where-cond))

(defn generic-topic-search-text-field-query
  [entity-name search-text-field]
  (format "COALESCE(%s.%s, '')" entity-name search-text-field))

(defn initiative-topic-search-text-field-query
  "The columns used from initiative table are mostly JSON objects or
  JSON values so we need to convert them to the proper type when
  building the search text value."
  [entity-name search-text-field]
  (format "COALESCE(btrim((%s.%s)::text), '')" entity-name search-text-field))

;;======================= Topic queries =================================
(defn generic-topic-query
  "Generic query to generate topics."
  [topic-name-query entity-name]
  (apply format
         "SELECT
        %s AS topic,
        geo.geo_coverage,
        st.search_text,
        row_to_json(d.*) AS json
    FROM
        cte_%s_data d
        LEFT JOIN cte_%s_geo geo ON d.id = geo.id
        LEFT JOIN cte_%s_search_text st ON d.id = st.id"
         (concat [topic-name-query] (repeat 3 entity-name))))

(defn generic-topic-name-query
  [topic-name]
  (format "'%s'::text" topic-name))

(def ^:const ^:private resource-topic-name-query
  "replace(lower(d.type), ' ', '_')")

;;======================= Topic CTE query =================================
(defn generic-topic-cte-query
  [entity-name]
  (format
   "SELECT
       cte.topic,
       cte.geo_coverage,
       cte.search_text,
       cte.json
    FROM
        cte_%s_topic cte"
   entity-name))

;;======================= Utility functions =================================
(defn generate-cte-sql
  "Generates raw SQL for a CTE construct. The caller is responsible for
  adding the trailing comma."
  [cte-name query]
  (str/join
   " "
   [(str cte-name " AS (")
    query
    ")"]))

;;======================= Functions to generate topic queries ================
(defn generate-tsvector-str
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
                          (initiative-topic-search-text-field-query entity-name search-text-field)
                          (generic-topic-search-text-field-query entity-name search-text-field))]
              (if (seq acc)
                (str acc " || ' ' || " query)
                query)))
          ""
          search-text-fields))

(defn build-topic-data-query
  [entity-name _ _]
  (let [lang-query (generic-topic-data-languages-query entity-name)
        tags-query (generic-topic-data-tags-query entity-name)
        geo-coverage-values-query (generic-topic-data-geo-coverage-values-query entity-name)
        entity-connections-query (generic-topic-entity-connections-query entity-name)
        select-clause generic-topic-data-select-clause
        from-clause (generic-topic-data-from-clause entity-name)
        order-by-clause generic-topic-data-order-by-clause
        query-statements (case entity-name
                           "resource" [select-clause (str ", " resource-topic-data-organisations-field)
                                       from-clause lang-query tags-query entity-connections-query
                                       geo-coverage-values-query resource-topic-data-organisations-query
                                       order-by-clause]

                           "initiative" [initiative-topic-data-select-clause
                                         from-clause initiative-topic-data-tags-query entity-connections-query
                                         geo-coverage-values-query order-by-clause]

                           "policy" [policy-topic-data-select-clause
                                     from-clause lang-query tags-query entity-connections-query
                                     geo-coverage-values-query order-by-clause]

                           "event" [event-topic-data-select-clause
                                    from-clause lang-query tags-query entity-connections-query
                                    geo-coverage-values-query order-by-clause]

                           "technology" [technology-topic-data-select-clause
                                         from-clause lang-query tags-query entity-connections-query
                                         geo-coverage-values-query order-by-clause]

                           [select-clause from-clause lang-query tags-query entity-connections-query
                            geo-coverage-values-query order-by-clause])]
    (str/join " " query-statements)))

(defn build-entity-topic-data-query
  [entity-name _ _]
  (let [tags-query (generic-topic-data-tags-query entity-name)
        geo-coverage-values-query (generic-topic-data-geo-coverage-values-query entity-name)
        from-clause (generic-topic-data-from-clause entity-name)
        order-by-clause generic-topic-data-order-by-clause
        query-statements (case entity-name
                           "stakeholder" [stakeholder-topic-data-select-clause from-clause
                                          tags-query geo-coverage-values-query
                                          stakeholder-topic-data-organisation-query
                                          order-by-clause]

                           "organisation" [organisation-topic-data-select-clause
                                           from-clause organisation-topic-data-geo-coverage-values-query
                                           order-by-clause])]
    (str/join " " query-statements)))

(defn build-topic-geo-coverage-query
  "Generates SQL statements for querying geo coverage information
  for every content table.

  There is one exception to the generic query that is considered, when
  the content table is `initiative` the `WHERE` condition changes."
  [entity-name _ _]
  (if (some #{entity-name} ["organisation" "stakeholder"])
    (generic-entity-geo-coverage-query entity-name)
    (generic-topic-geo-coverage-query entity-name)))

(defn build-topic-search-text-query
  "Generates SQL statements for querying searchable text from every
  content table. Every query requires a collection of fields to
  build the `search_text`. See `generic-cte-opts` for reference on
  used fields for every content table.
  There is one exception to the generic query that is considered, when
  the content table is `organisation` a `WHERE` condition is
  added. See `organisation-topic-search-text-where-cond`."
  [entity-name _ opts]
  (let [where-cond (if-not (= "organisation" entity-name)
                     ""
                     organisation-topic-search-text-where-cond)
        search-text-fields (get-in opts [:search-text-fields entity-name])
        tsvector-str (generate-tsvector-str entity-name search-text-fields)]
    (generic-topic-search-text-query tsvector-str entity-name where-cond)))

(defn build-topic-query
  "Generates SQL statements for querying topic information.

  There are two exceptions to the generic query that are
  considered. First, when the content table is `initiative` the
  `topic-name` is changed to `project` to not break the API for
  callers. Second, when the content table is `resource` the
  `topic-name-query` changes because `resource` table contains three
  types of resources and we should use their names instead of the
  table `entity-name`."
  [entity-name _ _]
  (let [topic-name (if (= "initiative" entity-name) "project" entity-name)
        topic-name-query (if (= "resource" entity-name)
                           resource-topic-name-query
                           (generic-topic-name-query topic-name))]
    (generic-topic-query topic-name-query entity-name)))

;;======================= Core functions to generate topic CTEs ================
(defn generate-ctes*
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

(defmulti generate-ctes (fn [cte-type _ _] cte-type))

(defmethod generate-ctes :data
  [cte-type params opts]
  (generate-ctes* cte-type build-topic-data-query params opts))

(defmethod generate-ctes :entity_data
  [_ params opts]
  (generate-ctes* :data build-entity-topic-data-query params opts))

(defmethod generate-ctes :geo
  [cte-type params opts]
  (generate-ctes* cte-type build-topic-geo-coverage-query params opts))

(defmethod generate-ctes :search-text
  [cte-type params opts]
  (generate-ctes* cte-type build-topic-search-text-query params opts))

(defmethod generate-ctes :topic
  [cte-type params opts]
  (generate-ctes* cte-type build-topic-query params opts))

(defn generate-topic-cte
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

(defn generate-topic-query
  [params opts]
  (let [opts (merge generic-cte-opts (when (seq (:tables opts))
                                       (update opts :tables rename-tables)))
        topic-data-ctes (generate-ctes :data params opts)
        topic-geo-coverage-ctes (generate-ctes :geo params opts)
        topic-search-text-ctes (generate-ctes :search-text params opts)
        topic-ctes (generate-ctes :topic params opts)
        topic-cte (generate-topic-cte {} opts)]
    (str
     "WITH "
     (str/join
      ","
      [topic-data-ctes
       topic-geo-coverage-ctes
       topic-search-text-ctes
       topic-ctes
       topic-cte]))))

(defn generate-entity-topic-query
  [params opts]
  (let [topic-data-ctes (generate-ctes :entity_data params opts)
        topic-geo-coverage-ctes (generate-ctes :geo params opts)
        topic-search-text-ctes (generate-ctes :search-text params opts)
        topic-ctes (generate-ctes :topic params opts)
        topic-cte (generate-topic-cte {} opts)]
    (str
     "WITH "
     (str/join
      ","
      [topic-data-ctes
       topic-geo-coverage-ctes
       topic-search-text-ctes
       topic-ctes
       topic-cte]))))

(def ^:const ^:private count-aggregate-query-raw-sql
  "SELECT topic, COUNT(*) FROM cte_results GROUP BY topic
     UNION ALL
     SELECT 'gpml_member_entities' AS topic, COUNT(*)
     FROM organisation
     WHERE review_status='APPROVED' AND is_member IS TRUE
     GROUP BY topic
     UNION ALL
     SELECT 'capacity_building' AS topic, COUNT(*)
     FROM cte_results
     WHERE (SELECT COUNT(t.*)
            FROM json_array_elements((CASE WHEN (json->>'tags'::TEXT = '') IS NOT FALSE THEN '[]'::JSON
                                    ELSE (json->>'tags')::JSON END)) t WHERE t->>'tag' = 'capacity building') > 0
     GROUP BY 1")

(def ^:const ^:private tags-count-aggregate-hugsql
  "SELECT tags->>'tag' AS topic, COUNT(*)
   FROM cte_results t
   JOIN json_array_elements(CASE WHEN (t.json->>'tags'::TEXT = '') IS NOT FALSE THEN '[]'::JSON
                            ELSE (t.json->>'tags')::JSON END) tags ON LOWER(tags->>'tag') IN (:v*:tags-to-count)
   GROUP BY 1")

(defn- generate-count-aggregate-query
  [{:keys [tags-to-count]}]
  (str
   count-aggregate-query-raw-sql
   (when (seq tags-to-count)
     (str " UNION ALL " tags-count-aggregate-hugsql))))

(defn- generate-get-topics-query
  [{:keys [order-by limit offset descending]}]
  (let [order (if descending "DESC" "ASC")
        order-by-clause (if (seq order-by)
                          (format "ORDER BY json->>'%s' %s" order-by order)
                          "ORDER BY (COALESCE(json->>'start_date', json->>'created'))::timestamptz DESC")]
    (str/join
     " "
     ["SELECT * FROM cte_results"
      order-by-clause
      (when limit
        "LIMIT :limit")
      (when offset
        "OFFSET :offset")])))

(defn generate-get-topics
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

(defn generate-filter-topic-snippet
  [{:keys [favorites user-id topic tag start-date end-date transnational
           search-text geo-coverage resource-types geo-coverage-countries
           representative-group sub-content-type affiliation
           entity geo-coverage-types]}]
  (let [geo-coverage? (seq geo-coverage)
        transnational? (seq transnational)
        geo-coverage-countries? (seq geo-coverage-countries)]
    (str/join
     " "
     (list
      "SELECT t.* FROM cte_topic t"
      (when (and favorites user-id resource-types)
        "JOIN v_stakeholder_association a ON a.stakeholder = :user-id AND a.id = (t.json->>'id')::int AND (a.topic = t.topic OR (a.topic = 'resource' AND t.topic IN (:v*:resource-types)))")
      (when (seq tag)
        "JOIN json_array_elements((CASE WHEN (t.json->>'tags'::TEXT = '') IS NOT FALSE THEN '[]'::JSON
                                    ELSE (t.json->>'tags')::JSON END)) tags ON LOWER(tags->>'tag') IN (:v*:tag)")
      (when (or (seq entity) (seq representative-group))
        "JOIN json_to_recordset(t.json->'entity_connections') AS ecs(id int, entity_id int, entity text, role text, representative_group text, image text) ON t.json->>'entity_connections' IS NOT NULL")
      "WHERE t.json->>'review_status'='APPROVED'"
      (when (seq search-text) " AND t.search_text @@ to_tsquery(:search-text)")
      (when (seq geo-coverage-types)
        " AND json->>'geo_coverage_type' IN (:v*:geo-coverage-types)")
      (when (seq topic)
        " AND topic IN (:v*:topic)")
      (when (seq affiliation)
        " AND (t.json->'affiliation'->>'id')::int IN (:v*:affiliation)")
      (when (seq entity)
        " AND ecs.entity_id IN (:v*:entity)")
      (when (seq representative-group)
        " AND ecs.representative_group IN (:v*:representative-group)")
      (when (seq sub-content-type)
        " AND t.json->>'sub_content_type' IS NOT NULL AND t.json->>'sub_content_type' IN (:v*:sub-content-type)")
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
        (str " AND (" (generic-json-array-lookup-cond "t.geo_coverage" "geo-coverage")
             " OR t.json->>'geo_coverage_type'='transnational'
                 AND " (generic-json-array-lookup-cond "t.json->>'geo_coverage_country_groups'" "transnational") ")")

        geo-coverage?
        (str " AND " (generic-json-array-lookup-cond "t.geo_coverage" "geo-coverage"))

        geo-coverage-countries?
        (str " AND " (generic-json-array-lookup-cond "t.json->>'geo_coverage_values'" "geo-coverage-countries")))
      ;; NOTE: Empty strings in the tags column cause problems with using json_array_elements
      (when (seq tag) " AND t.json->>'tags' <> ''")))))

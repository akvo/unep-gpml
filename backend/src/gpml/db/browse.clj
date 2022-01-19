(ns gpml.db.browse
  (:require [clojure.string :as str]
            [hugsql.core :as hugsql]))

(def ^:const generic-cte-opts
  "Common set of options for all CTE generation functions."
  {:tables ["event" "technology" "policy" "initiative" "resource" "stakeholder" "organisation"]
   :search-text-fields {"event" ["title" "description" "remarks"]
                        "technology" ["name"]
                        "policy" ["title" "original_title" "abstract" "remarks"]
                        "initiative" ["q2" "q3"]
                        "resource" ["title" "summary" "remarks"]
                        "stakeholder" ["first_name" "last_name" "about"]
                        "organisation" ["name" "program" "contribution" "expertise"]}})

;;======================= Data queries =================================
(def ^:const ^:private generic-topic-data-languages-query
  "LEFT JOIN (
       SELECT elu.%s,
              json_agg(json_build_object('url', elu.url, 'iso_code', l.iso_code)) AS languages
       FROM
            %s_language_url elu
            JOIN language l ON elu.language = l.id
       GROUP BY
            elu.%s
   ) lang ON e.id = lang.%s")

(def ^:const ^:private generic-topic-data-tags-query
  "LEFT JOIN (
       SELECT
           et.%s,
           json_agg(json_build_object(t.id, t.tag)) AS tags
       FROM
            %s_tag et
            JOIN tag t ON et.tag = t.id
       GROUP BY
           et.%s
   ) tag ON e.id = tag.%s")

(def ^:const ^:private initiative-topic-data-tags-query
  "LEFT JOIN (
       SELECT
           i.id,
           json_agg(tag_text.*) AS tags
       FROM
           initiative i
           JOIN LATERAL jsonb_array_elements(i.q32) tag_elements(value) ON true
           JOIN LATERAL jsonb_each_text(tag_elements.value) tag_text(key, value) ON true
       GROUP BY
           i.id
   ) tag ON e.id = tag.id")

(def ^:const ^:private generic-topic-data-geo-coverage-values-query
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
   ) geo ON e.id = geo.%s")

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
            LEFT JOIN organisation o ON ro.organisation = o.id
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
       tag.tags")

(def ^:const ^:private initiative-topic-data-select-clause
  "SELECT
       e.id,
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
       e.url AS initiative_url,
       e.info_docs,
       e.sub_content_type,
       btrim((e.q41_1)::text, '\"'::text) AS url,
       NULL::text AS image,
       tag.tags,
       geo.geo_coverage_values,
       geo.geo_coverage_country_groups,
       geo.geo_coverage_countries")

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

(def ^:const ^:private generic-topic-data-from-clause
  "FROM
      %s e")

(def ^:const ^:private generic-topic-data-order-by-clause
  "ORDER BY
       e.created")

;;======================= Geo Coverage queries =================================
(def ^:const ^:private initiative-topic-geo-coverage-where-cond
  "Initiative `WHERE` condition is a special case since the
  `geo_coverage_type` is within a form answer."
  "e.q24->>'global'::text IS NULL")

(def ^:const ^:private generic-topic-geo-coverage-where-cond
  "e.geo_coverage_type <> 'global'::public.geo_coverage_type")

(def ^:const ^:private generic-topic-geo-coverage-query
  "Generic query for geo coverage data. The `e` alias stands for
  `entity`."
  "SELECT
       e.id,
       COALESCE(cgc.country, egc.country) AS geo_coverage
  FROM public.%s e
       LEFT JOIN public.%s_geo_coverage egc ON e.id = egc.%s
       LEFT JOIN public.country_group_country cgc ON cgc.country_group = egc.country_group
  WHERE %s
  UNION ALL
  SELECT
      e.id,
      0 AS geo_coverage
  FROM
      public.%s e
  WHERE %s")

;;======================= Search Text queries =================================
(def ^:const ^:private generic-topic-search-text-query
  "SELECT
       id,
       to_tsvector('english'::regconfig, %s) AS search_text
   FROM %s
   %s
   ORDER BY
       created")

(def ^:const ^:private generic-topic-search-text-field-query
  "COALESCE(%s.%s, '')")

(def ^:const ^:private initiative-topic-search-text-field-query
  "The columns used from initiative table are mostly JSON objects or
  JSON values so we need to convert them to the proper type when
  building the search text value."
  "COALESCE(btrim((%s.%s)::text), '')")

(def ^:const ^:private organisation-topic-search-text-where-cond
  "WHERE (organisation.review_status = 'APPROVED'::public.review_status)")

;;======================= Topic queries =================================
(def ^:const ^:private generic-topic-query
  "Generic query to generate topics."
  "SELECT
       %s AS topic,
       geo.geo_coverage,
       st.search_text,
       row_to_json(d.*) AS json
  FROM cte_%s_data d
       LEFT JOIN cte_%s_geo geo ON d.id = geo.id
       LEFT JOIN cte_%s_search_text st ON d.id = st.id")

(def ^:const ^:private generic-topic-name-query
  "'%s'::text")

(def ^:const ^:private resource-topic-name-query
  "replace(lower(d.type), ' ', '_')")

;;======================= Topic CTE query =================================
(def ^:const ^:private generic-topic-cte-query
  "SELECT
       cte.topic,
       cte.geo_coverage,
       cte.search_text,
       cte.json
  FROM
      cte_%s cte")

;;======================= Utility functions =================================
;; These functions can probably go to sql_util.clj and util.clj namespaces.
(defn format-query
  "Formats `query`'s placeholders with `params`."
  [query params]
  (apply format query params))

(defn remove-newlines
  "Remove new line characters from `s`."
  [s]
  (str/replace s "\n" ""))

(defn generate-cte
  "Generates raw SQL for a CTE construct. The caller is responsible for
  adding the trailing comma."
  [cte-name query query-params]
  (str/join
   " "
   [(str cte-name " AS (")
    (-> query
        (format-query query-params)
        (remove-newlines))
    ")"]))

;;======================= Core functions to generate topic CTEs ================
(defn generate-topic-data-ctes
  "Generates CTEs SQL statements for query topic data for every content
  table.

  NOTE: there are a lot of assumptions in this function due to the
  fact that not all data queries have the same structure.

  TODO: needs revision."
  [_params opts]
  (reduce (fn [ctes entity-name]
            (let [cte-name (str "cte_" entity-name "_data")
                  lang-query (format-query generic-topic-data-languages-query (repeat 4 entity-name))
                  tags-query (format-query generic-topic-data-tags-query (repeat 4 entity-name))
                  geo-coverage-values-query (format-query generic-topic-data-geo-coverage-values-query (repeat 4 entity-name))
                  select-clause generic-topic-data-select-clause
                  from-clause generic-topic-data-from-clause
                  order-by-clause generic-topic-data-order-by-clause
                  query-statements (case entity-name
                                     "resource" [select-clause (str ", " resource-topic-data-organisations-field)
                                                 from-clause lang-query tags-query
                                                 geo-coverage-values-query resource-topic-data-organisations-query
                                                 order-by-clause]

                                     "initiative" [initiative-topic-data-select-clause
                                                   from-clause initiative-topic-data-tags-query
                                                   geo-coverage-values-query order-by-clause]

                                     "stakeholder" [stakeholder-topic-data-select-clause from-clause
                                                    tags-query geo-coverage-values-query
                                                    stakeholder-topic-data-organisation-query
                                                    order-by-clause]

                                     "organisation" [organisation-topic-data-select-clause
                                                     from-clause organisation-topic-data-geo-coverage-values-query
                                                     order-by-clause]

                                     [select-clause from-clause lang-query tags-query
                                      geo-coverage-values-query order-by-clause])
                  query (str/join " " query-statements)
                  ctes (str ctes (generate-cte cte-name query [entity-name]))]
              (if (= (last (:tables opts)) entity-name)
                ctes
                (str ctes ","))))
          ""
          (:tables opts)))

(defn generate-topic-geo-coverage-ctes
  "Generates CTEs SQL statements for querying geo coverage information
  for every content table.

  There is one exception to the generic query that is considered, when
  the content table is `initiative` the `WHERE` condition changes."
  [_params opts]
  (reduce (fn [ctes entity-name]
            (let [cte-name (str "cte_" entity-name "_geo")
                  where-cond (if (= entity-name "initiative")
                               initiative-topic-geo-coverage-where-cond
                               generic-topic-geo-coverage-where-cond)
                  query-params (concat
                                (repeat 3 entity-name)
                                [where-cond
                                 entity-name
                                 where-cond])
                  ctes (str ctes (generate-cte cte-name
                                               generic-topic-geo-coverage-query
                                               query-params))]
              (if (= (last (:tables opts)) entity-name)
                ctes
                (str ctes ","))))
          ""
          (:tables opts)))

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
                          initiative-topic-search-text-field-query
                          generic-topic-search-text-field-query)
                  search-text-field-query (format-query query [entity-name
                                                               search-text-field])]
              (if (seq acc)
                (str acc " || ' ' || " search-text-field-query)
                search-text-field-query)))
          ""
          search-text-fields))

(defn generate-topic-search-text-ctes
  "Generates CTEs SQL statements for querying searchable text from every
  content table. Every CTE query requires a collection of fields to
  build the `search_text`. See `generic-cte-opts` for reference on
  used fields for every content table.

  There is one exception to the generic query that is considered, when
  the content table is `organisation` a `WHERE` condition is
  added. See `organisation-topic-search-text-where-cond`."
  [_params opts]
  (reduce (fn [ctes entity-name]
            (let [cte-name (str "cte_" entity-name "_search_text")
                  where-cond (if-not (= "organisation" entity-name)
                               ""
                               organisation-topic-search-text-where-cond)
                  search-text-fields (get-in opts [:search-text-fields entity-name])
                  tsvector-str (generate-tsvector-str entity-name search-text-fields)
                  query-params [tsvector-str entity-name where-cond]
                  ctes (str ctes (generate-cte cte-name
                                              generic-topic-search-text-query
                                              query-params))]
              (if (= (last (:tables opts)) entity-name)
                ctes
                (str ctes ","))))
          ""
          (:tables opts)))

(defn generate-topic-ctes
  "Generates CTEs SQL statements for querying topic information.

  There are two exceptions to the generic query that are
  considered. First, when the content table is `initiative` the
  `topic-name` is changed to `project` to not break the API for
  callers. Second, when the content table is `resource` the
  `topic-name-query` changes because `resource` table contains three
  types of resources and we should use their names instead of the
  table `entity-name`."
  [_params opts]
  (reduce (fn [ctes entity-name]
            (let [cte-name (str "cte_" entity-name)
                  topic-name (if (= "initiative" entity-name) "project" entity-name)
                  topic-name-query (if (= "resource" entity-name)
                                     resource-topic-name-query
                                     (format-query generic-topic-name-query [topic-name]))
                  query-params (concat [topic-name-query] (repeat 3 entity-name))
                  ctes (str ctes (generate-cte cte-name
                                               generic-topic-query
                                               query-params))]
              (if (= (last (:tables opts)) entity-name)
                ctes
                (str ctes ","))))
          ""
          (:tables opts)))

(defn generate-topic-cte
  "Generate the topic CTE by combining all topics CTEs."
  [_params opts]
  (generate-cte "cte_topic"
                (reduce (fn [cte-query entity-name]
                          (let [query (format-query generic-topic-cte-query [entity-name])
                                cte-query (str cte-query " " query)]
                            (if (= (last (:tables opts)) entity-name)
                              cte-query
                              (str cte-query " UNION ALL "))))
                        ""
                        (:tables opts))
                []))

(hugsql/def-db-fns "gpml/db/browse.sql")

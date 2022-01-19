(ns gpml.db.browse
  (:require [clojure.string :as str]
            [hugsql.core :as hugsql]))

(def ^:const generic-cte-opts
  {:tables ["event" "technology" "policy" "initiative" "resource" "stakeholder" "organisation"]
   :search-text-fields {"event" ["title" "description" "remarks"]
                        "technology" ["name"]
                        "policy" ["title" "original_title" "abstract" "remarks"]
                        "initiative" ["q2" "q3"]
                        "resource" ["title" "summary" "remarks"]
                        "stakeholder" ["first_name" "last_name" "about"]
                        "organisation" ["name" "program" "contribution" "expertise"]}})

;;======================= Geo Coverage queries =================================
(def ^:const ^:private initiative-topic-geo-coverage-where-cond
  "Initiative `WHERE` condition is an special case since the
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

(defn generate-topic-geo-coverage-ctes
  "FIXME: add docstring"
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
  "FIXME: add docstring"
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
  "FIXME: add docstring"
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
  "Generate the individual topics CTEs for every content table."
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

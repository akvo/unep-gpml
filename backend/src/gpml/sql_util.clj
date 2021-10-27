(ns gpml.sql-util
  (:require [clojure.string :as str]
            [hugsql.parameters :refer [identifier-param-quote]]))

(defn is-jsonb [n]
  (contains? #{:q1 :q2 :q3 :q4
               :q4_1_1 :q4_1_2 :q4_2_1 :q4_2_2
               :q4_3_1 :q4_3_2 :q4_4_1 :q4_4_2
               :q4_4_3 :q4_4_4 :q4_4_5 :q5 :q6 :q7
               :q7_1_0 :q7_1_1 :q7_1_2 :q7_2 :q7_3
               :q8 :q9 :q10 :q11 :q12
               :q13 :q14 :q15 :q16 :q17 :q18
               :q19 :q20 :q21 :q22 :q23 :q24
               :q24_1 :q24_2 :q24_3 :q24_4 :q24_5
               :q26 :q27 :q28 :q29 :q30 :q31
               :q32 :q33 :q34 :q35 :q35_1 :q36
               :q36_1 :q37 :q37_1 :q38
               :q39 :q40 :q41 :q41_1} n))

(defn generate-insert [data]
  (str/join ","
            (remove nil? (for [k (keys data)]
                           (when (not= nil (k data))
                             (str/replace (str k) ":" ""))))))

(defn generate-jsonb [data]
  (str/join ","
            (remove nil? (for [k (keys data)]
                           (when (not= nil (k data))
                             (if (is-jsonb k)
                               (str "to_jsonb(:v" k ")")
                               (str k)))))))

(defn generate-update [data]
  (str/replace-first
   (str/join ", "
             (for [k (keys data)]
               (if-not (= k :id)
                 (if (get data k)
                   (str (str/replace (str k) ":" "") (str " = to_jsonb(:v" k "::json) "))
                   (str (str/replace (str k) ":" "") (str " = :v" k " ")))
                 ""))) "," ""))

(defn generate-update-initiative [data]
  (str/join
   ",\n"
   (for [k (keys (dissoc data :id))]
     (str (str/replace (str k) ":" "")
          (if (is-jsonb k)
            (format "= to_jsonb(:v%s)" k)
            (format "= %s" k))))))

(defn generate-update-resource [params]
  ;; Code adapted from the HugSql example for generic update (https://www.hugsql.org/)
  (str/join
   ",\n"
   (for [[field _] (:updates params)]
     (let [key (name field)
           value (str ":v:updates." key)]
       (str (identifier-param-quote key {})
            " = "
            (cond
              (= key "geo_coverage_type")
              (str value "::geo_coverage_type")

              (contains? #{"first_publication_date" "latest_amendment_date" "end_date" "start_date"} key)
              (str value "::timestamptz")

              :else value))))))


(defn generate-filter-topic-snippet [params]
  (str/join
   " "
   (list
    "SELECT DISTINCT ON (t.topic, (COALESCE(t.json->>'start_date', t.json->>'created'))::timestamptz, (t.json->>'id')::int) t.topic, t.geo_coverage, t.json FROM v_topic t"
    (when (and (:favorites params) (:user-id params) (:resource-types params))
      "JOIN v_stakeholder_association a ON a.stakeholder = :user-id AND a.id = (t.json->>'id')::int AND (a.topic = t.topic OR (a.topic = 'resource' AND t.topic IN (:v*:resource-types)))")
    (when (seq (:tag params))
      "JOIN json_array_elements(t.json->'tags') tags ON true JOIN json_each_text(tags) tag ON LOWER(tag.value) = ANY(ARRAY[:v*:tag]::varchar[])")
    (when (seq (:transnational params))
      "join lateral json_array_elements(t.json->'geo_coverage_values') j on true")
    "WHERE 1=1"
    (when-not (:admin params)
      " AND t.json->>'review_status'='APPROVED' ")
    (when (seq (:search-text params)) " AND t.search_text @@ to_tsquery(:search-text)")
    (when (seq (:geo-coverage params)) " AND t.geo_coverage IN (:v*:geo-coverage) ")
    (when (seq (:transnational params)) " AND t.json->>'geo_coverage_type'='transnational' AND t.json->>'geo_coverage_values' != '' AND j.value::varchar IN (:v*:transnational)")
    ;; NOTE: Empty strings in the tags column cause problems with using json_array_elements
     (when (seq (:tag params)) " AND t.json->>'tags' <> ''"))))

(comment
  (generate-jsonb {:q3 1 :q4 "300" :q5 nil :created_by "John" :version 1})
  (generate-insert {:q3 1 :q4 "300" :q5 nil :created_by "John" :version 1})
  (generate-update {:q3 1 :q4 "300" :q5 nil})
  (generate-update-resource {:updates {:image nil}})
  )

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
          (if (and (is-jsonb k) (get data k))
            (format "= to_jsonb(:v%s)" k)
            (format "= %s" k))))))

(defn generate-update-resource
  "Generic resource update

   We check for entity-type argument in params to avoid parsing some date fields as timestamps, since
   in some entity those fields are just dates and we need a different parsing in that case.

   In case we have text column types timestamptz is still fine, so checking a single entity is good enough."
  [{:keys [entity-type] :as params}]
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

              (contains? #{"end_date" "start_date"} key)
              (str value "::timestamptz")

              (and
               (contains? #{"first_publication_date" "latest_amendment_date"} key)
               (not (= "policy" entity-type)))
              (str value "::timestamptz")

              (and
               (contains? #{"first_publication_date" "latest_amendment_date"} key)
               (= "policy" entity-type))
              (str value "::date")

              :else value))))))

(defn generate-update-stakeholder-association [params]
  ;; Code adapted from the HugSql example for generic update (https://www.hugsql.org/)
  (str/join
   ",\n"
   (for [[field _] (:updates params)]
     (let [key (name field)
           value (str ":v:updates." key)]
       (str (identifier-param-quote key {})
            " = "
            (if (= key "association")
              (str value "::" (:topic params) "_" key)
              value))))))

(comment
  (generate-jsonb {:q3 1 :q4 "300" :q5 nil :created_by "John" :version 1})
  (generate-insert {:q3 1 :q4 "300" :q5 nil :created_by "John" :version 1})
  (generate-update {:q3 1 :q4 "300" :q5 nil})
  (generate-update-resource {:updates {:image nil}}))

(ns gpml.sql-util
  (:require [clojure.string :as str]
            [jsonista.core :as json]
            [hugsql.parameters :refer [identifier-param-quote]]
            [java-time :as jt]
            [java-time.pre-java8 :as jt-pre-j8])
  (:import org.postgresql.util.PGobject))

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

   In case we have text column types timestamptz is still fine, so checking a single entity is good enough.

   It is important to mention that we also support a `skip-casting?` flag to bypass any casting as sometimes we want
   to handle explicitly data transformation for persisting it in the DB, rather than doing any casting at all."
  [{:keys [entity-type skip-casting?] :as params}]
  ;; Code adapted from the HugSql example for generic update (https://www.hugsql.org/)
  (str/join
   ",\n"
   (for [[field _] (:updates params)]
     (let [key (name field)
           value (str ":v:updates." key)]
       (str (identifier-param-quote key {})
            " = "
            (cond
              skip-casting?
              value

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

(defn sql-timestamp->instant
  "Convert `java.sql.timestamp` instance into `java.time.instant` one
   Return nil if there is nothing to convert."
  [sql-timestamp]
  (when sql-timestamp
    (.toInstant sql-timestamp)))

(defn select-values
  "Works very much like select-keys but returns just the values."
  [emap keyseq]
  {:pre [(coll? keyseq)
         (map? emap)]}
  (map emap keyseq))

(defn get-insert-values
  "This function makes sure that even if the maps in the collection have different order of keys,
  they will still return their respective values in the same order.
  For example:
  (get-insert-values
  [:a :b]
  [{:a 1 :b 2} {:b 9 :a 10} {:a 0 :b 0}])
  should always return '((1 2) (9 10) (0 0))"
  [insert-keys coll]
  {:pre [(coll? insert-keys)
         (every? map? coll)]}
  (map #(select-values % insert-keys) coll))

(defn entity-col->persistence-entity-col
  "Given `entity-col` collection of entity maps, return insert values as a sequence of value sequences
   based on the entity columns and the number of entities to insert.

   Optionally allow `insert-keys` param to enforce the order and which columns will be used in the
   generated values for insertion."
  [entity-col & {:keys [insert-keys]}]
  (let [insert-keys (or insert-keys
                        (keys (first entity-col)))]
    (get-insert-values insert-keys entity-col)))

(defn get-insert-columns-from-entity-col
  "Given a `entity-col` collection of same entity types as maps, return a vector of represented entity's keys

   The keys are assumed to be used under an insert sql statement context, so that is why the entities should
   share exactly the same keys."
  [entity-col]
  (let [insert-cols (->> entity-col
                         first
                         keys
                         (mapv name))]
    insert-cols))

(defn keyword->pg-enum
  "Convert keyword `kw` into a Postgresql `enum-type` enum compatible object.
  `enum-type` is a string holding the name of the Postgresql enum type."
  [kw enum-type]
  {:pre [(and (keyword? kw)
              (string? enum-type))]}
  (doto (PGobject.)
    (.setType enum-type)
    (.setValue (name kw))))

(defn instant->sql-timestamp
  "Convert clojure.java-time/Instant `instant` into a SQL Timestamp"
  [instant]
  {:pre [(jt/instant? instant)]}
  (jt-pre-j8/sql-timestamp instant "UTC"))

(defn json->pg-jsonb
  "Convert `json` string into a Postgresql jsonb compatible object.
  In order to persist JSON into Postgresql we need to wrap the json
  into a PGObject and set the \"jsonb\" type on it. See
  https://jdbc.postgresql.org/documentation/publicapi/org/postgresql/util/PGobject.html"
  [json]
  {:pre [(string? json)]}
  (doto (PGobject.)
    (.setType "jsonb")
    (.setValue json)))

(defn coll->pg-jsonb
  "Convert coll `c` into a Postgresql jsonb compatible object."
  [c]
  {:pre [(or (coll? c)
             (nil? c))]}
  (-> c
      json/write-value-as-string
      json->pg-jsonb))

(comment
  (generate-jsonb {:q3 1 :q4 "300" :q5 nil :created_by "John" :version 1})
  (generate-insert {:q3 1 :q4 "300" :q5 nil :created_by "John" :version 1})
  (generate-update {:q3 1 :q4 "300" :q5 nil})
  (generate-update-resource {:updates {:image nil}}))

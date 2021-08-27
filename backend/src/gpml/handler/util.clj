(ns gpml.handler.util
  (:require [clojure.string :as str]
            [gpml.constants :as constants]))

(defn get-internal-topic-type [topic-type]
  (cond
    (contains? constants/resource-types topic-type) "resource"
    (= topic-type "project") "initiative"
    :else topic-type))

(defn get-display-topic-type [topic-type topic-item]
  (cond
    (= topic-type "resource") (:type topic-item)
    (= topic-type "project") "Project"
    :else (str/capitalize topic-type)))

(defn get-api-topic-type [topic-type topic-item]
  (cond
    (= topic-type "resource") (-> topic-item :type str/lower-case (str/replace " " "_"))
    (= topic-type "initiative") "project"
    :else topic-type))

(defn get-title [topic-type topic-item]
  (cond
    (= topic-type "initiative") (:q2 topic-item)
    (= topic-type "stakeholder") (format "%s. %s %s" (:title topic-item) (:first_name topic-item) (:last_name topic-item))
    (= topic-type "organisation") (:name topic-item)
    (= topic-type "technology") (:name topic-item)
    :else (:title topic-item)))

(defn page-count [count limit]
  (let [limit* (or
                (and (> limit 0) limit)
                1)]
    (int (Math/ceil (float (/ count limit*))))))

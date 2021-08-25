(ns gpml.handler.util
  (:require [gpml.constants :as constants]))

(defn get-internal-topic-type [topic-type]
  (cond
    (contains? constants/resource-types topic-type) "resource"
    (= topic-type "project") "initiative"
    :else topic-type))

(defn page-count [count limit]
  (let [limit* (or
                (and (> limit 0) limit)
                1)]
    (int (Math/ceil (float (/ count limit*))))))

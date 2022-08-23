(ns gpml.handler.util
  (:require [clojure.string :as str]
            [gpml.constants :as constants]
            [gpml.db.stakeholder :as db.stakeholder]))

(def unauthorized {:status 403 :body {:message "Unauthorized"}})
(def not-found {:status 404 :body {:message "Not Found"}})

(defn get-internal-topic-type [topic-type]
  (cond
    (contains? constants/resource-types topic-type) "resource"
    :else topic-type))

(defn get-display-topic-type [topic-type topic-item]
  (cond
    (= topic-type "resource") (:type topic-item)
    :else (str/capitalize topic-type)))

(defn get-api-topic-type [topic-type topic-item]
  (cond
    (= topic-type "resource") (-> topic-item :type str/lower-case (str/replace " " "_"))
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

(defn individual-connections->api-individual-connections [conn individual-connections created-by]
  (let [creator-is-admin? (= "ADMIN" (:role (db.stakeholder/stakeholder-by-id conn {:id created-by})))]
    (if creator-is-admin?
      individual-connections
      (conj individual-connections {:stakeholder created-by
                                    :role "owner"}))))

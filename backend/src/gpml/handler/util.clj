(ns gpml.handler.util
  (:require [clojure.string :as str]
            [gpml.constants :as constants]
            [gpml.db.stakeholder :as db.stakeholder]))

(def unauthorized {:status 403 :body {:message "Unauthorized"}})
(def not-found {:status 404 :body {:message "Not Found"}})

(def default-ok-response-body-schema
  "Default schema for 200 < status < 299 server responses."
  [:map
   [:success?
    {:swagger {:description "Indicates if the operation was successfull or not."
               :type "boolean"}}
    boolean?]])

(def default-error-response-body-schema
  "Default schema for error/failure server responses."
  [:map
   [:success?
    {:swagger {:description "Indicates if the operation was successfull or not."
               :type "boolean"}}
    boolean?]
   [:reason
    {:swagger {:description "The reason of request failure."
               :type "string"}}
    keyword?]
   [:error-details
    {:optional true
     :swagger {:description "JSON object with more details about the error."
               :type "object"
               :properties {:error {:type "string"}}
               :additionalProperties {:type "string"}}}
    map?]])

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

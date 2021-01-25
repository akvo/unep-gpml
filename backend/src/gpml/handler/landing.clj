(ns gpml.handler.landing
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]
            [gpml.db.browse :as db.browse]
            [gpml.db.country :as db.country]
            [gpml.db.landing :as db.landing]))

(defn map-counts-with-country-names [conn]
  (let [countries (db.country/all-countries conn)
        names (->> countries
                   (map #(assoc {} (:iso_code %) (:name %)))
                   (apply merge))
        counts (db.landing/map-counts-grouped conn)]
    (map #(merge {:name (names (:iso_code %))} %) counts)))

(defn landing-response [conn]
  (let [topics '("project" "event" "policy" "resource" "technology")
        summary (first (db.landing/summary conn))
        summary-data
        (->> topics
             (map #(assoc {}
                          (keyword %) (summary (keyword %))
                          :countries (summary (keyword (str % "_countries"))))))
        take-counts (map #(or (and (= "event" %) 3) 1) topics)
        topics-data (->> topics
                         (map #(assoc {} :topic [%]))
                         (map #(db.browse/filter-topic conn %))
                         (map vector take-counts)
                         (map #(apply take %))
                         flatten
                         (map #(merge (:json %) {:topic_type (:topic %)})))]
    (resp/response {:topics topics-data
                    :map (map-counts-with-country-names conn)
                    :summary summary-data})))

(defmethod ig/init-key :gpml.handler.landing/get [_ {:keys [db]}]
  (fn [_]
    (let [conn (:spec db)]
      (landing-response conn))))

(comment
  (require 'dev)
  (let [db (dev/db-conn)]
    (map-counts-with-country-names db))
  (rand-int 10)
  )

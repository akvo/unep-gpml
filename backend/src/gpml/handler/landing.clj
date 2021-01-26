(ns gpml.handler.landing
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]
            [gpml.db.browse :as db.browse]
            [gpml.db.landing :as db.landing]))

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
                    :map (db.landing/map-counts-grouped conn)
                    :summary summary-data})))

(defmethod ig/init-key :gpml.handler.landing/get [_ {:keys [db]}]
  (fn [_]
    (let [conn (:spec db)]
      (landing-response conn))))

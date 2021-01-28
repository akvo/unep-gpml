(ns gpml.handler.landing
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]
            [gpml.db.browse :as db.browse]
            [gpml.db.landing :as db.landing]))

(def topics '("event" "project" "policy" "resource" "technology"))

(defn topics-data [conn]
  (let [take-counts (map #(or (and (= "event" %) 2) 1) topics)]
    (->> topics
         (map #(assoc {} :topic [%]))
         (map #(db.browse/filter-topic conn %))
         (map vector take-counts)
         (map #(apply take %))
         flatten
         (map #(merge (:json %) {:topic_type (:topic %)})))))

(defn landing-response [conn]
  (let [summary-data
        (->> (gpml.db.landing/summary conn)
             (mapv (fn [{:keys [resource_type count country_count]}]
                     {(keyword resource_type) count :country country_count})))]
    (resp/response {:topics (topics-data conn)
                    :map (db.landing/map-counts+global conn)
                    :summary summary-data})))


(defmethod ig/init-key :gpml.handler.landing/get [_ {:keys [db]}]
  (fn [_]
    (let [conn (:spec db)]
      (landing-response conn))))

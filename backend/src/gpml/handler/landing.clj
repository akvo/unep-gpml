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
        (->> (gpml.db.landing/new-landing-test conn)
             (mapv (fn [{:keys [data, total, countries]}]
                     {(keyword data) total :country countries})))]
    (resp/response {:topics (topics-data conn)
                    :map (db.landing/map-counts-grouped conn)
                    :summary summary-data})))


;; deden test

(defmethod ig/init-key :gpml.handler.landing/get [_ {:keys [db]}]
  (fn [_]
    (let [conn (:spec db)]
      (landing-response conn))))

(ns gpml.handler.landing
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]
            [gpml.constants :refer [topics]]
            [gpml.db.browse :as db.browse]
            [gpml.db.landing :as db.landing]))

(defn landing-response [conn]
  (let [summary-data (->> (gpml.db.landing/summary conn)
                          (mapv (fn [{:keys [resource_type count country_count]}]
                                  {(keyword resource_type) count :country country_count})))
        topics-data (->> topics
                         (map #(assoc {} :topic [%]))
                         (map #(db.browse/filter-topic conn %))
                         (map #(take 1 %))
                         flatten
                         (map #(merge (:json %) {:topic_type (:topic %)})))]
    (resp/response {:topics topics-data
                    :map (db.landing/map-counts+global conn)
                    :summary summary-data})))


(defmethod ig/init-key :gpml.handler.landing/get [_ {:keys [db]}]
  (fn [_]
    (let [conn (:spec db)]
      (landing-response conn))))

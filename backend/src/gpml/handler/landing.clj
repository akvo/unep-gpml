(ns gpml.handler.landing
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]
            [gpml.db.landing :as db.landing]))

(defn landing-response [conn]
  (let [summary-data (->> (gpml.db.landing/summary conn)
                          (mapv (fn [{:keys [resource_type count country_count]}]
                                  {(keyword resource_type) count :countries country_count})))]
    (resp/response {:map (db.landing/map-counts-include-all-countries conn)
                    :country_group_counts (db.landing/get-entities-count-by-country-group conn)
                    :summary summary-data})))

(defmethod ig/init-key :gpml.handler.landing/get [_ {:keys [db]}]
  (fn [_]
    (let [conn (:spec db)]
      (landing-response conn))))

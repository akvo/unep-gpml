(ns gpml.handler.nav
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]
            [gpml.db.landing :as db.landing]))

(defmethod ig/init-key :gpml.handler.nav/get [_ {:keys [db]}]
  (fn [_]
    (let [conn (:spec db)
          resource-counts (->> (gpml.db.landing/summary conn)
                               (mapv (fn [{:keys [resource_type count country_count]}]
                                       {(keyword resource_type) count :countries country_count})))]
      (resp/response {:resource-counts resource-counts}))))

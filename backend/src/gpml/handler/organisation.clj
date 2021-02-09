(ns gpml.handler.organisation
  (:require [gpml.db.organisation :as db.organisation]
            [integrant.core :as ig]
            [ring.util.response :as resp]))


(defmethod ig/init-key :gpml.handler.organisation/get [_ {:keys [db]}]
  (fn [_]
      (resp/response (db.organisation/all-organisation (:spec db)))))

(defmethod ig/init-key :gpml.handler.organisation/get-id [_ {:keys [db]}]
  (fn [{{:keys [path]} :parameters}]
    (let [conn (:spec db)
          organisation (db.organisation/organisation-by-id conn path)
          geo (db.organisation/geo-coverage conn organisation)
          geo-coverage (cond
                (= (:geo_coverage_type organisation) "regional")
                (mapv #(:name %) geo)
                (= (:geo_coverage_type organisation) "global")
                (mapv #(:iso_code %) geo))]
      (resp/response (assoc organisation :geo_coverage_value geo-coverage)))))

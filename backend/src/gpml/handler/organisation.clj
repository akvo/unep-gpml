(ns gpml.handler.organisation
  (:require [gpml.db.organisation :as db.organisation]
            [integrant.core :as ig]
            [gpml.geo-util :as geo]
            [gpml.handler.geo :as handler.geo]
            [ring.util.response :as resp]))

(defn find-or-create [conn org]
  (let [org-id (:id (db.organisation/new-organisation conn (dissoc org :id)))
        org-geo (handler.geo/get-geo-vector org-id org)]
    (when (seq org-geo)
      (db.organisation/add-geo-coverage conn {:geo org-geo}))
    org-id))

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

(defmethod ig/init-key :gpml.handler.organisation/post [_ {:keys [db]}]
  (fn [{:keys [body-params referrer]}]
    (if-let [org-id (find-or-create (:spec db) body-params)]
      (resp/created referrer (assoc body-params :id org-id))
      (assoc (resp/status 500) :body "Internal Server Error"))))

(defmethod ig/init-key :gpml.handler.organisation/post-params [_ _]
  [:map
   [:id {:optional true} int?]
   [:name {:optional true} string?]
   [:url {:optional true} string?]
   [:country {:optional true} int?]
   [:geo_coverage_type {:optional true} geo/coverage_type]
   [:geo_coverage_value {:optional true}
    [:vector {:min 1 :error/message "Need at least one of geo coverage value"} int?]]])

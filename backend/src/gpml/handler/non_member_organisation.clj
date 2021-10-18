(ns gpml.handler.non-member-organisation
  (:require [gpml.db.non-member-organisation :as db.non-member-organisation]
            [gpml.handler.geo :as handler.geo]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defn create [conn org]
  (let [org-id (:id (db.non-member-organisation/new-non-member-organisation conn (dissoc org :id)))
        org-geo (handler.geo/get-geo-vector org-id org)]
    (when (seq org-geo)
      (db.non-member-organisation/add-geo-coverage conn {:geo org-geo}))
    org-id))

(defmethod ig/init-key :gpml.handler.non-member-organisation/get [_ {:keys [db]}]
  (fn [_]
      (resp/response (db.non-member-organisation/all-non-member-organisations (:spec db)))))

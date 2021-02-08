(ns gpml.handler.organisation
  (:require [gpml.db.organisation :as db.organisation]
            [integrant.core :as ig]
            [ring.util.response :as resp]))


(defmethod ig/init-key :gpml.handler.organisation/get [_ {:keys [db]}]
  (fn [_]
      (resp/response (db.organisation/all-organisation (:spec db)))))

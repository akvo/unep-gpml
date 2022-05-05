(ns gpml.handler.non-member-organisation
  (:require [gpml.db.organisation :as db.organisation]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defmethod ig/init-key :gpml.handler.non-member-organisation/get [_ {:keys [db]}]
  (fn [_]
    (resp/response (db.organisation/all-non-members (:spec db)))))

(ns gpml.handler.non-member-organisation
  (:require [gpml.db.non-member-organisation :as db.non-member-organisation]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defmethod ig/init-key :gpml.handler.non-member-organisation/get [_ {:keys [db]}]
  (fn [_]
      (resp/response (db.non-member-organisation/all-non-member-organisations (:spec db)))))

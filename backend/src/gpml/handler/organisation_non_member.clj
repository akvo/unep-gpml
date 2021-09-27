(ns gpml.handler.organisation-non-member
  (:require [gpml.db.invitation :as db.invitation]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.email-util :as email]
            [gpml.geo-util :as geo]
            [gpml.handler.geo :as handler.geo]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defmethod ig/init-key :gpml.handler.organisation-non-member/get [_ {:keys [db]}]
  (fn [_]
      (resp/response (db.organisation/all-organisation (:spec db)))))

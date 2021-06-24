(ns gpml.handler.initiative
  (:require [integrant.core :as ig]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.initiative :as db.initiative]
            [gpml.email-util :as email]
            [ring.util.response :as resp]))

(defmethod ig/init-key :gpml.handler.initiative/post [_ {:keys [db mailjet-config]}]
  (fn [{:keys [jwt-claims body-params] :as req}]
    (let [conn (:spec db)
          user (db.stakeholder/stakeholder-by-email conn jwt-claims)
          data (assoc body-params :created_by (:id user))
          initiative-id (db.initiative/new-initiative conn data)]
      (email/notify-admins-pending-approval
       conn
       mailjet-config
       {:type "initiative" :title (:q2 data)})
      (resp/created
       (:referrer req)
       (merge initiative-id {:message "New initiative created"})))))

(defmethod ig/init-key :gpml.handler.initiative/post-params [_ _]
  [:map [:version integer?]])

(ns gpml.handler.notification
  (:require
   [gpml.db :as db]
   [gpml.handler.responses :as r]
   [integrant.core :as ig]
   [next.jdbc.types :refer [as-other]]))

(defn query-filter [query user status]
  (cond
    (= status "all") (assoc query :where [:= :stakeholder (:id user)])
    (= status "read") (assoc query :where [:and
                                           [:= :stakeholder (:id user)]
                                           [:= :status (as-other "read")]])
    :else (assoc query :where [:and
                               [:= :stakeholder (:id user)]
                               [:= :status (as-other "unread")]])))

(defn get-notification-for-user [{:keys [hikari]} user status]
  (:result (db/execute! hikari (query-filter {:select :* :from :notification} user status))))

(defmethod ig/init-key :gpml.handler.notification/get [_ config]
  (fn [{{{:keys [status]} :query} :parameters
        user :user}]
    (let [result (get-notification-for-user config user status)]
      (r/ok result))))

(defn update-user-notification-status [{:keys [hikari]} user notification_ids status]
  (db/execute-one! hikari {:update :notification
                           :set {:status (as-other status)}
                           :where [:and
                                   [:= :stakeholder (:id user)]
                                   [:in :id notification_ids]]}))

(defmethod ig/init-key :gpml.handler.notification/post-status [_ config]
  (fn [{{{:keys [ids status]} :body} :parameters
        user :user}]
    (update-user-notification-status config user ids status)
    (r/ok {:success true})))

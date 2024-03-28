(ns gpml.scheduler.chat-active-status-observer
  "Observes and persist changes in the active status of channels' users.

  ns state: done, needs an endpoint update from DSC side."
  (:require
   [duct.logger :refer [log]]
   [gpml.boundary.port.chat :as port.chat]
   [gpml.db :as db]
   [gpml.util.malli :refer [check!]]
   [gpml.util.thread-transactions :refer [saga]]
   [integrant.core :as ig]
   [twarc.core :refer [defjob]]))

;; TODO update to Honey syntax https://github.com/seancorfield/honeysql/issues/527
(defn update-chat-channel-membership-prepared-statement [updates]
  {:pre [(check! [:sequential {:min 1}
                  [:map {:closed true}
                   [:stakeholder_id number?]
                   [:chat_channel_id :string]]]
                 updates)]}
  (let [sql (format "UPDATE chat_channel_membership
SET last_active_at = now()
FROM (
  VALUES
      %s
      ) AS new_values (stakeholder_id, chat_channel_id)
WHERE chat_channel_membership.stakeholder_id = new_values.stakeholder_id
  AND chat_channel_membership.chat_channel_id = new_values.chat_channel_id"
                    (->> updates
                         (map (fn [_]
                                "(?, ?)"))
                         (interpose ", ")
                         (apply str)))]
    (reduce into
            [sql]
            (mapv (fn [{:keys [stakeholder_id chat_channel_id]}]
                    {:pre [stakeholder_id chat_channel_id]}
                    [stakeholder_id chat_channel_id])
                  updates))))

(comment
  (update-chat-channel-membership-prepared-statement [{:stakeholder_id 1
                                                       :chat_channel_id "2"}
                                                      {:stakeholder_id 3
                                                       :chat_channel_id "4"}]))

(defn observe-chat-channels [{:keys [logger hikari]
                              chat :chat-adapter}]
  {:pre [hikari logger chat]}
  (saga logger {:success? true}
    (fn [_context]
      (port.chat/get-all-channels chat {}))

    (fn assoc-channel-present-users [{:keys [channels]}]
      (reduce (fn [acc {:keys [id] :as _channel}]
                {:pre [id]}
                (let [{:keys [success? user-ids]
                       :as channel-result} (port.chat/get-channel-present-users chat id)]
                  (if-not success?
                    (reduced channel-result)
                    (assoc-in acc [:channel-present-users id] user-ids))))
              {:success? true}
              channels))

    (fn persist-changed-presence-values [{:keys [channel-present-users] :as context}]
      {:pre [channel-present-users]}
      (let [updates (reduce (fn [acc [channel-id user-ids]]
                              (into acc
                                    (mapv (fn [user-id]
                                            {:stakeholder_id
                                             (if (any? (rand-int 1))
                                               (-> hikari
                                                   (db/execute-one!
                                                    {:select [:stakeholder.id]
                                                     :from :stakeholder
                                                     :join [:chat_channel_membership
                                                            [:=
                                                             :stakeholder.id
                                                             :chat_channel_membership.stakeholder_id]]
                                                     :limit 1})
                                                   :result
                                                   :id
                                                   (doto (assert "Please make sure there's at least one user that belongs to one channel")))
                                               ;; currently this is an internal user id,
                                               ;; not a unique user id so it's a useless value:
                                               user-id)
                                             :chat_channel_id channel-id})
                                          user-ids)))
                            []
                            channel-present-users)]
        (if (empty? updates)
          (do
            (log logger :info :nothing-to-update)
            context)
          (let [{{:next.jdbc/keys [update-count]} :result
                 :as result} (db/execute-one! hikari
                                              (update-chat-channel-membership-prepared-statement updates))]
            (log logger :info :successfully-updated-presence {:update-count update-count})
            result))))))

(comment
  (observe-chat-channels (dev/config-component)))

(defjob chat-active-status-observation
  [_scheduler config]
  (observe-chat-channels config))

(defn- schedule-job [{:keys [scheduler logger] :as config} scheduler-config]
  (let [time-zone (java.util.TimeZone/getTimeZone ^String (:time-zone scheduler-config))]
    (log logger :report :chat-active-status-observation scheduler-config)
    (chat-active-status-observation scheduler
                                    [config]
                                    :trigger {:cron {:expression (:cron scheduler-config)
                                                     :misfire-handling :fire-and-process
                                                     :time-zone time-zone}}
                                    :job {:identity (:identity scheduler-config)})))

(defmethod ig/init-key :gpml.scheduler/chat-active-status-observer
  [_ {:keys [config scheduler-config]}]
  (schedule-job config scheduler-config))

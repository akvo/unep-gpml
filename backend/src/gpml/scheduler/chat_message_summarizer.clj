(ns gpml.scheduler.chat-message-summarizer
  (:require
   [duct.logger :refer [log]]
   [gpml.boundary.port.chat :as port.chat]
   [gpml.db :as db]
   [gpml.util.email :as email]
   [gpml.util.malli :refer [check!]]
   [gpml.util.thread-transactions :refer [saga]]
   [integrant.core :as ig]
   [twarc.core :refer [defjob]]))

;; for each channel
;; get latest messages (DSC) for that channel
;; query memberships (DB) for that channel
;; determine the latest read message by comparing it against latest(last_digest_sent_at, last_active_at)
;; if there are no unread messages
;;   do nothing
;; if there are unread messages but it's been less than DSC_EMAIL_DIGEST_FREQUENCY_HOURS hours since the last last_digest_sent_at:
;;   do nothing
;; else:
;;   saga
;;     update last_digest_sent_at
;;       (reversible)
;;    send email with latest *unread* messages (first few N such messages)

(defn summarize-chat-messages [{:keys [logger hikari mailjet-config]
                                chat :chat-adapter}
                               frequency-in-hours]
  {:pre [logger
         (check! :int frequency-in-hours)]}
  (saga logger {:success? true}
    (fn [_context]
      (port.chat/get-all-channels chat {}))

    (fn assoc-extended-channels [{:keys [channels]}]
      (reduce (fn [acc {:keys [id] :as _channel}]
                {:pre [id]}
                (let [{:keys [success?]
                       :as channel-result} (port.chat/get-channel chat id)]
                  (cond
                    (not success?)
                    (reduced channel-result)

                    (-> channel-result :channel :messages :messages empty?)
                    acc ;; avoid later SQL queries

                    :else
                    (assoc-in acc [:extended-channels id] (dissoc channel-result :success?)))))
              {:success? true}
              channels))

    (fn assoc-memberships [context]
      (let [channel-ids (-> context :extended-channels keys vec)]
        (if (empty? channel-ids)
          {:success? true}
          (let [{:keys [success?]
                 sql-result :result
                 :as result} (db/execute! hikari
                                          {:select [:chat_channel_membership.*
                                                    :stakeholder.email
                                                    :stakeholder.first_name
                                                    :stakeholder.last_name]
                                           :from :chat_channel_membership
                                           :join [:stakeholder [:=
                                                                :chat_channel_membership.stakeholder_id
                                                                :stakeholder.id]]
                                           :where [:in
                                                   :chat_channel_membership.chat_channel_id
                                                   channel-ids]})]
            (if-not success?
              result
              (reduce (fn [new-context {:keys [chat-channel-id] :as membership}]
                        (update-in new-context
                                   [:extended-channels chat-channel-id :memberships]
                                   (fn [v]
                                     (conj (or v []) membership))))
                      context
                      sql-result))))))

    (fn persist-changes [context]
      (let [updates (reduce (fn [acc [chat-channel-id {{{recent-messages :messages} :messages} :channel
                                                       :keys [memberships]}]]
                              {:pre [(check! some? chat-channel-id
                                             some? recent-messages
                                             some? memberships)]}
                              (into acc
                                    (reduce (fn [acc membership]
                                              {:pre [(check! [:map
                                                              [:stakeholder-id some?]
                                                              [:chat-channel-id some?]
                                                              [:last-active-at any?]
                                                              [:last-digest-sent-at any?]
                                                              [:email any?]
                                                              [:first-name any?]
                                                              [:last-name any?]]
                                                             membership)]}
                                              (if true
                                                acc
                                                (with-meta {:the :update}
                                                  {:membership membership}))
                                              ;; XXX <<<<<<<<<<<<<<<<<<<<<<<
                                              ;; compare the timestamps from membership
                                              ;; with the user/time of recent-messages.
                                              ;; if the rules apply, conj an 'update' object to `acc`.
                                              acc)
                                            []
                                            memberships)))
                            []
                            (:extended-channels context))]
        (if-not (seq updates)
          {:success? true}
          (let [{:keys [success?]
                 :as result} (db/execute-one! hikari
                                              {:update :chat_channel_membership
                                               :set {:last_digest_sent_at :new-values.last_digest_sent_at}
                                               :from [[{:values updates}
                                                       [:new-values [:composite
                                                                     :last_digest_sent_at
                                                                     :stakeholder_id
                                                                     :chat_channel_id]]]]
                                               :where [:and
                                                       [:= :chat_channel_membership.stakeholder_id :new-values.stakeholder_id]
                                                       [:= :chat_channel_membership.chat_channel_id :new-values.chat_channel_id]]})]
            (if-not success?
              result
              (assoc context :updates updates))))))

    (fn effect-changes [{:keys [updates]}]
      (if-not (seq updates)
        (do
          (log logger :info :no-updates)
          {:success? true})
        (do
          (doseq [update updates
                  :let [{:keys [email first-name last-name]} (meta update)
                        texts "New chat messages"]]
            (assert (check! [:map
                             [:email any?]
                             [:first-name any?]
                             [:last-name any?]]
                            update))
            (email/send-email mailjet-config
                              email/unep-sender
                              "Subject"
                              [{:Name (str first-name " " last-name)
                                :Email email}]
                              texts
                              (mapv email/text->lines texts)))
          (log logger :info :success)
          {:success? true})))))

(comment
  (-> (summarize-chat-messages (dev/config-component)
                               1)))

(defjob chat-message-summarization
  [_scheduler config frequency-in-hours]
  (summarize-chat-messages config frequency-in-hours))

(defn- schedule-job [{:keys [scheduler logger] :as config} scheduler-config frequency-in-hours]
  {:pre [(check! :int frequency-in-hours)]}
  (let [time-zone (java.util.TimeZone/getTimeZone ^String (:time-zone scheduler-config))]
    (log logger :report :chat-message-summarization scheduler-config)
    (chat-message-summarization scheduler
                                [config frequency-in-hours]
                                :trigger {:cron {:expression (:cron scheduler-config)
                                                 :misfire-handling :fire-and-process
                                                 :time-zone time-zone}}
                                :job {:identity (:identity scheduler-config)})))

(defmethod ig/init-key :gpml.scheduler/chat-message-summarizer
  [_ {:keys [config scheduler-config frequency-in-hours]}]
  (schedule-job config scheduler-config (Long/parseLong frequency-in-hours)))

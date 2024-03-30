(ns gpml.scheduler.chat-message-summarizer
  (:require
   [duct.logger :refer [log]]
   [gpml.boundary.port.chat :as port.chat]
   [gpml.db :as db]
   [gpml.util.email :as email]
   [gpml.util.malli :refer [check!]]
   [gpml.util.thread-transactions :refer [saga]]
   [integrant.core :as ig]
   [java-time.api :as jt]
   [pogonos.core :as pogonos]
   [twarc.core :refer [defjob]]))

(def genesis (.toInstant (jt/local-date-time 1000 1 1 0 0)
                         (jt/zone-offset)))

(def apocalypse (.toInstant (jt/local-date-time 3000 1 1 0 0)
                            (jt/zone-offset)))

(defn time-difference-in-minutes [a b]
  (.toMinutes (jt/duration (jt/instant a)
                           (jt/instant b))))

(def email-html-template
  (delay
    (pogonos/parse-resource "gpml/email_templates/chat_message_summarizer.html")))

;; for each channel
;; get latest messages (DSC) for that channel
;; query memberships (DB) for that channel
;; determine the latest read message by comparing it against latest(last_digest_sent_at, last_active_at)
;; if there are no unread messages
;;   do nothing
;; if there are unread messages but it's been less than DSC_EMAIL_DIGEST_FREQUENCY_MINUTES minutes since the last last_digest_sent_at:
;;   do nothing
;; else:
;;   saga
;;     update last_digest_sent_at
;;       (reversible)
;;    send email with latest *unread* messages (first few N such messages)

(defn summarize-chat-messages [{:keys [logger hikari mailjet-config app-domain]
                                chat :chat-adapter}
                               frequency-in-minutes]
  {:pre [logger
         (check! :int frequency-in-minutes)]}
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
                    (do
                      (log logger :warn :empty-messages)
                      acc) ;; avoid later SQL queries

                    :else
                    (assoc-in acc [:extended-channels id] (dissoc channel-result :success?)))))
              {:success? true}
              channels))

    (fn assoc-memberships [context]
      (let [channel-ids (-> context :extended-channels keys vec)]
        (if (empty? channel-ids)
          (do
            (log logger :warn :no-channel-ids)
            context)
          (let [{:keys [success?]
                 sql-result :result
                 :as result} (db/execute! hikari
                                          {:select [:chat_channel_membership.*
                                                    :stakeholder.email
                                                    :stakeholder.first_name
                                                    :stakeholder.last_name
                                                    :stakeholder.chat_account_id]
                                           :from :chat_channel_membership
                                           :join [:stakeholder [:=
                                                                :chat_channel_membership.stakeholder_id
                                                                :stakeholder.id]]
                                           :where [:in
                                                   :chat_channel_membership.chat_channel_id
                                                   channel-ids]})]
            (if-not success?
              result
              (let [draft (reduce (fn [new-context {:keys [chat-channel-id] :as membership}]
                                    (update-in new-context
                                               [:extended-channels chat-channel-id :memberships]
                                               (fn [v]
                                                 (conj (or v []) membership))))
                                  context
                                  sql-result)]
                ;; Only keep the channels for which there was a DB hit.
                ;; Normally all channels are backed by the DB,
                ;; but this may not happens when one wipes the dev DB, or similar sync-related conditions.
                (update draft :extended-channels select-keys (mapv :chat-channel-id sql-result))))))))

    (fn persist-changes [context]
      (let [updates (reduce (fn [acc [chat-channel-id {{{recent-messages :messages} :messages} :channel
                                                       :keys [memberships]}]]
                              {:pre [(check! some? chat-channel-id
                                             some? recent-messages
                                             some? memberships)]}
                              (into acc
                                    (keep (fn [membership]
                                            {:pre [(check! [:map
                                                            [:stakeholder-id some?]
                                                            [:chat-channel-id some?]
                                                            [:last-active-at any?]
                                                            [:last-digest-sent-at any?]
                                                            [:email any?]
                                                            [:chat-account-id any?]
                                                            [:first-name any?]
                                                            [:last-name any?]]
                                                           membership)]}
                                            (let [chat-account-id (:chat-account-id membership)
                                                  should-notify-about-recent-messages?
                                                  (and chat-account-id
                                                       (first recent-messages)
                                                       (not= (-> recent-messages
                                                                 first
                                                                 :unique-user-identifier
                                                                 (doto (assert ":unique-user-identifier")))
                                                             chat-account-id)
                                                       ;; recent-messages :- gpml.boundary.port.chat/Message
                                                       (jt/> (-> recent-messages first :created jt/instant)
                                                             (or (some-> membership ^java.sql.Timestamp (:last-digest-sent-at) .toInstant)
                                                                 genesis))
                                                       (>= (time-difference-in-minutes (or (some-> membership ^java.sql.Timestamp (:last-digest-sent-at) .toInstant)
                                                                                           genesis)
                                                                                       (jt/instant))
                                                           frequency-in-minutes)
                                                       ;; XXX :last-active-at logic...
                                                       )]
                                              (when should-notify-about-recent-messages?
                                                (with-meta [:%now,
                                                            (:stakeholder-id membership),
                                                            chat-channel-id]
                                                  {:membership membership
                                                   :recent-messages (filterv (fn [recent-message]
                                                                               (jt/> (-> recent-message :created jt/instant)
                                                                                     (or (some-> membership ^java.sql.Timestamp (:last-digest-sent-at) .toInstant)
                                                                                         genesis)))
                                                                             recent-messages)})))))
                                    memberships))
                            []
                            (:extended-channels context))]
        (if-not (seq updates)
          (do
            (log logger :warn :no-updates)
            context)
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

    (fn effect-changes [{:keys [updates] :as context}]
      (if-not (seq updates)
        (do
          (log logger :info :no-updates)
          context)
        (do
          (doseq [[_last-digest-sent-at
                   _stakeholder-id
                   chat-channel-id :as db-update] updates
                  :let [membership (-> db-update meta :membership (doto (assert ":membership")))
                        recent-messages (-> db-update meta :recent-messages (doto (assert ":recent-messages")))
                        {:keys [email first-name last-name]} membership
                        ;; _extended-channel :- gpml.boundary.port.chat/ExtendedChannel
                        {channel-name :name :as _extended-channel} (get-in context [:extended-channels chat-channel-id :channel])
                        texts [(pr-str (mapv #(select-keys % [:messages]) recent-messages))]]] ;; TODO proper text email
            (assert (check! [:map
                             [:email any?]
                             [:first-name any?]
                             [:last-name any?]]
                            membership))
            (assert chat-channel-id "chat-channel-id")
            (assert channel-name "channel-name")
            (email/send-email mailjet-config
                              email/unep-sender
                              (format "New messages in chat channel: %s" channel-name)
                              [{:Name (str first-name " " last-name)
                                :Email email}]
                              texts
                              [(pogonos/render @email-html-template {:messageCount (format "%s New %s"
                                                                                           (count recent-messages)
                                                                                           (if (> (count recent-messages)
                                                                                                  1)
                                                                                             "Messages"
                                                                                             "Message"))
                                                                     :channelURL (format "%s/forum/%s" app-domain chat-channel-id)
                                                                     :channelName channel-name
                                                                     :messages (mapv (fn [recent-message]
                                                                                       {:pre [(check! port.chat/Message recent-message)]}
                                                                                       {:userName (:username recent-message)
                                                                                        :message (:message recent-message)
                                                                                        ;; XXX format as "ago" - the simplest thing we can do to avoid timezones
                                                                                        :time (->> recent-message :created)})
                                                                                     recent-messages)})]))
          (log logger :info :success {:affected (count updates)})
          context)))))

;; --- Demo ---
(comment

  ;; XXX delete old channels (DSC) + memberships (DB)

  ;; create a channel:
  @(def a-public-channel (port.chat/create-public-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                                          {:name (str (random-uuid))}))
  ;; create a user:
  (let [{:keys [id]} (dev/make-user! (format "a%s@a%s.com" (random-uuid) (random-uuid)))]

    @(def a-user
       ;; exercises port.chat/create-user-account while also persisting the result to the DB:
       (gpml.service.chat/create-user-account (dev/config-component)
                                              id))

    @(def uniqueUserIdentifier (-> a-user :stakeholder :chat-account-id)))

  ;; use service for that user to join that channel:
  (gpml.service.chat/join-channel (dev/config-component)
                                  (-> a-public-channel :channel :id)
                                  (:stakeholder a-user))

  ;; write a message as a user in that channel (manual step - open the link in your browser):
  (println (format "https://deadsimplechat.com/%s?uniqueUserIdentifier=%s" (-> a-public-channel :channel :id) uniqueUserIdentifier))

  ;; exercise the feature:
  (-> (summarize-chat-messages (dev/config-component)
                               1)))

(defjob chat-message-summarization
  [_scheduler config frequency-in-minutes]
  (summarize-chat-messages config frequency-in-minutes))

(defn- schedule-job [{:keys [scheduler logger] :as config} scheduler-config frequency-in-minutes]
  {:pre [(check! :int frequency-in-minutes)]}
  (let [time-zone (java.util.TimeZone/getTimeZone ^String (:time-zone scheduler-config))]
    (log logger :report :chat-message-summarization scheduler-config)
    (chat-message-summarization scheduler
                                [config frequency-in-minutes]
                                :trigger {:cron {:expression (:cron scheduler-config)
                                                 :misfire-handling :fire-and-process
                                                 :time-zone time-zone}}
                                :job {:identity (:identity scheduler-config)})))

(defmethod ig/init-key :gpml.scheduler/chat-message-summarizer
  [_ {:keys [config scheduler-config frequency-in-minutes]}]
  (schedule-job config scheduler-config (Long/parseLong frequency-in-minutes)))

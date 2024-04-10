(ns gpml.scheduler.picture-file-reconciler
  "Ensures that for any given Stakeholder record,
  its corresponding DSC account has the same profile picture.

  This serves two purposes:

  - Fix all the profile pictures that were initially missing in DSC.
    - (this purpose will become outdated after the first successful run)
  - Propagate any possible profile picture changes from our app to DSC.
    - It's a quite infrequent case, so this job is safe to run infrequently as well."
  (:require
   [duct.logger :refer [log]]
   [gpml.boundary.port.chat :as port.chat]
   [gpml.db.jdbc-util :as jdbc-util]
   [gpml.db.stakeholder :as db.sth]
   [gpml.service.file :as srv.file]
   [gpml.util.malli :refer [check!]]
   [gpml.util.result :refer [failure]]
   [gpml.util.thread-transactions :refer [saga]]
   [integrant.core :as ig]
   [twarc.core :refer [defjob]]))

(defn reconcile-profile-pictures [{:keys [db logger hikari]
                                   chat :chat-adapter
                                   :as config}]
  {:pre [db hikari logger chat]}
  (log logger :info :starting)
  (saga logger {:success? true}
    (fn get-users-with-a-profile-picture-and-dsc-account [context]
      (let [v (into {}
                    (comp (map jdbc-util/db-result-snake-kw->db-result-kebab-kw)
                          (filter :picture-file)
                          (map (fn [{:keys [chat-account-id] :as s}]
                                 [chat-account-id s])))
                    (db.sth/get-stakeholders (:spec db)
                                             {:filters {:chat-account-id-not-null true}
                                              :related-entities #{:picture-file}}))]
        (if (empty? v)
          (do
            (log logger :info :no-stakeholders)
            (failure context :reason :no-stakeholders))
          {:success? true
           :stakeholders v})))

    (fn get-all-channels [context]
      (let [result (port.chat/get-all-channels chat :_)]
        (if (:success? result)
          (assoc context :channels (:channels result))
          (failure context
                   :reason :failed-to-get-all-channels
                   :error-details {:result result}))))

    (fn enrich-channels [context]
      (reduce (fn [acc {channel-id :id}]
                {:pre [channel-id]}
                (let [result (port.chat/get-channel chat channel-id)]
                  (if-not (:success? result)
                    (failure acc
                             :reason :could-not-get-channel
                             :error-details {:result result})
                    (update acc :extended-channels conj result))))
              (assoc context :extended-channels [])
              (:channels context)))

    (fn extract-users [context]
      (assoc context :dsc-users (into {}
                                      (map (fn [{:keys [unique-user-identifier] :as user}]
                                             {:pre [(check! port.chat/UserInfo user)]}
                                             [unique-user-identifier user]))
                                      (into #{}
                                            (mapcat (fn [{{{members :data} :members} :channel}]
                                                      {:pre [members]}
                                                      members))
                                            (:extended-channels context)))))

    (fn determine-accounts-out-of-sync [context]
      (assoc context
             :stakeholders-with-newer-profile-picture
             (into {}
                   (filter (fn [[chat-account-id {:keys [picture-file] :as _stakeholder}]]
                             (let [{picture-url :url} (srv.file/get-file-url config picture-file)
                                   match (get-in context [:dsc-users chat-account-id])]
                               (when-not match
                                 ;; NOTE: :no-match can happen in the test environment, given that
                                 ;; the prod DB was recently copied into the test DB.
                                 ;; So there's nothing too bad about these, in principle.
                                 (log logger :warn :no-match {:stakeholder-chat-account-id chat-account-id
                                                              :dsc-chat-account-ids (-> context :dsc-users keys)}))
                               (and picture-url
                                    match
                                    (not= picture-url (get match :profile-pic))))))
                   (:stakeholders context))))

    (fn effect-changes [context]
      (let [final
            (reduce (fn [acc [chat-account-id {:keys [picture-file] :as _stakeholder}]]
                      (let [{picture-url :url} (srv.file/get-file-url config picture-file)]
                        (assert picture-url)
                        (let [result (port.chat/update-user-account chat
                                                                    chat-account-id
                                                                    {:profilePic picture-url})]
                          (if (:success? result)
                            (update acc :affected inc)
                            (failure acc
                                     :reason :could-not-update-user-account
                                     :error-details {:result result})))))
                    (assoc context :affected 0)
                    (:stakeholders-with-newer-profile-picture context))]
        (log logger :info :done {:context final})
        final))))

(comment
  (reconcile-profile-pictures (dev/config-component)))

(defjob profile-picture-reconcilation
  [_scheduler config]
  (reconcile-profile-pictures config))

(defn- schedule-job [{:keys [scheduler logger] :as config} scheduler-config]
  (let [time-zone (java.util.TimeZone/getTimeZone ^String (:time-zone scheduler-config))]
    (log logger :report :profile-picture-reconcilation scheduler-config)
    (profile-picture-reconcilation scheduler
                                   [config]
                                   :trigger {:cron {:expression (:cron scheduler-config)
                                                    :misfire-handling :fire-and-process
                                                    :time-zone time-zone}}
                                   :job {:identity (:identity scheduler-config)})))

(defmethod ig/init-key :gpml.scheduler/picture-file-reconciler
  [_ {:keys [config scheduler-config]}]
  (schedule-job config scheduler-config))

(ns gpml.service.chat
  (:require
   [gpml.boundary.port.chat :as chat]
   [gpml.db.rbac-util :as db.rbac-util]
   [gpml.db.stakeholder :as db.sth]
   [gpml.service.file :as srv.file]
   [gpml.util.crypto :as util.crypto]
   [gpml.util.email :as util.email]
   [gpml.util.thread-transactions :as tht]
   [medley.core :as medley]))

(def ^:private ^:const random-password-size
  10)

(defn- create-user-account*
  [{:keys [chat-adapter]} chat-user]
  (let [password (util.crypto/create-crypto-random-hex-string random-password-size)
        chat-user-account (assoc chat-user
                                 :password password
                                 :active true
                                 :roles ["user"]
                                 :join-default-channels false
                                 :require-password-change false
                                 :send-welcome-email false
                                 :verified true)]
    (chat/create-user-account chat-adapter chat-user-account)))

(defn- set-stakeholder-chat-account-details
  [{:keys [db]} user-id {chat-account-id :id active :active}]
  (let [chat-account-status (if active "active" "inactive")
        affected (db.sth/update-stakeholder (:spec db)
                                            {:id user-id
                                             :chat_account_id chat-account-id
                                             :chat_account_status chat-account-status})]
    (if (= affected 1)
      {:success? true
       :stakeholder {:id user-id
                     :chat-account-id chat-account-id
                     :chat-account-status chat-account-status}}
      {:success? false
       :reason :failed-to-update-stakeholder})))

(defn create-user-account
  [{:keys [db chat-adapter logger] :as config} user-id]
  (let [transactions [{:txn-fn
                       (fn get-stakeholder
                         [{:keys [user-id] :as context}]
                         (let [search-opts {:filters {:ids [user-id]}}
                               result (db.sth/get-stakeholder (:spec db) search-opts)]
                           (if (:success? result)
                             (assoc context :stakeholder (:stakeholder result))
                             (if (= (:reason result) :not-found)
                               (assoc context
                                      :success? false
                                      :reason :not-found)
                               (assoc context
                                      :success? false
                                      :reason (:reason result)
                                      :error-details (:error-details result))))))}
                      {:txn-fn
                       (fn create-chat-user-account
                         [{:keys [stakeholder] :as context}]
                         (let [{:keys [first-name last-name email]} stakeholder
                               user {:name (str first-name " " last-name)
                                     :email email
                                     :username email}
                               result (create-user-account* config user)]
                           (if (:success? result)
                             (assoc context :chat-user-account (:user result))
                             (assoc context
                                    :success? false
                                    :reason (:reason result)
                                    :error-details (:error-details result)))))
                       :rollback-fn
                       (fn rollback-create-chat-user-account
                         [{:keys [chat-user-account] :as context}]
                         (chat/delete-user-account chat-adapter (:id chat-user-account))
                         context)}
                      {:txn-fn
                       (fn update-stakeholder
                         [{:keys [user-id chat-user-account] :as context}]
                         (let [result (set-stakeholder-chat-account-details config
                                                                            user-id
                                                                            chat-user-account)]
                           (if (:success? result)
                             (assoc context :stakeholder (:stakeholder result))
                             (assoc context
                                    :success? false
                                    :reason (:reason result)
                                    :error-details (:error-details result)))))}]
        context {:success? true
                 :user-id user-id}]
    (tht/thread-transactions logger transactions context)))

(defn set-user-account-active-status
  [{:keys [db chat-adapter logger]} user chat-account-status]
  (let [transactions [{:txn-fn
                       (fn set-chat-user-account-active-stauts
                         [{:keys [user chat-account-status] :as context}]
                         (let [active? (= chat-account-status :active)
                               chat-account-id (:chat_account_id user)
                               result (chat/set-user-account-active-status chat-adapter
                                                                           chat-account-id
                                                                           active?)]
                           (if (:success? result)
                             context
                             (assoc context
                                    :success? false
                                    :reason (:reason result)
                                    :error-details (:error-details result)))))
                       :rollback-fn
                       (fn rollback-set-chat-user-account-active-status
                         [{:keys [user] :as context}]
                         (chat/set-user-account-active-status chat-adapter
                                                              (:chat_account_id user)
                                                              (= (keyword (:chat_account_status user)) :active))
                         context)}
                      {:txn-fn
                       (fn update-stakeholder-chat-account-status
                         [{:keys [user chat-account-status] :as context}]
                         (let [affected (db.sth/update-stakeholder (:spec db)
                                                                   {:id (:id user)
                                                                    :chat_account_status (name chat-account-status)})]
                           (if (= affected 1)
                             context
                             (assoc context
                                    :success? false
                                    :reason :failed-to-update-stakeholder-chat-account-status
                                    :error-details {:error-source :persistence
                                                    :error-cause :unexpected-number-of-affected-rows}))))}]
        context {:success? true
                 :user user
                 :chat-account-status chat-account-status}]
    (tht/thread-transactions logger transactions context)))

(defn update-user-account
  [{:keys [chat-adapter]} chat-account-id updates]
  (chat/update-user-account chat-adapter chat-account-id updates))

(defn delete-user-account
  [{:keys [chat-adapter]} chat-account-id opts]
  (chat/delete-user-account chat-adapter chat-account-id opts))

(defn get-user-joined-channels
  [{:keys [chat-adapter]} chat-account-id]
  (chat/get-user-joined-channels chat-adapter chat-account-id))

(defn get-private-channels
  ([config]
   (get-private-channels config {}))
  ([{:keys [chat-adapter]} opts]
   (chat/get-private-channels chat-adapter opts)))

(defn get-public-channels
  ([config]
   (get-public-channels config {:remove-ps-channels? true}))
  ([{:keys [chat-adapter]} {:keys [remove-ps-channels?] :as opts}]
   (let [result (chat/get-public-channels chat-adapter (dissoc opts :remove-ps-channels?))]
     (if (:success? result)
       (if remove-ps-channels?
         (update result :channels (fn [channels]
                                    (remove #(get-in % [:custom-fields :ps-country-iso-code-a-2]) channels)))
         result)
       result))))

(defn- add-users-pictures-urls
  [config users]
  (map
   (fn [user]
     (if-not (seq (:picture_file user))
       user
       (let [{object-key :object_key visibility :visibility} (:picture_file user)
             result (srv.file/get-file-url config {:object-key object-key
                                                   :visibility (keyword visibility)})]
         (if (:success? result)
           (assoc user :picture (:url result))
           user))))
   users))

(defn get-all-channels
  [{:keys [db chat-adapter logger] :as config} opts]
  (let [transactions
        [{:txn-fn
          (fn tx-get-all-channels
            [{:keys [opts] :as context}]
            (let [;; We always ask only for the Public `c` and Private `p`
                  ;; channels. Because RocketChat has other channel types that are not
                  ;; used by GPML.
                  result (chat/get-all-channels chat-adapter (merge {:types ["c" "p"]} opts))]
              (if (:success? result)
                (assoc context :channels (:channels result))
                (assoc context
                       :success? false
                       :reason :failed-to-get-all-channels
                       :error-details {:result result}))))}
         {:txn-fn
          (fn tx-add-channels-users-details
            [{:keys [channels] :as context}]
            (let [channels (remove #(get-in % [:custom-fields :ps-country-iso-code-a-2]) channels)
                  chat-accounts-ids (set (reduce
                                          (fn [users-accounts-ids {:keys [users]}]
                                            (apply conj users-accounts-ids (map :id users)))
                                          []
                                          channels))
                  search-opts {:related-entities #{:organisation :picture-file}
                               :filters {:chat-accounts-ids chat-accounts-ids}}
                  result (try
                           {:success? true
                            :stakeholders (db.sth/get-stakeholders (:spec db)
                                                                   search-opts)}
                           (catch Throwable t
                             {:success? false
                              :reason :exception
                              :error-details {:msg (ex-message t)}}))]
              (if-not (:success? result)
                (assoc context
                       :success? false
                       :reason :failed-to-get-channels-users-details
                       :error-details {:result result})
                (let [gpml-users (->> (:stakeholders result)
                                      (add-users-pictures-urls config)
                                      (medley/index-by :chat_account_id))
                      updated-channels
                      (map
                       (fn [channel]
                         (update channel :users
                                 (fn [users]
                                   (map
                                    (fn [user]
                                      (merge user (get gpml-users (:id user))))
                                    users))))
                       channels)]
                  (assoc context :channels updated-channels)))))}]
        context {:success? true
                 :opts opts}]
    (tht/thread-transactions logger transactions context)))

(defn get-channel-details
  [{:keys [db chat-adapter logger] :as config} channel-id channel-type]
  (let [transactions
        [{:txn-fn
          (fn tx-get-channel
            [{:keys [channel-id channel-type] :as context}]
            (let [common-opts {:query {:_id {:$eq channel-id}}}
                  result (if (= channel-type "c")
                           (get-public-channels config (assoc common-opts :remove-ps-channels? false))
                           (get-private-channels config common-opts))]
              (if (:success? result)
                (assoc context :channel (first (:channels result)))
                (assoc context
                       :success? false
                       :reason :failed-to-get-channel
                       :error-details {:result result}))))}
         {:txn-fn
          (fn tx-get-channel-discussions
            [{:keys [channel] :as context}]
            (let [result (chat/get-channel-discussions chat-adapter (:id channel))]
              (if (:success? result)
                (assoc-in context [:channel :discussions] (:discussions result))
                (assoc context
                       :success? false
                       :reason :failed-to-get-channel-discussions
                       :error-details {:result result}))))}
         {:txn-fn
          (fn tx-get-channel-users
            [{:keys [channel] :as context}]
            (let [chat-accounts-ids (map :id (:users channel))
                  search-opts {:related-entities #{:organisation :picture-file}
                               :filters {:chat-accounts-ids chat-accounts-ids}}
                  result (try
                           {:success? true
                            :stakeholders (db.sth/get-stakeholders (:spec db)
                                                                   search-opts)}
                           (catch Throwable t
                             {:success? false
                              :reason :exception
                              :error-details {:msg (ex-message t)}}))]
              (if (:success? result)
                (assoc-in context [:channel :users] (->> (:stakeholders result)
                                                         (add-users-pictures-urls config)))
                (assoc context
                       :success? false
                       :reason :failed-to-get-channel-users
                       :error-details {:result result}))))}]
        context {:success? true
                 :channel-id channel-id
                 :channel-type channel-type}]
    (tht/thread-transactions logger transactions context)))

(defn remove-user-from-channel
  [{:keys [chat-adapter]} chat-account-id channel-id channel-type]
  (chat/remove-user-from-channel chat-adapter
                                 chat-account-id
                                 channel-id
                                 channel-type))

(defn add-user-to-private-channel
  [{:keys [chat-adapter]} chat-account-id channel-id]
  (chat/add-user-to-private-channel chat-adapter
                                    chat-account-id
                                    channel-id))

(defn add-user-to-public-channel
  [{:keys [chat-adapter]} chat-account-id channel-id]
  (chat/add-user-to-public-channel chat-adapter
                                   chat-account-id
                                   channel-id))

(defn create-private-channel
  [{:keys [chat-adapter]} channel]
  (chat/create-private-channel chat-adapter channel))

(defn set-private-channel-custom-fields
  [{:keys [chat-adapter]} channel-id custom-fields]
  (chat/set-private-channel-custom-fields chat-adapter channel-id custom-fields))

(defn create-public-channel
  [{:keys [chat-adapter]} channel]
  (chat/create-public-channel chat-adapter channel))

(defn set-public-channel-custom-fields
  [{:keys [chat-adapter]} channel-id custom-fields]
  (chat/set-public-channel-custom-fields chat-adapter channel-id custom-fields))

(defn delete-private-channel
  [{:keys [chat-adapter]} channel-id]
  (chat/delete-private-channel chat-adapter channel-id))

(defn delete-public-channel
  [{:keys [chat-adapter]} channel-id]
  (chat/delete-public-channel chat-adapter channel-id))

(defn send-private-channel-invitation-request
  [{:keys [db mailjet-config]} user channel-id channel-name]
  (let [super-admins (db.rbac-util/get-super-admins-details (:spec db) {})]
    (util.email/notify-admins-new-chat-private-channel-invitation-request
     mailjet-config
     super-admins
     user
     channel-id
     channel-name)))

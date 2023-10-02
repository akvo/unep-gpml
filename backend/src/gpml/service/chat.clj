(ns gpml.service.chat
  (:require [gpml.boundary.port.chat :as chat]
            [gpml.db.rbac-util :as db.rbac-util]
            [gpml.db.stakeholder :as db.sth]
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
  [{:keys [chat-adapter]} user-id updates]
  (chat/update-user-account chat-adapter user-id updates))

(defn get-user-joined-channels
  [{:keys [chat-adapter]} chat-account-id]
  (chat/get-user-joined-channels chat-adapter chat-account-id))

(defn get-private-channels
  [{:keys [chat-adapter]}]
  (chat/get-private-channels chat-adapter {}))

(defn get-public-channels
  [{:keys [chat-adapter]}]
  (chat/get-public-channels chat-adapter {}))

(defn get-all-channels
  [{:keys [db chat-adapter]} opts]
  (let [;; We always ask only for the Public `c` and Private `p`
        ;; channels. Because RocketChat has other channel types that are not
        ;; used by GPML.
        result (chat/get-all-channels chat-adapter (merge {:types ["c" "p"]} opts))]
    (if-not (:success? result)
      result
      (let [channels (:channels result)
            chat-accounts-ids (set (reduce
                                    (fn [users-accounts-ids {:keys [users]}]
                                      (apply conj users-accounts-ids (map :id users)))
                                    []
                                    channels))
            search-opts {:related-entities #{:organisation}
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
          result
          (let [gpml-users (medley/index-by :chat_account_id (:stakeholders result))
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
            (assoc result :channels updated-channels)))))))

(defn send-private-channel-invitation-request
  [{:keys [db mailjet-config]} user channel-name]
  (let [super-admins (db.rbac-util/get-super-admins-details (:spec db) {})]
    (util.email/notify-admins-new-chat-private-channel-invitation-request
     mailjet-config
     super-admins
     user
     channel-name)))

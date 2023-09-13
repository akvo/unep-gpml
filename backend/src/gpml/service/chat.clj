(ns gpml.service.chat
  (:require [gpml.boundary.port.chat :as chat]
            [gpml.db.stakeholder :as db.sth]
            [gpml.util.crypto :as util.crypto]
            [gpml.util.thread-transactions :as tht]))

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

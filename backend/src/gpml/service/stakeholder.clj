(ns gpml.service.stakeholder
  (:require
   [duct.logger :refer [log]]
   [gpml.db.invitation :as db.invitation]
   [gpml.db.organisation :as db.organisation]
   [gpml.db.resource.tag :as db.resource.tag]
   [gpml.db.stakeholder :as db.stakeholder]
   [gpml.domain.file :as dom.file]
   [gpml.handler.organisation :as handler.org]
   [gpml.handler.stakeholder.tag :as handler.stakeholder.tag]
   [gpml.service.chat :as svc.chat]
   [gpml.service.file :as srv.file]
   [gpml.service.permissions :as srv.permissions]
   [gpml.service.plastic-strategy :as srv.ps]
   [gpml.util :as util]
   [gpml.util.image :as util.image]
   [gpml.util.thread-transactions :as tht]
   [medley.core :as medley]))

(defn create-stakeholder [{:keys [db logger mailjet-config] :as config} stakeholder]
  (let [conn (:spec db)
        context {:success? true
                 :stakeholder stakeholder}
        transactions
        [{:txn-fn
          (fn create-picture-file
            [{{:keys [picture]} :stakeholder :as context}]
            (if-not (:payload picture)
              context
              (let [{:keys [payload user-agent]} picture
                    picture (if (util/try-url-str payload)
                              (util.image/download-image logger payload {:headers {:user-agent user-agent}})
                              payload)
                    picture-file (dom.file/base64->file picture :stakeholder :images :private)
                    result (srv.file/create-file config conn picture-file)]
                (if (:success? result)
                  (assoc context :picture-file (dissoc picture-file :content))
                  (assoc context
                         :success? false
                         :reason (:reason result)
                         :error-details (:error-details result))))))
          :rollback-fn
          (fn rollback-create-picture-file
            [{:keys [picture-file] :as context}]
            (when (seq picture-file)
              (srv.file/delete-file config conn {:id (:id picture-file)}))
            (dissoc context :picture-file))}
         {:txn-fn
          (fn create-cv-file
            [{{:keys [cv]} :stakeholder :as context}]
            (if-not (seq cv)
              context
              (let [cv-file (dom.file/base64->file cv :stakeholder :cvs :private)
                    result (srv.file/create-file config conn cv-file)]
                (if (:success? result)
                  (assoc context :cv-file (dissoc cv-file :content))
                  (assoc context
                         :success? false
                         :reason (:reason result)
                         :error-details (:error-details result))))))
          :rollback-fn
          (fn rollback-create-cv-file
            [{:keys [cv-file] :as context}]
            (when (seq cv-file)
              (srv.file/delete-file config conn {:id (:id cv-file)}))
            (dissoc context :cv-file))}
         {:txn-fn
          (fn create-stakeholder
            [{:keys [stakeholder picture-file cv-file] :as context}]
            (let [picture-id (:id picture-file)
                  cv-id (:id cv-file)
                  result (db.stakeholder/new-stakeholder conn
                                                         (cond-> stakeholder
                                                           picture-id
                                                           (assoc :picture_id picture-id)

                                                           cv-id
                                                           (assoc :cv_id cv-id)))]
              (if (:id result)
                (assoc-in context [:stakeholder :id] (:id result))
                (assoc context
                       :success? false
                       :reason :failed-to-create-stakeholder))))
          :rollback-fn
          (fn rollback-create-stakeholder
            [{:keys [stakeholder] :as context}]
            (db.stakeholder/delete-stakeholder conn (:id stakeholder))
            context)}
         {:txn-fn
          (fn save-stakeholder-tags
            [{:keys [stakeholder] :as context}]
            (if-not (seq (:tags stakeholder))
              context
              (let [result (handler.stakeholder.tag/save-stakeholder-tags
                            conn
                            logger
                            mailjet-config
                            {:tags (:tags stakeholder)
                             :stakeholder-id (:id stakeholder)
                             :handle-errors? true})]
                (if (:success? result)
                  context
                  (assoc context
                         :success? false
                         :reason :failed-to-save-tags
                         :error-details {:result result})))))
          :rollback-fn
          (fn rollback-save-stakeholder-tags
            [{:keys [stakeholder] :as context}]
            (db.resource.tag/delete-resource-tags conn {:table "stakeholder_tag"
                                                        :resource-col "stakeholder"
                                                        :resource-id (:id stakeholder)})
            context)}
         {:txn-fn
          (fn [{:keys [stakeholder] :as context}]
            (if-not (get-in stakeholder [:org :id])
              context
              (let [sth-id (:id stakeholder)
                    org (:org stakeholder)
                    old-org (first (db.organisation/get-organisations
                                    conn
                                    {:filters {:id (:id org)}}))]
                (if (:is_member old-org)
                  ;; This means the org is a MEMBER,
                  ;; approved organisation, where the stakeholder
                  ;; should not have ownership permissions, so we
                  ;; don't need to do anything else.
                  context
                  (let [;; We assign `resource-owner` role to the
                        ;; stakeholder that has created the org, as it
                        ;; is a non-member organisation that he can
                        ;; edit without being approved yet.
                        result (srv.permissions/assign-roles-to-users-from-connections
                                {:conn conn
                                 :logger logger}
                                {:context-type :organisation
                                 :resource-id (:id org)
                                 :individual-connections [{:role "owner"
                                                           :stakeholder sth-id}]})]
                    (if-not (-> result first :success?)
                      (assoc context
                             :success? false
                             :reason :failed-to-assign-sth-owner-role-to-organisation
                             :error-details {:result result})
                      (let [{:keys [success?]} (handler.org/update-org
                                                config
                                                conn
                                                {:id (:id org)
                                                 :created_by sth-id})]
                        (if success?
                          context
                          (assoc context
                                 :success? false
                                 :reason :failed-to-update-sth-organisation
                                 :error-details {:result result})))))))))}
         {:txn-fn
          (fn create-stakeholder-rbac-context
            [{:keys [stakeholder] :as context}]
            (let [result (srv.permissions/create-resource-context
                          {:conn conn
                           :logger logger}
                          {:context-type :stakeholder
                           :resource-id (:id stakeholder)})]
              (if (:success? result)
                (assoc context :stakeholder-rbac-context (:context result))
                (assoc context
                       :success? false
                       :reason :failed-to-create-stakeholder-rbac-context
                       :error-details (:error-details result)))))
          :rollback-fn
          (fn rollback-create-stakeholder-rbac-context
            [{:keys [stakeholder] :as context}]
            (srv.permissions/delete-resource-context {:conn conn
                                                      :logger logger}
                                                     {:resource-id (:id stakeholder)
                                                      :context-type-name :stakeholder})
            (dissoc context :stakeholder-rbac-context))}
         {:txn-fn
          (fn assign-role [{:keys [stakeholder] :as context}]
            (let [role-assignments [{:role-name :unapproved-user
                                     :context-type :application
                                     :resource-id srv.permissions/root-app-resource-id
                                     :user-id (:id stakeholder)}]
                  result (first (srv.permissions/assign-roles-to-users
                                 {:conn conn
                                  :logger logger}
                                 role-assignments))]
              (if (:success? result)
                context
                (assoc context
                       :success? false
                       :reason :failed-to-assign-role-to-stakeholder
                       :error-details (:error-details result)))))
          :rollback-fn
          (fn rollback-assign-role
            [{:keys [stakeholder] :as context}]
            (let [role-unassignments [{:role-name :unapproved-user
                                       :context-type :application
                                       :resource-id srv.permissions/root-app-resource-id
                                       :user-id (:id stakeholder)}]
                  result (first (srv.permissions/unassign-roles-from-users
                                 {:conn conn
                                  :logger logger}
                                 role-unassignments))]
              (when-not (:success? result)
                (log logger :error :failed-to-rollback-assign-role-to-stakeholder {:result result})))
            context)}
         {:txn-fn
          (fn create-chat-account
            [{:keys [stakeholder] :as context}]
            (let [{success? :success?
                   updated-user :stakeholder
                   :as result}
                  (svc.chat/create-user-account config (:id stakeholder))]
              (if success?
                (-> context
                    (assoc-in [:stakeholder :chat_account_id] (:chat-account-id updated-user))
                    (assoc-in [:stakeholder :chat_account_status] (:chat-account-status updated-user)))
                (assoc context
                       :success? false
                       :reason :failed-to-create-chat-user-account
                       :error-details {:result result}))))}]]
    (tht/thread-transactions logger transactions context)))

(defn update-stakeholder [{:keys [db logger mailjet-config] :as config} stakeholder partial-tags-override-rel-cats]
  (let [conn (:spec db)
        context {:success? true
                 :stakeholder stakeholder}
        transactions
        [{:txn-fn
          (fn get-old-stakeholder
            [{:keys [stakeholder] :as context}]
            (let [result (db.stakeholder/get-stakeholder conn
                                                         {:filters {:ids [(:id stakeholder)]}})]
              (if (:success? result)
                (assoc context :old-stakeholder (:stakeholder result))
                (assoc context
                       :success? false
                       :reason :failed-to-get-old-stakeholder
                       :error-details {:result result}))))}
         {:txn-fn
          (fn update-picture-file
            [{{:keys [picture]} :stakeholder old-stakeholder :old-stakeholder :as context}]
            (if-not (:payload picture)
              context
              (let [old-picture-id (:picture-id old-stakeholder)
                    result (if (:picture-id old-stakeholder)
                             (srv.file/delete-file config conn {:id old-picture-id})
                             {:success? true})]
                (if-not (:success? result)
                  (assoc context
                         :success? false
                         :reason :failed-to-delete-old-picture
                         :error-details {:result result})
                  (let [{:keys [payload user-agent]} picture
                        new-picture (if (util/try-url-str payload)
                                      (util.image/download-image logger payload {:headers {:user-agent user-agent}})
                                      payload)
                        new-picture-file (dom.file/base64->file new-picture :stakeholder :images :private)
                        result (srv.file/create-file config conn new-picture-file)]
                    (if (:success? result)
                      (assoc context :picture-file (dissoc new-picture-file :content))
                      (assoc context
                             :success? false
                             :reason (:reason result)
                             :error-details (:error-details result))))))))
          :rollback-fn
          (fn rollback-update-picture-file
            [{:keys [picture-file] :as context}]
            (when (seq picture-file)
              (srv.file/delete-file config conn {:id (:id picture-file)}))
            (dissoc context :picture-file))}
         {:txn-fn
          (fn update-cv-file
            [{{:keys [cv]} :stakeholder old-stakeholder :old-stakeholder :as context}]
            (if-not (seq cv)
              context
              (let [old-cv-id (:cv-id old-stakeholder)
                    result (if (:cv-id old-stakeholder)
                             (srv.file/delete-file config conn {:id old-cv-id})
                             {:success? true})]
                (if-not (:success? result)
                  (assoc context
                         :success? false
                         :reason :failed-to-delete-old-cv
                         :error-details {:result result})
                  (let [cv-file (dom.file/base64->file cv :stakeholder :cvs :private)
                        result (srv.file/create-file config conn cv-file)]
                    (if (:success? result)
                      (assoc context :cv-file (dissoc cv-file :content))
                      (assoc context
                             :success? false
                             :reason :failed-to-create-new-cv-file
                             :error-details {:result result})))))))
          :rollback-fn
          (fn rollback-update-cv-file
            [{:keys [cv-file] :as context}]
            (when (seq cv-file)
              (srv.file/delete-file config conn {:id (:id cv-file)}))
            (dissoc context :cv-file))}
         {:txn-fn
          (fn get-old-stakeholder-tags
            [{:keys [stakeholder] :as context}]
            (let [result (try
                           {:success? true
                            :tags (db.resource.tag/get-resource-tags conn {:table "stakeholder_tag"
                                                                           :resource-col "stakeholder"
                                                                           :resource-id (:id stakeholder)
                                                                           :review_status "APPROVED"})}
                           (catch Exception t
                             {:success? false
                              :error-details {:exception-message (ex-message t)}}))]
              (if (:success? result)
                (assoc context :old-tags (:tags result))
                (assoc context
                       :success? false
                       :reason :failed-to-get-tags
                       :error-details {:result result}))))}
         {:txn-fn
          (fn save-stakeholder-tags
            [{:keys [stakeholder] :as context}]
            (if-not (contains? (set (keys stakeholder)) :tags)
              context
              (let [result (handler.stakeholder.tag/save-stakeholder-tags
                            conn
                            logger
                            mailjet-config
                            {:tags (:tags stakeholder)
                             :stakeholder-id (:id stakeholder)
                             :handle-errors? true
                             :update? true
                             :partial-tags-override-rel-cats partial-tags-override-rel-cats})]
                (if (:success? result)
                  context
                  (assoc context
                         :success? false
                         :reason :failed-to-save-tags
                         :error-details {:result result})))))
          :rollback-fn
          (fn rollback-save-stakeholder-tags
            [{:keys [old-tags stakeholder] :as context}]
            (handler.stakeholder.tag/save-stakeholder-tags
             conn
             logger
             mailjet-config
             {:tags old-tags
              :stakeholder-id (:id stakeholder)
              :handle-errors? true
              :update? true})
            (dissoc context :old-tags))}
         {:txn-fn
          (fn get-invitations
            [{:keys [old-stakeholder] :as context}]
            (if-not (= (:review-status old-stakeholder) "INVITED")
              context
              (let [result (db.invitation/get-invitation conn
                                                         {:filters {:stakeholders-ids [(:id old-stakeholder)]}})]
                (if (:success? result)
                  (assoc context
                         :invitation (:invitation result)
                         :invited? true)
                  (if (= (:reason result) :not-found)
                    (assoc context
                           :success? false
                           :reason :invitation-not-found
                           :error-details {:msg "User is on an INVITED state but no invitation record was found."})
                    (assoc context
                           :success? false
                           :reason (:reason result)
                           :error-details (:error-details result)))))))}
         {:txn-fn
          (fn unassign-unapproved-user-role
            [{:keys [old-stakeholder invited?] :as context}]
            (if-not invited?
              context
              (let [role-unassignments [{:role-name :unapproved-user
                                         :context-type :application
                                         :resource-id srv.permissions/root-app-resource-id
                                         :user-id (:id old-stakeholder)}]
                    result (first (srv.permissions/unassign-roles-from-users
                                   {:conn conn
                                    :logger logger}
                                   role-unassignments))]
                (if (:success? result)
                  context
                  (assoc context
                         :success? false
                         :reason :failed-to-remove-unapproved-user-role
                         :error-details {:result result})))))
          :rollback-fn
          (fn rollback-unassign-unapproved-user-role
            [{:keys [old-stakeholder invited?] :as context}]
            (if-not invited?
              context
              (let [role-assignments [{:role-name :unapproved-user
                                       :context-type :application
                                       :resource-id srv.permissions/root-app-resource-id
                                       :user-id (:id old-stakeholder)}]
                    result (first (srv.permissions/assign-roles-to-users
                                   {:conn conn
                                    :logger logger}
                                   role-assignments))]
                (when-not (:success? result)
                  (log logger :error :rollback-unassign-unapproved-user-role {:reason result})))))}
         {:txn-fn
          (fn assign-approved-user-role
            [{:keys [old-stakeholder invited?] :as context}]
            (if-not invited?
              context
              (let [role-assignments [{:role-name :approved-user
                                       :context-type :application
                                       :resource-id srv.permissions/root-app-resource-id
                                       :user-id (:id old-stakeholder)}]
                    result (first (srv.permissions/assign-roles-to-users
                                   {:conn conn
                                    :logger logger}
                                   role-assignments))]
                (if (:success? result)
                  context
                  (assoc context
                         :success? false
                         :reason :failed-to-add-approved-user-role
                         :error-details {:result result})))))
          :rollback-fn
          (fn rollback-assign-approved-user-role
            [{:keys [old-stakeholder invited?] :as context}]
            (if-not invited?
              context
              (let [role-unassignments [{:role-name :approved-user
                                         :context-type :application
                                         :resource-id srv.permissions/root-app-resource-id
                                         :user-id (:id old-stakeholder)}]
                    result (first (srv.permissions/unassign-roles-from-users
                                   {:conn conn
                                    :logger logger}
                                   role-unassignments))]
                (when-not (:success? result)
                  (log logger :error :rollback-assign-approved-user-role {:reason result}))
                context)))}
         {:txn-fn
          (fn update-stakeholder
            [{:keys [stakeholder old-stakeholder invited? picture-file cv-file] :as context}]
            (let [idp-usernames (-> (into (:idp-usernames old-stakeholder)
                                          (:idp_usernames stakeholder))
                                    distinct
                                    vec)
                  org-id (get-in stakeholder [:org :id])
                  affiliation org-id
                  picture-id (:id picture-file)
                  cv-id (:id cv-file)
                  affected (db.stakeholder/update-stakeholder conn
                                                              (cond-> (assoc stakeholder
                                                                             :affiliation affiliation
                                                                             :idp_usernames idp-usernames)
                                                                picture-id
                                                                (assoc :picture_id picture-id)

                                                                cv-id
                                                                (assoc :cv_id cv-id)

                                                                invited?
                                                                (assoc :review_status "APPROVED")))]
              (if (= 1 affected)
                context
                (assoc context
                       :success? false
                       :reason :failed-to-create-stakeholder))))
          :rollback-fn
          (fn rollback-update-stakeholder
            [{:keys [old-stakeholder] :as context}]
            (let [affected (db.stakeholder/update-stakeholder conn old-stakeholder)]
              (when-not (= 1 affected)
                (log logger :error :rollback-update-stakeholder {:id (:id old-stakeholder)})))
            context)}
         {:txn-fn
          (fn setup-invited-plastic-strategy-user
            [{:keys [old-stakeholder invitation invited?] :as context}]
            (if-not (and invited?
                         (= (:type invitation) :plastic-strategy))
              context
              (let [result (srv.ps/setup-invited-plastic-strategy-user config (:id old-stakeholder))]
                (if (:success? result)
                  context
                  (assoc context
                         :success? false
                         :reason :failed-to-setup-invited-plastic-strategy-user
                         :error-details {:result result})))))}]]
    (tht/thread-transactions logger transactions context)))

(defn get-stakeholder-profile [{:keys [db logger] :as config} stakeholder-id]
  (let [conn (:spec db)
        context {:success? true
                 :stakeholder-id stakeholder-id}
        transactions
        [{:txn-fn
          (fn get-stakeholder
            [{:keys [stakeholder-id] :as context}]
            (let [result (db.stakeholder/get-stakeholder conn
                                                         {:filters {:ids [stakeholder-id]}})]
              (if (:success? result)
                (assoc context :stakeholder (:stakeholder result))
                (if (= (:reason result) :not-found)
                  (assoc context
                         :success? false
                         :reason :not-found)
                  (assoc context
                         :success? false
                         :reason :failed-to-get-stakeholder
                         :error-details {:result result})))))}
         {:txn-fn
          (fn get-files
            [{:keys [stakeholder] :as context}]
            (let [picture-id (:picture-id stakeholder)
                  cv-id (:cv-id stakeholder)
                  files-ids (remove nil? [picture-id cv-id])]
              (if-not (seq files-ids)
                context
                (let [result (srv.file/get-files config conn {:filters {:ids files-ids}})]
                  (if-not (:success? result)
                    (assoc context
                           :success? false
                           :reason :failed-to-get-stakeholder-files
                           :error-details {:result result})
                    (let [files (medley/index-by :id (:files result))]
                      (-> context
                          (assoc-in [:stakeholder :picture] (get-in files [picture-id :url]))
                          (assoc-in [:stakeholder :cv] (get-in files [cv-id :url])))))))))}
         {:txn-fn
          (fn get-stakeholder-tags
            [{:keys [stakeholder] :as context}]
            (let [result (try
                           {:success? true
                            :tags (db.resource.tag/get-resource-tags conn
                                                                     {:table "stakeholder_tag"
                                                                      :resource-col "stakeholder"
                                                                      :resource-id (:id stakeholder)
                                                                      :review_status "APPROVED"})}
                           (catch Exception t
                             {:success? true
                              :error-details {:exception-message (ex-message t)}}))]
              (if (:success? result)
                (assoc-in context [:stakeholder :tags] (:tags result))
                (assoc context
                       :success? false
                       :reason :failed-to-get-stakeholder-tags
                       :error-details {:result result}))))}
         {:txn-fn
          (fn get-stakeholder-org
            [{:keys [stakeholder] :as context}]
            (if-not (:affiliation stakeholder)
              context
              (let [result (try
                             {:success? true
                              :org (db.organisation/organisation-by-id conn {:id (:affiliation stakeholder)})}
                             (catch Exception t
                               {:success? true
                                :error-details {:exception-message (ex-message t)}}))]
                (if (:success? result)
                  (assoc-in context [:stakeholder :org] (:org result))
                  (assoc context
                         :success? false
                         :reason :failed-to-get-stakeholder-org
                         :error-details {:result result})))))}]]
    (tht/thread-transactions logger transactions context)))

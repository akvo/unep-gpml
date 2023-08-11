(ns gpml.service.stakeholder
  (:require [gpml.db.organisation :as db.organisation]
            [gpml.db.resource.tag :as db.resource.tag]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.domain.file :as dom.file]
            [gpml.handler.organisation :as handler.org]
            [gpml.handler.stakeholder.tag :as handler.stakeholder.tag]
            [gpml.service.file :as srv.file]
            [gpml.service.permissions :as srv.permissions]
            [gpml.util :as util]
            [gpml.util.image :as util.image]
            [gpml.util.thread-transactions :as tht]
            [medley.core :as medley]))

(defn create-stakeholder
  [{:keys [db logger mailjet-config] :as config} stakeholder]
  (let [conn (:spec db)
        context {:success? true
                 :stakeholder stakeholder}
        transactions
        [{:txn-fn
          (fn create-picture-file
            [{{:keys [photo]} :stakeholder :as context}]
            (if-not (:payload photo)
              context
              (let [{:keys [payload user-agent]} photo
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
                    (if-not (:success? result)
                      (assoc context
                             :success? false
                             :reason :failed-to-assign-sth-owner-role-to-organisation
                             :error-details {:result result})
                      (let [success? (boolean (handler.org/update-org
                                               conn
                                               logger
                                               mailjet-config
                                               {:id (:id org)
                                                :created_by sth-id}))]
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
                       :error-details (:error-details result)))))}]]
    (tht/thread-transactions logger transactions context)))

(defn update-stakeholder
  [{:keys [db logger mailjet-config] :as config} stakeholder]
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
            [{{:keys [photo]} :stakeholder old-stakeholder :old-stakeholder :as context}]
            (if-not (:payload photo)
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
                  (let [{:keys [payload user-agent]} photo
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
          (fn create-cv-file
            [{{:keys [cv]} :stakeholder old-stakeholder :old-stakeholder :as context}]
            (if-not (seq cv)
              context
              (let [old-picture-id (:picture-id old-stakeholder)
                    result (if (:picture-id old-stakeholder)
                             (srv.file/delete-file config conn {:id old-picture-id})
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
          (fn rollback-create-cv-file
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
                                                                           :resource-id (:id stakeholder)})}
                           (catch Throwable t
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
            (if-not (seq (:tags stakeholder))
              context
              (let [result (handler.stakeholder.tag/save-stakeholder-tags
                            conn
                            logger
                            mailjet-config
                            {:tags (:tags stakeholder)
                             :stakeholder-id (:id stakeholder)
                             :handle-errors? true
                             :update? true})]
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
          (fn create-new-org-if-necessary
            [{:keys [stakeholder] :as context}]
            (if-not (= -1 (get-in stakeholder [:org :id]))
              context
              (let [org (:org stakeholder)
                    result (try
                             {:success? true
                              :org-id (handler.org/create conn logger mailjet-config (dissoc org :id))}
                             (catch Throwable t
                               {:success? false
                                :error-details {:exception-message (ex-message t)}}))]
                (if (:success? result)
                  (-> context
                      (assoc-in [:stakeholder :org :id] (:org-id result))
                      (assoc :new-org-id (:org-id result)))
                  (assoc context
                         :success? false
                         :reason :failed-to-create-stakeholder-organisation
                         :error-details {:result result})))))
          :rollback-fn
          (fn rollbac-create-org-if-necessary
            [{:keys [new-org-id] :as context}]
            (if new-org-id
              (do
                (db.organisation/delete-organisation conn {:id new-org-id})
                (dissoc context :new-org-id))
              context))}
         {:txn-fn
          (fn assign-role-to-new-organisation
            [{:keys [stakeholder new-org-id] :as context}]
            (if-not new-org-id
              context
              (let [result (first (srv.permissions/assign-roles-to-users-from-connections
                                   {:conn conn
                                    :logger logger}
                                   {:context-type :organisation
                                    :resource-id new-org-id
                                    :individual-connections [{:role "owner"
                                                              :stakeholder (:id stakeholder)}]}))]
                (if (:success? result)
                  context
                  (assoc context
                         :success? false
                         :reason :failed-to-assign-stakeholder-permissions-on-organisation
                         :error-details {:result result})))))
          :rollback-fn
          (fn rollback-assign-role-to-new-organisation
            [{:keys [stakeholder new-org-id] :as context}]
            (if new-org-id
              (do
                (srv.permissions/unassign-roles-from-users {:conn conn
                                                            :logger logger}
                                                           [{:role-name :resource-owner
                                                             :context-type :organisation
                                                             :resource-id new-org-id
                                                             :user-id (:id stakeholder)}])
                context)
              context))}
         {:txn-fn
          (fn get-experts
            [{:keys [old-stakeholder] :as context}]
            (let [expert? (seq (db.stakeholder/get-experts conn {:filters {:ids [(:id old-stakeholder)]}
                                                                 :page-size 0
                                                                 :offset 0}))]
              (assoc context :expert? expert?)))}
         {:txn-fn
          (fn update-stakeholder
            [{:keys [stakeholder old-stakeholder expert? picture-file cv-file] :as context}]
            (let [idp-usernames (-> (concat (:idp-usernames old-stakeholder)
                                            (:idp_usernames stakeholder))
                                    distinct
                                    vec)
                  org-id (get-in stakeholder [:org :id])
                  affiliation (if (and (:affiliation old-stakeholder)
                                       (not org-id))
                                nil
                                org-id)
                  picture-id (:id picture-file)
                  cv-id (:id cv-file)
                  affected (db.stakeholder/update-stakeholder conn
                                                              (cond-> (assoc stakeholder
                                                                             :affiliation affiliation
                                                                             :idp_usernames idp-usernames
                                                                             :non_member_organisation nil)
                                                                picture-id
                                                                (assoc :picture_id picture-id)

                                                                cv-id
                                                                (assoc :cv_id cv-id)

                                                                (and expert?
                                                                     (= (:review-status old-stakeholder) "INVITED"))
                                                                (assoc :review_status "APPROVED")))]
              (if (= 1 affected)
                context
                (assoc context
                       :success? false
                       :reason :failed-to-create-stakeholder))))}]]
    (tht/thread-transactions logger transactions context)))

(defn get-stakeholder-profile
  [{:keys [db logger] :as config} stakeholder-id]
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
                                                                      :resource-id (:id stakeholder)})}
                           (catch Throwable t
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
                             (catch Throwable t
                               {:success? true
                                :error-details {:exception-message (ex-message t)}}))]
                (if (:success? result)
                  (assoc-in context [:stakeholder :org] (:org result))
                  (assoc context
                         :success? false
                         :reason :failed-to-get-stakeholder-org
                         :error-details {:result result})))))}]]
    (tht/thread-transactions logger transactions context)))

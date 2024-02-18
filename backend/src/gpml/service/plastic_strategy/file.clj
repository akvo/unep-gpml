(ns gpml.service.plastic-strategy.file
  (:require
   [duct.logger :refer [log]]
   [gpml.db.plastic-strategy.file :as db.ps.file]
   [gpml.domain.file :as dom.file]
   [gpml.service.file :as srv.file]
   [gpml.util.thread-transactions :as tht]))

(defn create-ps-file [{:keys [db logger] :as config} ps-file]
  (let [transactions
        [{:txn-fn
          (fn tx-upload-ps-file-to-obj-storage
            [{{:keys [content]} :ps-file :as context}]
            (let [file (dom.file/base64->file content :plastic-strategy :docs :private)
                  result (srv.file/create-file config (:spec db) file)]
              (if (:success? result)
                (assoc-in context [:ps-file :file-id] (:id file))
                (assoc context
                       :success? false
                       :reason :failed-to-upload-ps-file
                       :error-details {:result result}))))
          :rollback-fn
          (fn rollback-upload-ps-file
            [{{:keys [id]} :ps-file :as context}]
            (let [result (srv.file/delete-file config (:spec db)
                                               {:filters {:id id}})]
              (when-not (:success? result)
                (log logger :error :failed-to-rollback-upload-ps-file {:result result})))
            (dissoc context :ps-file))}
         {:txn-fn
          (fn tx-create-ps-file
            [{:keys [ps-file] :as context}]
            (let [result (db.ps.file/create-ps-file (:spec db)
                                                    (dissoc ps-file :content))]
              (if (:success? result)
                context
                (assoc context
                       :success? false
                       :reason :failed-to-create-ps-file
                       :error-details {:result result}))))}]
        context {:success? true
                 :ps-file ps-file}]
    (tht/thread-transactions logger transactions context)))

(defn delete-ps-file [{:keys [db logger] :as config} ps-file]
  (let [transactions
        [{:txn-fn
          (fn tx-delete-ps-file
            [{:keys [ps-file] :as context}]
            (let [result (db.ps.file/delete-ps-file (:spec db) ps-file)]
              (if (:success? result)
                context
                (assoc context
                       :success? false
                       :reason :failed-to-delete-ps-file
                       :error-details {:result result}))))
          :rollback-fn
          (fn rollback-delete-ps-file
            [{:keys [ps-file] :as context}]
            (let [result (db.ps.file/create-ps-file (:spec db)
                                                    ps-file)]
              (when-not (:success? result)
                (log logger :error :failed-to-rollback-delete-ps-file {:result result})))
            context)}
         {:txn-fn
          (fn tx-delete-ps-file-from-obj-storage
            [{:keys [ps-file] :as context}]
            (let [result (srv.file/delete-file config
                                               (:spec db)
                                               {:id (:file-id ps-file)})]
              (if (:success? result)
                context
                (assoc context
                       :success? false
                       :reason :failed-to-delete-ps-file-from-obj-storage
                       :error-details {:result result}))))}]
        context {:success? true
                 :ps-file ps-file}]
    (tht/thread-transactions logger transactions context)))

(defn get-ps-files [{:keys [db] :as config} opts]
  (let [result (db.ps.file/get-ps-files (:spec db) opts)]
    (if-not (:success? result)
      result
      {:success? true
       :ps-files (srv.file/add-files-urls config (:ps-files result))})))

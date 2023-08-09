(ns gpml.service.file
  (:require [clj-gcp.storage.core :as storage-client]
            [duct.logger :refer [log]]
            [gpml.boundary.port.storage-client :as storage-client-ext]
            [gpml.db.file :as db.file]
            [gpml.util :as util]
            [gpml.util.thread-transactions :as tht])
  (:import [com.google.cloud WriteChannel]
           [java.nio ByteBuffer]))

(defn- file-content->byte-buffer
  [content]
  (cond
    (string? content)
    (let [file-content (util/decode-base64 content)
          size (count file-content)]
      {:byte-buffer (ByteBuffer/wrap file-content 0 size)
       :size size})

    (bytes? content)
    (let [size (count content)]
      {:byte-buffer (ByteBuffer/wrap content 0 size)
       :size size})

    :else
    {:byte-buffer content}))

(defn- get-bucket-name
  [{:keys [private-storage-bucket-name public-storage-bucket-name]} visibility]
  (if (= :private visibility)
    private-storage-bucket-name
    public-storage-bucket-name))

(defn persist-file
  [{:keys [logger]} conn file]
  (let [file-to-persist (select-keys file [:id :object-key :name
                                           :extension :alt-desc :visibility
                                           :type :created-at :last-updated-at])
        {:keys [success?] :as result} (db.file/create-file conn file-to-persist)]
    (when-not success?
      (log logger :error ::could-not-persist-file {:file file-to-persist
                                                   :error-details (:reason result)}))
    result))

(defn- get-public-file-url
  [{:keys [object-storage-host-name]} file]
  {:success? true
   :url (format "https://%s/%s" object-storage-host-name (:object-key file))})

(defn- get-private-file-url
  [{:keys [storage-client-adapter
           private-storage-bucket-name
           private-storage-signed-url-lifespan]} file]
  (storage-client-ext/get-blob-signed-url storage-client-adapter
                                          private-storage-bucket-name
                                          (:object-key file)
                                          private-storage-signed-url-lifespan))

(defn get-file-url
  [config file]
  (if (= (:visibility file) :private)
    (get-private-file-url config file)
    (get-public-file-url config file)))

(defn get-file
  [config conn search-opts]
  (db.file/get-file conn search-opts))

(defn- upload-file
  [{:keys [storage-client-adapter] :as config}
   {:keys [object-key content type visibility]}]
  (try
    (let [{:keys [byte-buffer _size]} (file-content->byte-buffer content)]
      (with-open [writer (storage-client/blob-writer
                          storage-client-adapter
                          (get-bucket-name config visibility)
                          object-key
                          {:content-type type})]
        (.write ^WriteChannel writer byte-buffer))
      {:success? true})
    (catch Throwable t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn create-file
  [{:keys [logger] :as config} conn file]
  (let [context {:success? true
                 :file file}
        transactions
        [{:txn-fn
          (fn create-file-persistence [{:keys [file] :as context}]
            (let [{:keys [success?] :as result} (persist-file config conn file)]
              (if success?
                context
                (do
                  (log logger :error ::persist-file-error {:file (dissoc file :content)
                                                           :reason (:error-details result)})
                  (merge context (assoc result :reason :could-not-persist-file))))))
          :rollback-fn
          (fn rollback-create-file-persistence [{:keys [file] :as context}]
            (let [{:keys [success?]} (db.file/delete-file conn (:id file))]
              (when-not success?
                (log logger :error ::rollback-create-file-persistence {:file (dissoc file :content)}))
              context))}
         {:txn-fn
          (fn create-file-obj-storage [{:keys [file] :as context}]
            (let [{:keys [success?] :as result} (upload-file config file)]
              (if success?
                context
                (do
                  (log logger :error ::upload-file-obj-storage-error {:file (dissoc file :content)
                                                                      :reason (:error-details result)})
                  (merge context (assoc result :reason :could-not-store-file-in-obj-storage))))))}]]
    (tht/thread-transactions logger transactions context)))

(defn delete-file
  [{:keys [storage-client-adapter logger] :as config} conn search-filters]
  (let [context {:success? true
                 :search-filters search-filters}
        transactions
        [{:txn-fn
          (fn get-file [{:keys [search-filters] :as context}]
            (let [{:keys [success? file] :as result} (db.file/get-file
                                                      conn
                                                      {:filters search-filters})]
              (if success?
                (assoc context :file file)
                (do
                  (log logger :error ::get-file-for-deletion-error {:search-filters search-filters
                                                                    :reason (:error-details result)})
                  (merge context result)))))}
         {:txn-fn
          (fn delete-persisted-file [{:keys [file] :as context}]
            (let [result (db.file/delete-file conn (:id file))]
              (if-not (:success? result)
                (do
                  (log logger :error ::delete-persisted-file-error {:object-key (:object-key file)
                                                                    :reason (:error-details result)})
                  (merge context (assoc result :reason :could-not-delete-persisted-file)))
                context)))
          :rollback-fn
          (fn rollback-delete-persisted-file [{:keys [file] :as context}]
            (let [{:keys [success?]} (db.file/create-file conn file)]
              (when-not success?
                (log logger :error ::rollback-delete-persisted-file {:file file}))
              context))}
         {:txn-fn
          (fn delete-file-in-obj-storage [{:keys [file] :as context}]
            (let [{:keys [success?] :as result}
                  (storage-client-ext/delete-blob storage-client-adapter
                                                  (get-bucket-name config (:visibility file))
                                                  (:object-key file))]
              (if-not success?
                (do
                  (log logger :error ::delete-file-in-obj-storage-error {:object-key (:object-key file)
                                                                         :reason (:error-details result)})
                  (merge context (assoc result :reason :could-not-delete-file-in-obj-storage)))
                context)))}]]
    (tht/thread-transactions logger transactions context)))

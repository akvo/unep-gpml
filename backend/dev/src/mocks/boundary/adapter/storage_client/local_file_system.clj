(ns mocks.boundary.adapter.storage-client.local-file-system
  (:require [clj-gcp.storage.core :as gcs]
            [clojure.java.io :as io]
            [gpml.boundary.port.storage-client :as port]
            [integrant.core :as ig])
  (:import [clj_gcp.storage.core FileSystemStorageClient]))

(defn- delete-blob
  [{:keys [base-path]} bucket blob-name]
  (try
    (let [file (io/file base-path bucket blob-name)]
      (io/delete-file file)
      {:success? true})
    (catch Exception e
      {:success? false
       :reason :could-not-delete-file
       :error-details {:exception-message (ex-message e)}})))

(extend-type FileSystemStorageClient
  port/StorageClientDeleteBlob
  (delete-blob [this bucket-name blob-name]
    (delete-blob this bucket-name blob-name)))

(defmethod ig/init-key :mocks.boundary.adapter.storage-client/local-file-system
  [_ {:keys [base-path]}]
  (gcs/->file-system-storage-client base-path))

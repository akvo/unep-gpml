(ns gpml.boundary.adapter.storage-client.gcs
  (:require [clj-gcp.storage.core]
            [gpml.boundary.port.storage-client :as port])
  (:import [clj_gcp.storage.core GCSStorageClient]
           [com.google.cloud.storage BlobId Storage]))

(defn- delete-blob
  [^Storage storage bucket-name blob-name]
  {:success? (.delete storage ^BlobId (BlobId/of bucket-name blob-name))})

(extend-type GCSStorageClient
  port/StorageClientDeleteBlob
  (delete-blob [{:keys [gservice]} bucket-name blob-name]
    (delete-blob gservice bucket-name blob-name)))

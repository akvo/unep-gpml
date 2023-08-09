(ns gpml.boundary.adapter.storage-client.gcs
  (:require [clj-gcp.storage.core]
            [gpml.boundary.port.storage-client :as port])
  (:import [clj_gcp.storage.core GCSStorageClient]
           [com.google.cloud.storage BlobId BlobInfo Storage Storage$SignUrlOption]
           [com.google.auth.oauth2 ServiceAccountCredentials]
           [java.util.concurrent TimeUnit]))

(defn- delete-blob
  [^Storage storage bucket-name blob-name]
  {:success? (.delete storage ^BlobId (BlobId/of bucket-name blob-name))})

(defn- get-blob-signed-url
  [^Storage storage bucket-name blob-name url-lifespan]
  (try
    (let [blob-id ^BlobId (BlobId/of bucket-name blob-name)
          blob-info ^BlobInfo (.build (BlobInfo/newBuilder blob-id))
          url (.signUrl storage
                        blob-info
                        url-lifespan
                        TimeUnit/MINUTES
                        (into-array [(Storage$SignUrlOption/withV4Signature)]))]
      {:success? true
       :url url})
    (catch Throwable t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(extend-type GCSStorageClient
  port/StorageClient
  (get-blob-signed-url [{:keys [gservice]} bucket-name blob-name url-lifespan]
    (get-blob-signed-url gservice bucket-name blob-name url-lifespan))
  (delete-blob [{:keys [gservice]} bucket-name blob-name]
    (delete-blob gservice bucket-name blob-name)))

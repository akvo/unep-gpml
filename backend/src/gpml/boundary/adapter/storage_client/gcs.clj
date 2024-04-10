(ns gpml.boundary.adapter.storage-client.gcs
  (:require
   [clj-gcp.storage.core]
   [gpml.boundary.port.storage-client :as port]
   [integrant.core :as ig]
   [taoensso.timbre :as timbre])
  (:import
   (com.google.cloud.storage BlobId BlobInfo Storage Storage$SignUrlOption)
   (java.util.concurrent TimeUnit)))

(defn delete-blob [{^Storage storage :gservice} bucket-name blob-name]
  {:pre [storage]}
  {:success? (.delete storage ^BlobId (BlobId/of bucket-name blob-name))})

(defn get-blob-signed-url [{^Storage storage :gservice} bucket-name blob-name url-lifespan]
  {:pre [storage]}
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
    (catch Exception t
      (timbre/error t)
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn ->gcs-storage-client []
  (vary-meta (clj-gcp.storage.core/->gcs-storage-client)
             merge
             {`port/get-blob-signed-url get-blob-signed-url
              `port/delete-blob         delete-blob}))

(defmethod ig/init-key ::client
  [_ _]
  (->gcs-storage-client))

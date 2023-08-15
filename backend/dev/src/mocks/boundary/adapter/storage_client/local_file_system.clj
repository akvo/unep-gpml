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

(defn- get-blob-signed-url
  [{:keys [base-path]} bucket-name blob-name]
  (try
    (let [file (io/file base-path bucket-name blob-name)]
      {:success? true
       :url (.toURL (.toURI file))})
    (catch Throwable t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(extend-type FileSystemStorageClient
  port/StorageClient
  (get-blob-signed-url [this bucket-name blob-name _url-lifespan]
    (get-blob-signed-url this bucket-name blob-name))
  (delete-blob [this bucket-name blob-name]
    (delete-blob this bucket-name blob-name)))

(defmethod ig/init-key :mocks.boundary.adapter.storage-client/local-file-system
  [_ {:keys [base-path]}]
  (gcs/->file-system-storage-client base-path))

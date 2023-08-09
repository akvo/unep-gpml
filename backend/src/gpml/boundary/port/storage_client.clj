(ns gpml.boundary.port.storage-client)

(defprotocol StorageClient
  "This is an extension for the [[clj-gcp.storage.core/StorageClient]]
  to have a delete operation implementation."
  (get-blob-signed-url [this bucket-name blob-name url-lifespan])
  (delete-blob [this bucket-name blob-name]))

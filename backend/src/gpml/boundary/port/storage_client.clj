(ns gpml.boundary.port.storage-client)

(defprotocol StorageClientDeleteBlob
  "This proctocol is an extension for
  the [[clj-gcp.storage.core/StorageClient]] to have a delete
  operation implementation."
  (delete-blob [this bucket-name blob-name]))

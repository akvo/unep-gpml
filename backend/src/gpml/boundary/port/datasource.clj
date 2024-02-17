(ns gpml.boundary.port.datasource)

(defprotocol Datasource
  :extend-via-metadata true
  (get-data [this opts]))

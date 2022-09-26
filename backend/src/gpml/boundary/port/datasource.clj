(ns gpml.boundary.port.datasource)

(defprotocol Datasource
  (get-data [this opts]))

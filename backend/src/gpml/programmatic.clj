(ns gpml.programmatic
  (:require
   [integrant.core :as ig]))

;; see local.example.edn for use case
(defmethod ig/init-key :gpml.handler.programmatic/common-middleware [_ v]
  v)

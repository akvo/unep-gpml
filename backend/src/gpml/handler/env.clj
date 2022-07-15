(ns gpml.handler.env
  (:require [integrant.core :as ig]
            [jsonista.core :as j]
            [ring.util.response :as resp]))

(defn make-env
  [opts]
  (format "var __ENV__ = %s;" (j/write-value-as-string opts)))

(defmethod ig/init-key ::get [_ opts]
  (fn [_]
    (-> (make-env opts)
        (resp/response)
        (resp/content-type "application/javascript")
        (resp/header "Cache-Control" "no-cache"))))

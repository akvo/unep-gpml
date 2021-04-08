(ns gpml.handler.archive
  (:require [gpml.db.archive :as db.archive]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defmethod ig/init-key :gpml.handler.archive/get [_ {:keys [db]}]
  (fn [{{:keys [query]} :parameters}]
    (let [archive (-> (db.archive/pages (:spec db) query) :result)]
      (resp/response archive))))

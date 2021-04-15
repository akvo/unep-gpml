(ns gpml.handler.submission
  (:require [gpml.db.submission :as db.submission]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defmethod ig/init-key :gpml.handler.submission/get [_ {:keys [db]}]
  (fn [{{:keys [query]} :parameters}]
    (let [submission (-> (db.submission/pages (:spec db) query) :result)]
      (resp/response submission))))

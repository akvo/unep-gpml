(ns gpml.handler.archive
  (:require [gpml.db.archive :as db.archive]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defmethod ig/init-key :gpml.handler.archive/get [_ {:keys [db]}]
  (fn [_]
    (let [archive (db.archive/all (:spec db))
          _ (tap> archive)]
      (resp/response archive))))

(ns gpml.db
  (:require
   [integrant.core :as ig]))

(defmethod ig/init-key :gpml.db/spec [_ {:keys [db]}]
  (:spec db))

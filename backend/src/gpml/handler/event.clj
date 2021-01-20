(ns gpml.handler.event
  (:require [integrant.core :as ig]
            ;; [ring.util.response :as resp]
            [gpml.db.event :as db.event]))

(defn create-event [conn data]
  (db.event/new-event conn data))

(defmethod ig/init-key :gpml.handler.event/post [_ {:keys [db]}]
  (fn [{:keys [jwt-claims body-params]}]
    (tap> jwt-claims)
    (create-event (:spec db) body-params)
    {:status 201 :body {:message "New event created"}}))

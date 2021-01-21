(ns gpml.handler.event
  (:require [integrant.core :as ig]
            ;; [ring.util.response :as resp]
            [gpml.db.event :as db.event]))

(defn create-event [conn data]
  (let [tags (:tags data)
        event-id (->> data (db.event/new-event conn) first :id)]
    (when (not-empty tags)
      (db.event/add-event-tags conn {:tags (map #(vector event-id %) tags)}))))

(defmethod ig/init-key :gpml.handler.event/post [_ {:keys [db]}]
(fn [{:keys [jwt-claims body-params]}]
  (tap> jwt-claims)
  (create-event (:spec db) body-params)
  {:status 201 :body {:message "New event created"}}))

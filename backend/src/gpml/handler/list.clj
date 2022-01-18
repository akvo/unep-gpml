(ns gpml.handler.list
  (:require [gpml.db.event :as db.event]
            [gpml.db.initiative :as db.initiative]
            [gpml.db.policy :as db.policy]
            [gpml.db.resource :as db.resource]
            [gpml.db.technology :as db.technology]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defmethod ig/init-key :gpml.handler.list/get [_ {:keys [db]}]
  (fn [{{:keys [path]} :parameters}]
    (let [conn (:spec db)
          topic (:topic-type path)]
      (resp/response (case topic
                       "technical_resource" (db.resource/all-technical-resources conn)
                       "financing_resource" (db.resource/all-financing-resources conn)
                       "action_plan" (db.resource/all-action-plans conn)
                       "event" (db.event/all-events conn)
                       "policy" (db.policy/all-policies conn)
                       "technology" (db.technology/all-technologies conn)
                       "project" (db.initiative/all-initiatives conn)
                       (db.resource/all-resources conn))))))

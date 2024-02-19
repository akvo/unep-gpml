(ns gpml.timbre-logger.json
  (:require
   [integrant.core :as ig]
   [timbre-json-appender.core :as timbre-json-appender]))

(defmethod ig/init-key ::logger [_ _]
  (timbre-json-appender/json-appender {:inline-args? true}))

(ns gpml.scheduler
  (:require [integrant.core :as ig]
            [twarc.core :as twarc]))

(defmethod ig/init-key :gpml/scheduler [_ {:keys [thread-count]}]
  (-> (twarc/make-scheduler {:threadPool.threadCount thread-count
                             :plugin.triggHistory.class "org.quartz.plugins.history.LoggingTriggerHistoryPlugin"
                             :plugin.jobHistory.class "org.quartz.plugins.history.LoggingJobHistoryPlugin"})
      (twarc/start)))

(defmethod ig/halt-key! :gpml/scheduler [_ scheduler]
  (when scheduler
    (twarc/stop scheduler)))

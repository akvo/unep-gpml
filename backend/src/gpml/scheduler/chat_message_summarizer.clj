(ns gpml.scheduler.chat-message-summarizer
  (:require
   [duct.logger :refer [log]]
   [integrant.core :as ig]
   [twarc.core :refer [defjob]]))

(defn summarize-chat-messages [_config])

(defjob chat-message-summarization
  [_scheduler config]
  (summarize-chat-messages config))

(defn- schedule-job [{:keys [scheduler logger] :as config} scheduler-config]
  (let [time-zone (java.util.TimeZone/getTimeZone ^String (:time-zone scheduler-config))]
    (log logger :report :chat-message-summarization scheduler-config)
    (chat-message-summarization scheduler
                                [config]
                                :trigger {:cron {:expression (:cron scheduler-config)
                                                 :misfire-handling :fire-and-process
                                                 :time-zone time-zone}}
                                :job {:identity (:identity scheduler-config)})))

(defmethod ig/init-key :gpml.scheduler/chat-message-summarizer
  [_ {:keys [config scheduler-config]}]
  (schedule-job config scheduler-config))

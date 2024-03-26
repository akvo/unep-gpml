(ns gpml.scheduler
  (:require
   [duct.logger :refer [log]]
   [integrant.core :as ig]
   [twarc.core :as twarc]
   [twarc.impl.core]))

(defmethod ig/init-key :gpml/scheduler [_ impl]
  impl)

(defmethod ig/halt-key! :gpml/scheduler [_ _]
  nil)

(defmethod ig/init-key :gpml/twarc-scheduler [_ {:keys [thread-count disabled logger]}]
  (log logger :report :starting-twarc-scheduler {})
  (when-not disabled
    (-> (twarc/make-scheduler {:threadPool.threadCount thread-count
                               :plugin.triggHistory.class "org.quartz.plugins.history.LoggingTriggerHistoryPlugin"
                               :plugin.jobHistory.class "org.quartz.plugins.history.LoggingJobHistoryPlugin"})
        (twarc/start))))

(defmethod ig/halt-key! :gpml/twarc-scheduler [_ scheduler]
  (some-> scheduler twarc/stop))

(defn new-mock-scheduler []
  (reify org.quartz.Scheduler
    (^String getSchedulerName [this]
      (str `noop))
    (^boolean checkExists [this ^org.quartz.JobKey arg]
      false)
    (^boolean checkExists [this ^org.quartz.TriggerKey arg]
      false)
    (^boolean deleteCalendar [this ^String arg]
      true)
    (^boolean deleteJob [this ^org.quartz.JobKey arg]
      true)
    (^boolean deleteJobs [this ^java.util.List arg]
      true)
    (^boolean interrupt [this ^String arg]
      true)
    (^boolean interrupt [this ^org.quartz.JobKey arg]
      true)
    (^boolean isStarted [this]
      true)
    (^boolean unscheduleJob [this ^org.quartz.TriggerKey arg]
      true)
    (^boolean unscheduleJobs [this ^java.util.List arg]
      true)
    (^java.util.Date rescheduleJob [this ^org.quartz.TriggerKey arg0 ^org.quartz.Trigger arg1]
      (java.util.Date.))
    (^java.util.Date scheduleJob [this ^org.quartz.JobDetail arg0 ^org.quartz.Trigger arg1]
      (java.util.Date.))
    (^java.util.Date scheduleJob [this ^org.quartz.Trigger arg]
      (java.util.Date.))
    (^java.util.List getCurrentlyExecutingJobs [this]
      [])
    (^java.util.List getTriggerGroupNames [this]
      [])
    (^java.util.List getTriggersOfJob [this ^org.quartz.JobKey arg]
      [])
    (^java.util.Set getJobKeys [this ^org.quartz.impl.matchers.GroupMatcher arg]
      #{})
    (^java.util.Set getPausedTriggerGroups [this]
      #{})
    (^java.util.Set getTriggerKeys [this ^org.quartz.impl.matchers.GroupMatcher arg]
      #{})
    (^org.quartz.Calendar getCalendar [this ^String arg]
      (reify org.quartz.Calendar
        (^String getDescription [this]
          (str `noop))
        (^boolean isTimeIncluded [this ^long arg]
          true)
        (^long getNextIncludedTime [this ^long arg]
          0)
        (^org.quartz.Calendar getBaseCalendar [this]
          this)
        (^void setBaseCalendar [this ^org.quartz.Calendar arg])
        (^void setDescription [this ^String arg])
        (clone [this]
          this)))
    (^org.quartz.JobDetail getJobDetail [this ^org.quartz.JobKey arg])
    (^org.quartz.SchedulerContext getContext [this] (org.quartz.SchedulerContext.))
    (^org.quartz.SchedulerMetaData getMetaData [this]
      (org.quartz.SchedulerMetaData. (str `noop)
                                     (str `noop)
                                     Class
                                     false
                                     true
                                     false
                                     false
                                     (java.util.Date.)
                                     1
                                     Class
                                     false
                                     false
                                     Class
                                     1
                                     "1.0"))
    (^org.quartz.Trigger getTrigger [this ^org.quartz.TriggerKey arg])
    (^org.quartz.Trigger$TriggerState getTriggerState [this ^org.quartz.TriggerKey arg]
      org.quartz.Trigger$TriggerState/NORMAL)
    (^void addCalendar [this ^String arg0 ^org.quartz.Calendar arg1 ^boolean arg2 ^boolean arg3])
    (^void addJob [this ^org.quartz.JobDetail arg0 ^boolean arg1 ^boolean arg2])
    (^void addJob [this ^org.quartz.JobDetail arg0 ^boolean arg1])
    (^void clear [this])
    (^void pauseAll [this])
    (^void pauseJob [this ^org.quartz.JobKey arg])
    (^void pauseJobs [this ^org.quartz.impl.matchers.GroupMatcher arg])
    (^void pauseTrigger [this ^org.quartz.TriggerKey arg])
    (^void pauseTriggers [this ^org.quartz.impl.matchers.GroupMatcher arg])
    (^void resetTriggerFromErrorState [this ^org.quartz.TriggerKey arg])
    (^void resumeJob [this ^org.quartz.JobKey arg])
    (^void resumeJobs [this ^org.quartz.impl.matchers.GroupMatcher arg])
    (^void resumeTrigger [this ^org.quartz.TriggerKey arg])
    (^void resumeTriggers [this ^org.quartz.impl.matchers.GroupMatcher arg])
    (^void scheduleJob [this ^org.quartz.JobDetail arg0 ^java.util.Set arg1 ^boolean arg2])
    (^void scheduleJobs [this ^java.util.Map arg0 ^boolean arg1])
    (^void setJobFactory [this ^org.quartz.spi.JobFactory arg])
    (^void shutdown [this ^boolean arg])
    (^void start [this])
    (^void startDelayed [this ^int arg])
    (^void triggerJob [this ^org.quartz.JobKey arg0 ^org.quartz.JobDataMap arg1])
    (^void triggerJob [this ^org.quartz.JobKey arg])
    (getCalendarNames [this])
    (getJobGroupNames [this])
    (getListenerManager [this])
    (getSchedulerInstanceId [this])
    (isInStandbyMode [this])
    (isShutdown [this])
    (resumeAll [this])
    (shutdown [this])
    (standby [this])))

(defmethod ig/init-key :gpml/noop-scheduler [_ _]
  (twarc.impl.core/map->Scheduler {:twarc/quartz (new-mock-scheduler)
                                   :twarc/name (str `noop)
                                   :twarc/listeners (atom {})}))

(defmethod ig/halt-key! :gpml/noop-scheduler [_ _]
  nil)

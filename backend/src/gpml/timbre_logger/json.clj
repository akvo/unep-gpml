(ns gpml.timbre-logger.json
  (:require
   [integrant.core :as ig]
   [taoensso.timbre :as timbre]
   [timbre-json-appender.core :as timbre-json-appender]))

(def key-banlist
  #{:password "password"})

(defmethod ig/init-key ::logger [_ {:keys [pretty]}]
  (timbre-json-appender/json-appender {:inline-args? true
                                       :pretty pretty
                                       :level-key           :level
                                       :msg-key             :msg
                                       :json-error-fn (fn [^Throwable e]
                                                        ;; TODO log to Sentry too.
                                                        ;; (do it directly, w/o Timbre to prevent recursion)
                                                        (try
                                                          (timbre/error :json-logging-failed e)
                                                          (catch Exception _ ;; possibly, prevent recursion
                                                            nil)))
                                       :should-log-field-fn (fn [field-name _data]
                                                              (not (contains? key-banlist field-name))) ;; by default :file/:line are omitted (except for exceptions) - avoid that, while gaining some security
                                       :ex-data-field-fn    timbre-json-appender/default-ex-data-field-fn
                                       :key-names           timbre-json-appender/default-key-names}))

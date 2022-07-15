(ns gpml.handler.monitoring
  (:require [hugsql.adapter :as adapter]
            [hugsql.adapter.clojure-java-jdbc :as adp]
            [hugsql.core :as hugsql]
            [iapetos.collector.exceptions :as ex]
            [iapetos.collector.jvm :as jvm]
            [iapetos.collector.ring :as ring]
            [iapetos.core :as prometheus]
            [iapetos.registry :as registry]
            [integrant.core :as ig]
            [taoensso.timbre :as timbre]
            [taoensso.timbre.appenders.3rd-party.sentry :as sentry])
  (:import [com.zaxxer.hikari.metrics.prometheus PrometheusMetricsTrackerFactory]
           [io.prometheus.client.jetty JettyStatisticsCollector QueuedThreadPoolStatisticsCollector]
           [org.eclipse.jetty.server.handler StatisticsHandler]))

(defmethod ig/init-key ::collector [_ _]
  (->
   (prometheus/collector-registry)
   (jvm/initialize)
   (ring/initialize)
   (iapetos.core/register
    (iapetos.core/histogram
     :sql/run-duration
     {:description "SQL query duration"
      :labels [:query]})
    (iapetos.core/counter
     :sql/run-total
     {:description "the total number of finished runs of the observed sql query."
      :labels [:query :result]})
    (iapetos.collector.exceptions/exception-counter
     :sql/exceptions-total
     {:description "the total number and type of exceptions for the observed sql query."
      :labels [:query]}))))

(defmethod ig/init-key ::middleware [_ {:keys [collector]}]
  #(-> %
       (ring/wrap-metrics collector)))

(defmacro metrics
  [metrics-collector options & body]
  `(if ~metrics-collector
     (let [labels# {:query (:fn-name ~options) :result "success"}
           failure-labels# {:query (:fn-name ~options) :result "failure"}]
       (prometheus/with-success-counter (~metrics-collector :sql/run-total labels#)
         (prometheus/with-failure-counter (~metrics-collector :sql/run-total failure-labels#)
           (ex/with-exceptions (~metrics-collector :sql/exceptions-total labels#)
             (prometheus/with-duration (~metrics-collector :sql/run-duration labels#)
               ~@body)))))
     (do ~@body)))

(deftype MetricsAdapter [metrics-collector jdbc-adapter]

  adapter/HugsqlAdapter
  (execute [_ db sqlvec options]
    (metrics metrics-collector options
             (adapter/execute jdbc-adapter db sqlvec options)))

  (query [_ db sqlvec options]
    (metrics metrics-collector options
             (adapter/query jdbc-adapter db sqlvec options)))

  (result-one [_ result options]
    (adapter/result-one jdbc-adapter result options))

  (result-many [_ result options]
    (adapter/result-many jdbc-adapter result options))

  (result-affected [_ result options]
    (adapter/result-affected jdbc-adapter result options))

  (result-raw [_ result options]
    (adapter/result-raw jdbc-adapter result options))

  (on-exception [_ exception]
    (adapter/on-exception jdbc-adapter exception)))

(defmethod ig/init-key ::hikaricp
  [_ {:keys [hikari-cp metrics-collector]}]
  (-> hikari-cp
      :spec
      :datasource
      (.unwrap javax.sql.DataSource)
      (.setMetricsTrackerFactory
       (PrometheusMetricsTrackerFactory. (registry/raw metrics-collector))))
  (hugsql/set-adapter!
   (MetricsAdapter.
    metrics-collector
    (adp/hugsql-adapter-clojure-java-jdbc)))
  hikari-cp)

(defn configure-stats [jetty-server collector]
  (let [raw-collector (registry/raw collector)
        stats-handler (doto
                       (StatisticsHandler.)
                        (.setHandler (.getHandler jetty-server)))]
    (.setHandler jetty-server stats-handler)
    (.register (JettyStatisticsCollector. stats-handler) raw-collector)
    (.register (QueuedThreadPoolStatisticsCollector. (.getThreadPool jetty-server) "unep-gpml") raw-collector)))

(defmethod ig/init-key ::jetty-configurator [_ {:keys [collector]}]
  (fn [jetty-server]
    (configure-stats jetty-server collector)))

(defmethod ig/init-key ::sentry-logger [_ {:keys [dsn version host env]}]
  (assert dsn)
  (timbre/handle-uncaught-jvm-exceptions!)
  (-> (sentry/sentry-appender dsn
                              {:environment env
                               :release version
                               :event-fn (fn [event]
                                           (assoc event :server_name host))})
      (assoc :min-level :error)))

(comment

  (println
   (slurp "http://localhost:3000/metrics")))

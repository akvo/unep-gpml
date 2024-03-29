(ns gpml.handler.monitoring
  (:require
   [hugsql.adapter :as adapter]
   [hugsql.adapter.clojure-java-jdbc :as adp]
   [hugsql.core :as hugsql]
   [iapetos.collector.exceptions :as ex]
   [iapetos.collector.jvm :as jvm]
   [iapetos.collector.ring :as ring]
   [iapetos.core :as prometheus]
   [iapetos.registry :as registry]
   [integrant.core :as ig]
   [raven-clj.core :as raven]
   [raven-clj.interfaces :as interfaces]
   [taoensso.encore :as enc]
   [taoensso.timbre :as timbre]
   [taoensso.timbre.appenders.community.sentry :as sentry])
  (:import
   (com.zaxxer.hikari HikariDataSource)
   (com.zaxxer.hikari.metrics.prometheus PrometheusMetricsTrackerFactory)
   (io.prometheus.client.jetty JettyStatisticsCollector QueuedThreadPoolStatisticsCollector)
   (org.eclipse.jetty.server Server)
   (org.eclipse.jetty.server.handler StatisticsHandler)))

(defmethod ig/init-key ::collector [_ _]
  (-> (prometheus/collector-registry)
      (jvm/initialize)
      (ring/initialize)
      (iapetos.core/register (iapetos.core/histogram :sql/run-duration
                                                     {:description "SQL query duration"
                                                      :labels [:query]})
                             (iapetos.core/counter :sql/run-total
                                                   {:description "the total number of finished runs of the observed sql query."
                                                    :labels [:query :result]})
                             (iapetos.collector.exceptions/exception-counter :sql/exceptions-total
                                                                             {:description "the total number and type of exceptions for the observed sql query."
                                                                              :labels [:query]}))))

(defmethod ig/init-key ::middleware [_ {:keys [collector]}]
  #(-> %
       (ring/wrap-metrics collector)))

(defmacro metrics
  {:style/indent 2}
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
  (let [^javax.sql.DataSource datasource (get-in hikari-cp [:spec :datasource])]
    (-> datasource
        ^HikariDataSource (.unwrap javax.sql.DataSource)
        (.setMetricsTrackerFactory
         (PrometheusMetricsTrackerFactory. (registry/raw metrics-collector))))
    (hugsql/set-adapter!
     (MetricsAdapter.
      metrics-collector
      (adp/hugsql-adapter-clojure-java-jdbc)))
    hikari-cp))

(defn configure-stats [^Server jetty-server collector]
  (let [raw-collector (registry/raw collector)
        stats-handler (doto (StatisticsHandler.)
                        (.setHandler (.getHandler jetty-server)))]
    (.setHandler jetty-server stats-handler)
    (.register (JettyStatisticsCollector. stats-handler) raw-collector)
    (.register (QueuedThreadPoolStatisticsCollector. (.getThreadPool jetty-server) "unep-gpml") raw-collector)))

(defmethod ig/init-key ::jetty-configurator [_ {:keys [collector]}]
  (fn [jetty-server]
    (configure-stats jetty-server collector)))

(defn sentry-appender
  "Adds, over the original `#'sentry/sentry-appender`,
  the ability to skip messages that don't contain exceptions.

  It also preserves `:file` and `:line` info.

  Finally, it also propagates the `:context`."
  [dsn & [opts]]
  (let [{:keys [event-fn] :or {event-fn identity}} opts
        base-event
        (->> (select-keys opts [:tags :environment :release :modules])
             (filter (comp not nil? second))
             (into {}))]

    {:enabled?  true
     :async?    true
     :min-level :warn ;; Reasonable default given how Sentry works
     :fn
     (fn [data]
       (let [{:keys [level ?err msg_ ?ns-str ?file ?line context]} data

             ?ex-data (ex-data ?err)
             extra
             (cond-> context
               ?ex-data
               (assoc ::ex-data (enc/get-substr-by-idx (str ?ex-data) 0 4096))
               true (assoc ::file ?file
                           ::line ?line))

             event
             (as-> base-event event
               ;; Doc: https://develop.sentry.dev/sdk/event-payloads/
               (merge event
                      {:message (force msg_)
                       :logger  ?ns-str
                       :level   (get @#'sentry/timbre->sentry-levels level)
                       :extra extra})

               (if ?err
                 (interfaces/stacktrace event ?err)
                 event)

               (event-fn event))]

         (when ?err ;; Only post to Sentry actual exceptions - not simply messages of ERROR level
           (raven/capture dsn event))))}))

(defmethod ig/init-key ::sentry-logger [_ {:keys [dsn version host env]}]
  (assert dsn)
  (timbre/handle-uncaught-jvm-exceptions!)
  (-> (sentry-appender dsn
                       {:environment env
                        :release version
                        :event-fn (fn [event]
                                    (assoc event :server_name host))})
      (assoc :min-level :error)))

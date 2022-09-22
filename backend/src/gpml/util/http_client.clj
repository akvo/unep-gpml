(ns gpml.util.http-client
  (:require [clj-http.client :as client]
            [diehard.core :as dh]
            [duct.logger :refer [log]]
            [gpml.util :as util]
            [jsonista.core :as json]))

(def ^:const default-timeout
  "Default timeout value for an connection attempt"
  5000)

(def ^:const default-max-retries
  "Default limit of attempts for the requests"
  10)

(def ^:const default-initial-delay
  "Initial delay for retries, specified in milliseconds."
  500)

(def ^:const default-max-delay
  "Maximun delay for a connection retry, specified in milliseconds. We
  are using truncated binary exponential backoff, with `max-delay` as
  the ceiling for the retry delay."
  1000)

(def ^:const default-backoff-ms
  [default-initial-delay default-max-delay 2.0])

(def ^:const gateway-timeout
  "504 Gateway timeout The server, while acting as a gateway or proxy,
  did not receive a timely response from the upstream server specified
  by the URI (e.g. HTTP, FTP, LDAP) or some other auxiliary
  server (e.g. DNS) it needed to access in attempting to complete the
  request."
  504)

(def ^:const bad-gateway
  "502 Bad gateway The server, while acting as a gateway or proxy,
  received an invalid response from the upstream server it accessed in
  attempting to fulfill the request."
  502)

(defn- fallback
  [_value exception]
  (let [status (condp instance? exception
                 ;; Socket layer related exceptions
                 java.net.UnknownHostException :unknown-host
                 java.net.ConnectException :connection-refused
                 java.net.SocketTimeoutException gateway-timeout

                 ;; Any other kind of exception
                 java.lang.Exception :unknown-reason)]
    {:status status}))

(defn- retry-policy
  [max-retries backoff-ms]
  (dh/retry-policy-from-config
   {:max-retries max-retries
    :backoff-ms backoff-ms
    :retry-on [java.net.SocketTimeoutException]}))

(defmethod client/coerce-response-body :json-keyword-keys
  [_req resp]
  (util/update-if-not-nil resp :body json/read-value json/keyword-keys-object-mapper))

(defn do-request
  "Like [[clj-http.client/request]] but with retries. Optionally accepts
  a map with retry configuration. Otherwise, it sets a default
  configuration."
  ([logger req] (do-request logger req {}))
  ([logger req {:keys [timeout max-retries backoff-ms]
                :or {timeout default-timeout
                     max-retries default-max-retries
                     backoff-ms default-backoff-ms}}]
   (let [request-id (util/uuid)]
     (dh/with-retry {:policy (retry-policy max-retries backoff-ms)
                     :fallback fallback
                     :on-retry
                     (fn [_ ex]
                       (log logger :error ::do-request-retry {:request-id request-id
                                                              :request req
                                                              :exception (class ex)}))
                     :on-failure
                     (fn [_ ex]
                       (log logger :error ::do-request-failure {:request-id request-id
                                                                :request req
                                                                :exception (class ex)}))}
       (client/request (merge req {:content-type :json
                                   :connection-timeout timeout
                                   :socket-timeout timeout
                                   :throw-exceptions false}))))))

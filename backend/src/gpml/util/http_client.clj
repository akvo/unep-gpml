(ns gpml.util.http-client
  (:require
   [clj-http.client :as client]
   [diehard.core :as dh]
   [duct.logger :refer [log]]
   [gpml.util :as util]
   [gpml.util.json :as json]
   [gpml.util.malli :refer [check!]]
   [taoensso.timbre :as timbre]))

(def default-timeout
  "Default timeout value for an connection attempt"
  5000)

(def default-max-retries
  "Default limit of attempts for the requests"
  10)

(def default-initial-delay
  "Initial delay for retries, specified in milliseconds."
  500)

(def default-max-delay
  "Maximun delay for a connection retry, specified in milliseconds. We
  are using truncated binary exponential backoff, with `max-delay` as
  the ceiling for the retry delay."
  1000)

(def default-backoff-ms
  [default-initial-delay default-max-delay 2.0])

(def gateway-timeout
  "504 Gateway timeout The server, while acting as a gateway or proxy,
  did not receive a timely response from the upstream server specified
  by the URI (e.g. HTTP, FTP, LDAP) or some other auxiliary
  server (e.g. DNS) it needed to access in attempting to complete the
  request."
  504)

(def bad-gateway
  "502 Bad gateway The server, while acting as a gateway or proxy,
  received an invalid response from the upstream server it accessed in
  attempting to fulfill the request."
  502)

(defn- fallback [_value exception]
  (let [reason (condp instance? exception
                 ;; Socket layer related exceptions
                 java.net.UnknownHostException :unknown-host
                 java.net.ConnectException :connection-refused
                 java.net.SocketTimeoutException :gateway-timeout

                 ;; Any other kind of exception
                 java.lang.Exception :unknown-reason)]
    {:status 500 ;; use a reasonable number (this used to be a keyword - changed to avoid errors on arithmetic)
     :reason reason}))

(defn- retry-policy [max-retries backoff-ms]
  (dh/retry-policy-from-config
   {:max-retries max-retries
    :backoff-ms backoff-ms
    :retry-on [java.net.SocketTimeoutException]}))

(defmethod client/coerce-response-body :json-keyword-keys
  [_req resp]
  (try
    (-> resp
        (update :body (fn [x]
                        (cond-> x
                          (instance? java.io.InputStream x)
                          slurp)))
        (update :body (fn [x]
                        (cond-> x
                          (string? x) json/<-json))))
    (catch com.fasterxml.jackson.core.JsonParseException e
      (timbre/with-context+ {:resp resp}
        (timbre/error e))
      (throw e))))

;; XXX behaves very badly on 404, it's a combination of things
;; try not performing :json-keyword-keys if :body is absent or not a string
(defn request
  "Like `clj-http.client/request`, but with retries.

  Optionally accepts a map with retry configuration.
  Otherwise, it sets a default configuration."
  ([logger req]
   (request logger req {}))

  ([logger req {:keys [timeout max-retries backoff-ms]
                :or {timeout default-timeout
                     max-retries default-max-retries
                     backoff-ms default-backoff-ms}
                :as retry-config}]
   {:pre [(check! [:map {:closed true}
                   [:timeout {:optional true} any?]
                   [:max-retries {:optional true} any?]
                   [:backoff-ms {:optional true} any?]]
                  retry-config)]}
   (let [req (cond-> req
               (not (:method req)) (assoc :method (if (:body req)
                                                    :post
                                                    :get)))
         request-id (util/uuid)
         logged-req (select-keys req [:url :method])]
     (dh/with-retry {:policy (retry-policy max-retries backoff-ms)
                     :fallback fallback
                     :on-retry (fn [_ e]
                                 (timbre/with-context+ {:request-id request-id
                                                        :request req
                                                        :timeout timeout}
                                   (log logger :error :request-retry e)))
                     :on-failure (fn [_ e]
                                   (timbre/with-context+ {:request-id request-id
                                                          :request req
                                                          :timeout timeout}
                                     (log logger :error :request-failure e)))}
       (timbre/with-context+ {:request-id request-id
                              :request req}
         (log logger :info :requesting logged-req)
         (let [response (client/request (merge req {:content-type :json
                                                    :connection-timeout timeout
                                                    :connection-request-timeout timeout
                                                    :socket-timeout timeout
                                                    :throw-exceptions false}))]
           (timbre/with-context+ {:response response}
             (let [success? (try
                              (<= 200 (:status response) 299)
                              (catch Exception _
                                false))]
               (log logger
                    (if success?
                      :info
                      :warn)
                    :request-completed
                    (merge logged-req (select-keys response [:status])))))
           response))))))

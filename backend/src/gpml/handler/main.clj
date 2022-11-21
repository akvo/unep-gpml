(ns gpml.handler.main
  (:require [duct.logger :as log]
            [iapetos.collector.ring :as prometheus-ring]
            [integrant.core :as ig]
            [malli.util :as mu]
            [muuntaja.core :as m]
            [reitit.coercion.malli]
            [reitit.ring :as ring]
            [reitit.ring.coercion :as coercion]
            [reitit.ring.middleware.exception :as exception]
            [reitit.ring.middleware.multipart :as multipart]
            [reitit.ring.middleware.muuntaja :as muuntaja]
            [reitit.ring.middleware.parameters :as parameters]
            [reitit.swagger :as swagger]
            [reitit.swagger-ui :as swagger-ui]
            [ring.middleware.cors :as cors]
            [ring.util.response :as resp]
            [taoensso.timbre :as timbre]))

(defn root
  [_]
  (resp/response {:status "OK"}))

(defn router
  [routes collector]
  (ring/router
   routes
   {:data {:muuntaja m/instance

           :coercion (reitit.coercion.malli/create
                      {:error-keys #{:humanized}
                       :compile mu/open-schema
                       :skip-extra-values true
                       :default-values true
                       :encode-error (fn [error]
                                       {:success? false
                                        :reason :bad-parameter-type-or-format
                                        :error-details (:humanized error)})})

           :middleware [;; CORS
                        [cors/wrap-cors
                         :access-control-allow-origin [#".*"]
                         :access-control-allow-methods [:get :post :delete :put]]
                        ;; swagger feature
                        swagger/swagger-feature
                         ;; query-params & form-params
                        parameters/parameters-middleware
                         ;; content-negotiation
                        muuntaja/format-negotiate-middleware
                         ;; encoding response body
                        muuntaja/format-response-middleware
                         ;; exception handling
                        (exception/create-exception-middleware
                         (merge
                          exception/default-handlers
                          {;; print stack-traces for all exceptions
                           ::exception/wrap (fn [handler e request]
                                              (try
                                                (let [response (handler e request)]
                                                  (when (>= (:status response 500) 500)
                                                    (timbre/error e))
                                                  response)
                                                (catch Throwable t
                                                  (timbre/error t "Error handling error")
                                                  (throw t))))}))
                         ;; decoding request body
                        muuntaja/format-request-middleware
                         ;; coercing response bodys
                        coercion/coerce-response-middleware
                         ;; coercing request parameters
                        coercion/coerce-request-middleware
                         ;; multipart
                        multipart/multipart-middleware

                        (fn [handler]
                          (if collector
                            (prometheus-ring/wrap-instrumentation handler collector
                                                                  {:path-fn (fn [req] (:template (ring/get-match req)))})
                            handler))]}}))

(defmethod ig/init-key :gpml.handler.main/handler [_ {:keys [routes collector logger]}]
  (log/info logger "initialising handlers ...")
  (ring/ring-handler (router routes collector)
                     (ring/routes
                      (swagger-ui/create-swagger-ui-handler {:path "/api/docs"
                                                             :url "/api/swagger.json"
                                                             :validatorUrl nil
                                                             :apisSorter "alpha"
                                                             :operationsSorter "alpha"})
                      (ring/create-default-handler))
                     {:middleware [(fn [handler]
                                     (prometheus-ring/wrap-metrics-expose handler collector {:path "/metrics"}))]}))

(defmethod ig/init-key :gpml.handler.main/root [_ _]
  root)

(defmethod ig/init-key :gpml.handler.main/swagger-handler [_ _]
  (swagger/create-swagger-handler))

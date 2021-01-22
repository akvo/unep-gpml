(ns gpml.handler.main
  (:require [integrant.core :as ig]
            [malli.util :as mu]
            [muuntaja.core :as m]
            [reitit.coercion.malli]
            [reitit.ring :as ring]
            [reitit.ring.coercion :as coercion]
            [reitit.ring.middleware.exception :as exception]
            [reitit.ring.middleware.muuntaja :as muuntaja]
            [reitit.ring.middleware.parameters :as parameters]
            [reitit.ring.middleware.multipart :as multipart]
            [reitit.swagger :as swagger]
            [reitit.swagger-ui :as swagger-ui]
            [ring.util.response :as resp]))


(defn root
  [_]
  (resp/response {:status "OK"}))


(defn router
  [routes]
  (ring/router
   routes
   {:data {:muuntaja m/instance

           :coercion (reitit.coercion.malli/create
                      {:error-keys #{:humanized}
                       :compile mu/open-schema
                       :skip-extra-values true
                       :default-values true})

           :middleware [;; swagger feature
                        swagger/swagger-feature
                        ;; query-params & form-params
                        parameters/parameters-middleware
                        ;; multipart form-data
                        multipart/multipart-middleware
                        ;; content-negotiation
                        muuntaja/format-negotiate-middleware
                        ;; encoding response body
                        muuntaja/format-response-middleware
                        ;; exception handling
                        exception/exception-middleware
                        ;; decoding request body
                        muuntaja/format-request-middleware
                        ;; coercing response bodys
                        coercion/coerce-response-middleware
                        ;; coercing request parameters
                        coercion/coerce-request-middleware]}}))

(defmethod ig/init-key :gpml.handler.main/handler [_ {:keys [routes]}]
  (ring/ring-handler (router routes)
                     (ring/routes
                      (swagger-ui/create-swagger-ui-handler {:path "/api/docs"
                                                             :url "/api/swagger.json"
                                                             :validatorUrl nil
                                                             :operationsSorter "alpha"})
                      (ring/create-default-handler))))

(defmethod ig/init-key :gpml.handler.main/root [_ _]
  root)

(defmethod ig/init-key :gpml.handler.main/swagger-handler [_ _]
  (swagger/create-swagger-handler))

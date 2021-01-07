(ns gpml.handler.main
  (:require [integrant.core :as ig]
            [muuntaja.core :as m]
            [reitit.ring :as ring]
            [reitit.ring.middleware.muuntaja :as muuntaja]
            [ring.util.response :as resp]))

(defn root
  [_]
  (resp/response {:status "OK"}))

(defn router
  [routes]
  (ring/router
   routes
   {:data {:muuntaja m/instance
           :middleware [muuntaja/format-middleware]}}))

(defmethod ig/init-key :gpml.handler.main/handler [_ {:keys [routes]}]
  (ring/ring-handler (router routes)
                     (ring/create-default-handler)))

(defmethod ig/init-key :gpml.handler.main/root [_ _]
  root)

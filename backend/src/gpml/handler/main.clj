(ns gpml.handler.main
  (:require [integrant.core :as ig]
            [muuntaja.core :as m]
            [reitit.ring :as ring]
            [reitit.ring.middleware.muuntaja :as muuntaja]))

(defn root
  [_]
  {:status 200 :body {:status "OK"}})

(def router
  (ring/router
   ["/" {:get root}]
   {:data {:muuntaja m/instance
           :middleware [muuntaja/format-middleware]}}))

(defmethod ig/init-key :gpml.handler.main/handler [_ _options]
  (ring/ring-handler router (ring/create-default-handler)))

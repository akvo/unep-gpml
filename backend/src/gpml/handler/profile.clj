(ns gpml.handler.profile
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]))

(defmethod ig/init-key :gpml.handler.profile/handler [_ _]
  (fn [_]
    (resp/response {:hasProfile false})))

(ns gpml.handler.profile
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]))

(defmethod ig/init-key :gpml.handler.profile/get [_ _]
  (fn [_]
    (resp/response {:hasProfile false})))

(defmethod ig/init-key :gpml.handler.profile/post [_ _]
  (fn [{:keys [jwt-claims body-params]}]
    (tap> jwt-claims)
    (tap> body-params)
    (resp/response {})))

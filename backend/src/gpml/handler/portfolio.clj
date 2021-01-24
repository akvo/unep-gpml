(ns gpml.handler.portfolio
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]))

(def post-params
  [:vector
   [:map
    [:type [:enum "people" "event" "technology" "policy" "resource" "project"]]
    [:id int?]
    [:tag [:string {:min 1}]]]])

(defmethod ig/init-key ::get [_ {:keys [_db]}] ;; FIXME
  (fn [{:keys [jwt-claims]}]
    (tap> jwt-claims)
    (resp/response {})))

(defmethod ig/init-key ::post [_ {:keys [_db]}]
  (fn [{:keys [_jwt-claims _body-params]}]
    (resp/response {:id 0})))

(defmethod ig/init-key ::post-params [_ _]
  post-params)

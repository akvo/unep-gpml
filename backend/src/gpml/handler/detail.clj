(ns gpml.handler.detail
  (:require [gpml.constants :as constants]
            [gpml.db.detail :as db.detail]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defmethod ig/init-key ::topics [_ _]
  (apply conj [:enum] constants/topics))

(defmethod ig/init-key ::get [_ {:keys [db]}]
  (fn [{:keys [path-params]}]
    (if-let [data (db.detail/get-detail (:spec db) (update path-params :topic-id #(Long/parseLong %)))] ;; TODO: investigate why id value is not coerced
      (resp/response (:json data))
      (resp/not-found {:message "Not Found"}))))

(ns gpml.handler.auth
  (:require
   ;;   [clojure.java.jdbc :as jdbc]
   ;;   [clojure.string :as str]
   ;;   [gpml.constants :as constants]
   [gpml.handler.util :as util]
   ;;   [gpml.model.topic :as model.topic]
   [integrant.core :as ig]
   [ring.util.response :as resp]))


(defmethod ig/init-key ::get-topic-auth [_ {:keys [db]}]
  (fn [{{:keys [path]} :parameters approved? :approved? user :user}]
    (let [conn        (:spec db)
  ;;        topic       (:topic-type path)
          ]
      (if-let [data {}]
        (resp/response (merge path

                              {:message "topic auth"
                               :user user}))
        util/not-found))))

(defmethod ig/init-key ::get-topic-stakeholder-auth [_ {:keys [db]}]
  (fn [{{:keys [path]} :parameters approved? :approved? user :user}]
    (let [conn        (:spec db)
;;          topic       (:topic-type path)
          ]
      (if-let [data {}]
        (resp/response (merge path
                              {:message "topic auth"
                               :user user}))
        util/not-found))))

(ns gpml.handler.portfolio
  (:require [integrant.core :as ig]
            [gpml.db.portfolio :as db.portfolio]
            [gpml.db.stakeholder :as db.stakeholder]
            [ring.util.response :as resp]))

(def post-params
  [:vector
   [:map
    [:type [:enum "people" "event" "technology" "policy" "resource" "project"]]
    [:id int?]
    [:tag [:string {:min 1}]]]])

(defn- get-stakeholder-id
  [db email]
  (:id (db.stakeholder/approved-stakeholder-by-email db {:email email})))

(defn get-portfolio
  [db id]
  (db.portfolio/relation-by-stakeholder db {:stakeholder id}))

(defmethod ig/init-key ::get [_ {:keys [db]}]
  (fn [{{:keys [email]} :jwt-claims}]
    (if-let [stakeholder (get-stakeholder-id (:spec db) email)]
      (resp/response (get-portfolio (:spec db) stakeholder))
      (resp/bad-request {:message (format "User with email %s does not exist" email)}))))


(defmethod ig/init-key ::post [_ {:keys [_db]}]
  (fn [{:keys [_jwt-claims _body-params]}]
    (resp/response {:id 0})))

(defmethod ig/init-key ::post-params [_ _]
  post-params)

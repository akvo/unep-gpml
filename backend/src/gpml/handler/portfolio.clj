(ns gpml.handler.portfolio
  (:require [integrant.core :as ig]
            [gpml.db.portfolio :as db.portfolio]
            [gpml.db.stakeholder :as db.stakeholder]
            [ring.util.response :as resp]))

(def associations
  {:resource #{"owner" "reviewer" "user" "interested in" "other"}
   :technology #{"owner" "user" "reviewer" "interested in" "other"}
   :event #{"resource person" "organiser" "participant" "sponsor" "host" "interested in" "other"}
   :project #{"owner" "implementor" "reviewer" "user" "interested in" "other"}
   :policy #{"regulator" "implementor" "reviewer" "interested in" "other"}})

;; FIXME: smarter check. We can check the type of association based in the `:topic` value
;; https://github.com/metosin/malli#fn-schemas
(def post-params
  [:vector
   [:map
    [:topic [:enum "event" "technology" "policy" "resource" "project"]]
    [:id int?]
    [:association (into [:enum] (reduce (fn [s [_ v]] (apply conj s v)) #{} associations))]]])

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

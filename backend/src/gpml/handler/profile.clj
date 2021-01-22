(ns gpml.handler.profile
  (:require [integrant.core :as ig]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.country :as db.country]
            [ring.util.response :as resp]))

(defn get-country [conn profile]
  (:id (db.country/country-by-name conn {:name (:country profile)})))

(defn make-profile [conn claims params]
  (:id (first
         (db.stakeholder/new-stakeholder conn {:picture (:picture claims)
                                               :title (:title params)
                                               :first_name (:first_name params)
                                               :last_name (:last_name params)
                                               :affiliation (:affiliation params)
                                               :email (:email claims)
                                               :linkedin (:linkedin params)
                                               :twitter (:twitter params)
                                               :url (:url params)
                                               :country (get-country conn params),
                                               :representation (:representation params)
                                               :summary (:summary params)
                                               :geo_coverage_type nil}))))

(defmethod ig/init-key :gpml.handler.profile/get [_ {:keys [db]}]
  (fn [{:keys [jwt-claims]}]
    (tap> jwt-claims)
    (if-let [data (db.stakeholder/stakeholder-by-email (:spec db) jwt-claims)]
      (resp/response data)
      (resp/response {}))))

(defmethod ig/init-key :gpml.handler.profile/post [_ {:keys [db]}]
  (fn [{:keys [jwt-claims body-params]}]
    (resp/created (make-profile (:spec db) jwt-claims body-params))))

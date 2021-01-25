(ns gpml.handler.profile
  (:require [integrant.core :as ig]
            [clojure.string :as str]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.stakeholder-picture :as db.stakeholder-picture]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.country :as db.country]
            [ring.util.response :as resp]))

(defn get-country [conn country]
  (:id (db.country/country-by-code conn {:name country})))

(defn assoc-organisation [conn org]
  (if-let [or-id (db.organisation/organisation-by-name conn org)]
    or-id
    (first (db.organisation/new-organisation conn org))))

(defn assoc-picture [conn photo]
  (if photo
    (if-let [new-picture (db.stakeholder-picture/new-stakeholder-picture conn {:picture photo})]
      (str/join ["/image/profile/" (:id (first new-picture))])
      nil)
    nil))

(defn make-profile [conn
                    {:keys [email picture]}
                    {:keys [title first_name
                            last_name linked_in
                            twitter photo
                            representation country
                            org about]}]
  (let [pic-url (if-let [upload-picture (assoc-picture conn photo)]
                  upload-picture
                  (if picture picture nil))
        profile {:picture pic-url
                 :title title
                 :first_name first_name
                 :last_name last_name
                 :email email
                 :linked_in linked_in
                 :twitter twitter
                 :url (:url org)
                 :representation representation
                 :about about
                 :geo_coverage_type nil
                 :country (get-country conn country)
                 :affiliation (:id (assoc-organisation conn org))}]
    (db.stakeholder/new-stakeholder conn profile)))

(defmethod ig/init-key :gpml.handler.profile/get [_ {:keys [db]}]
  (fn [{:keys [jwt-claims]}]
    (tap> jwt-claims)
    (if-let [profile (db.stakeholder/stakeholder-by-email (:spec db) jwt-claims)]
      (resp/response profile)
      (resp/response {}))))

(defmethod ig/init-key :gpml.handler.profile/post [_ {:keys [db]}]
  (fn [{:keys [jwt-claims body-params headers]}]
    (if-let [id (make-profile (:spec db) jwt-claims body-params)]
      (if-let [profile (db.stakeholder/stakeholder-by-id (:spec db) {:id (:id (first id))})]
        (resp/created (:referer headers) profile)
        (assoc (resp/status 500) :body "Internal Server Error"))
      (assoc (resp/status 500) :body "Internal Server Error"))))

(defmethod ig/init-key :gpml.handler.profile/put [_ {:keys [db]}]
  (fn [{:keys [jwt-claims body-params]}]
    (if-let [profile (db.stakeholder/stakeholder-by-email (:spec db) jwt-claims)]
      (resp/response (conj profile body-params))
      (resp/response {}))))

(defmethod ig/init-key :gpml.handler.profile/approve [_ {:keys [db]}]
  (fn [{:keys [jwt-claims body-params]}]
    (let [admin (db.stakeholder/stakeholder-by-email (:spec db) jwt-claims)]
      (tap> body-params)
      (tap> admin)
      (if (= (:role admin) "ADMIN")
        (when (db.stakeholder/approve-stakeholder (:spec db) body-params)
          (assoc (resp/status 204)
                 :body {:message "Successfuly Updated"
                        :data (db.stakeholder/stakeholder-by-id (:spec db) body-params)}))
        (assoc (resp/status 401) :body "Unauthorized")))))

(defmethod ig/init-key :gpml.handler.profile/post-params [_ _]
  [:map
   [:title string?]
   [:first_name string?]
   [:last_name string?]
   [:linked_in {:optional true} string?]
   [:twitter {:optional true} string?]
   [:photo {:optional true} string?]
   [:representation string?]
   [:country {:optional true} string?]
   [:org {:optional true}
    [:map
     [:name {:optional true} string?]
     [:url {:optional true} string?]]]
   [:about string?]])

#_(def dbtest (dev/db-conn))

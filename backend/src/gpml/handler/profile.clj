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
      (str/join ["/image/profile/" (:id new-picture)])
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
        affiliation (if (:name org) (:id (assoc-organisation conn org)) nil)
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
                 :affiliation affiliation}]
      (db.stakeholder/new-stakeholder conn profile)))

(defn remap-profile
  [{:keys [id photo about approved_at
           title first_name role
           last_name linked_in
           twitter representation
           country org_name org_url]}]
  {:id id
   :title title
   :first_name first_name
   :last_name last_name
   :linked_in linked_in
   :twitter twitter
   :photo photo
   :country country
   :representation representation
   :org {:name org_name
         :url org_url}
   :about about
   :role role
   :approved_at approved_at})

(defmethod ig/init-key :gpml.handler.profile/get [_ {:keys [db]}]
  (fn [{:keys [jwt-claims]}]
    (tap> jwt-claims)
    (if-let [profile (db.stakeholder/stakeholder-by-email (:spec db) jwt-claims)]
      (resp/response (remap-profile profile))
      (resp/response {}))))

(defmethod ig/init-key :gpml.handler.profile/post [_ {:keys [db]}]
  (fn [{:keys [jwt-claims body-params headers]}]
    (if-let [id (make-profile (:spec db) jwt-claims body-params)]
      (if-let [profile (db.stakeholder/stakeholder-by-id (:spec db) {:id (:id (first id))})]
        (resp/created (:referer headers) (remap-profile profile))
        (assoc (resp/status 500) :body "Internal Server Error"))
      (assoc (resp/status 500) :body "Internal Server Error"))))

(defmethod ig/init-key :gpml.handler.profile/put [_ {:keys [db]}]
  (fn [{:keys [jwt-claims body-params]}]
    (let [db (:spec db)
          new-profile (merge
                        (db.stakeholder/stakeholder-by-email db jwt-claims)
                        body-params)
          profile (cond-> new-profile

                    (:photo body-params)
                    (assoc :picture
                           (if (re-find #"http" (:photo body-params))
                             (:photo body-params)
                             (assoc-picture db (:photo body-params))))

                    (-> new-profile :org :url)
                    (assoc :url (-> new-profile :org :url))

                    (-> new-profile :org :name)
                    (assoc :affiliation (:id (assoc-organisation db (:org new-profile))))

                    (:country body-params)
                    (assoc :country (get-country db (:country body-params))))

          _ (tap> profile)
          _ (db.stakeholder/update-stakeholder db profile)]
      (resp/status 204))))

(defmethod ig/init-key :gpml.handler.profile/approve [_ {:keys [db]}]
  (fn [{:keys [body-params]}]
    (when (db.stakeholder/approve-stakeholder (:spec db) body-params)
      (assoc (resp/status 204)
             :body {:message "Successfuly Updated"
                    :data (db.stakeholder/stakeholder-by-id (:spec db) body-params)}))))

(defmethod ig/init-key :gpml.handler.profile/pending [_ {:keys [db]}]
  (fn [_]
    (let [profiles (db.stakeholder/pending-approval (:spec db))
          profiles (map (fn[x] (remap-profile x)) profiles)]
      (resp/response profiles))))

(defmethod ig/init-key :gpml.handler.profile/post-params [_ _]
  [:map
   [:title {:optional true} string?]
   [:first_name string?]
   [:last_name string?]
   [:linked_in {:optional true} string?]
   [:twitter {:optional true} string?]
   [:photo {:optional true} string?]
   [:representation string?]
   [:country {:optional true} string?]
   [:org {:optional true} map?
    [:map
     [:name {:optional true} string?]
     [:url {:optional true} string?]]]
   [:about string?]])

#_(def dbtest (dev/db-conn))

(ns gpml.handler.profile
  (:require [integrant.core :as ig]
            [clojure.string :as str]
            [gpml.db.country-group :as db.country-group]
            [gpml.db.stakeholder :as db.stakeholder]
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
  (cond
    (nil? photo) nil
    (re-find #"^\/image\/" photo) photo
    :else (str/join ["/image/profile/"
                     (:id (db.stakeholder/new-stakeholder-picture conn {:picture photo}))])))

(defn make-profile [conn
                    {:keys [email picture]}
                    {:keys [title first_name
                            last_name linked_in
                            twitter photo
                            representation country
                            org about geo_coverage_type]}]
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
                 :geo_coverage_type geo_coverage_type
                 :country (get-country conn country)
                 :affiliation affiliation}]
      (db.stakeholder/new-stakeholder conn profile)))

(defn remap-profile
  [{:keys [id photo about approved_at
           title first_name role
           last_name linked_in
           twitter representation
           country org_name org_url
           geo_coverage_type]}
   tags
   geo]
  {:id id
   :title title
   :first_name first_name
   :last_name last_name
   :linked_in linked_in
   :twitter twitter
   :photo photo
   :country country
   :representation representation
   :tags (mapv #(:tag %) tags)
   :geo_coverage_type geo_coverage_type
   :geo_coverage_value geo
   :org {:name org_name
         :url org_url}
   :about about
   :role role
   :approved_at approved_at})

(defmethod ig/init-key :gpml.handler.profile/get [_ {:keys [db]}]
  (fn [{:keys [jwt-claims]}]
    (tap> jwt-claims)
    (if-let [profile (db.stakeholder/stakeholder-by-email (:spec db) jwt-claims)]
      (let [conn (:spec db)
            tags (db.stakeholder/stakeholder-tags conn profile)
            geo-type (:geo_coverage_type profile)
            geo (cond
                  (contains? #{"regional" "global with elements in specific areas"}
                   geo-type)
                   (map #(:name %)
                           (db.stakeholder/stakeholder-geo-country-group conn profile))
                  (contains? #{"national" "transnational"}
                   geo-type)
                   (map #(:iso_code %)
                           (db.stakeholder/stakeholder-geo-country conn profile)))
            profile (remap-profile profile tags geo)]
      (resp/response profile))
      (resp/response {}))))

(defmethod ig/init-key :gpml.handler.profile/post [_ {:keys [db]}]
  (fn [{:keys [jwt-claims body-params headers]}]
    (if-let [id (-> (make-profile (:spec db) jwt-claims body-params) first :id)]
      (let [tags (:tags body-params)
            geo-type (:geo_coverage_type body-params)
            geo-value (:geo_coverage_value body-params)
            db (:spec db)
            profile (db.stakeholder/stakeholder-by-id db {:id id})]
        (when (not-empty tags)
          (db.stakeholder/add-stakeholder-tags db {:tags (map #(vector id %) tags)}))
        (when (not-empty geo-value)
          (let [geo-data
                (cond
                  (contains? #{"regional" "global with elements in specific areas"}
                   geo-type)
                  (->> {:names geo-value}
                       (db.country-group/country-group-by-names db)
                       (map #(vector id (:id %) nil)))
                  (contains? #{"national" "transnational"}
                   geo-type)
                  (->> {:codes geo-value}
                       (db.country/country-by-codes db)
                       (map #(vector id nil (:id %)))))]
            (when (some? geo-data)
              (db.stakeholder/add-stakeholder-geo db {:geo geo-data}))))
        (resp/created (:referer headers) 
                      (assoc (remap-profile profile nil nil)
                             :geo_coverage_value (:geo_coverage_type body-params)
                             :geo_coverage_value (:geo_coverage_value body-params)
                             :tags (:tags body-params))))
      (assoc (resp/status 500) :body "Internal Server Error"))))

(defmethod ig/init-key :gpml.handler.profile/put [_ {:keys [db]}]
  (fn [{:keys [jwt-claims body-params]}]
    (let [db (:spec db)
          id (:id body-params)
          tags (:tags body-params)
          geo-type (:geo_coverage_type body-params)
          geo-value (:geo_coverage_value body-params)
          new-profile (merge
                        (db.stakeholder/stakeholder-by-email db jwt-claims)
                        body-params)
          profile (cond-> new-profile
                    (:photo body-params)
                    (assoc :picture
                           (if (re-find #"^\/image" (:photo body-params))
                             (:photo body-params)
                             (assoc-picture db (:photo body-params))))
                    (-> new-profile :org :url)
                    (assoc :url (-> new-profile :org :url))
                    (-> new-profile :org :name)
                    (assoc :affiliation (:id (assoc-organisation db (:org new-profile))))
                    (:country body-params)
                    (assoc :country (get-country db (:country body-params))))
          _ (db.stakeholder/update-stakeholder db profile)
          _ (db.stakeholder/delete-stakehodler-geo db body-params)
          _ (db.stakeholder/delete-stakehodler-tags db body-params)]
        (when (not-empty tags)
          (db.stakeholder/add-stakeholder-tags db {:tags (map #(vector id %) tags)}))
        (when (not-empty geo-value)
          (let [geo-data
                (cond
                  (contains? #{"regional" "global with elements in specific areas"}
                   geo-type)
                  (->> {:names geo-value}
                       (db.country-group/country-group-by-names db)
                       (map #(vector id (:id %) nil)))
                  (contains? #{"national" "transnational"}
                   geo-type)
                  (->> {:codes geo-value}
                       (db.country/country-by-codes db)
                       (map #(vector id nil (:id %)))))]
            (when (some? geo-data)
              (db.stakeholder/add-stakeholder-geo db {:geo geo-data}))))
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
          profiles (map (fn[x] (remap-profile x nil nil)) profiles)]
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
   [:about string?]
   [:geo_coverage_type {:optional true}
    [:enum "global", "regional", "national", "transnational",
     "sub-national", "global with elements in specific areas"]]
   [:org {:optional true} map?
    [:map
     [:name {:optional true} string?]
     [:url {:optional true} string?]]]
   [:tags {:optional true}
    [:vector {:optional true} int?]]
   [:geo_coverage_value {:optional true}
    [:vector {:min 1 :error/message "Need at least one geo coverage value"} string?]]])

#_(def dbtest (dev/db-conn))

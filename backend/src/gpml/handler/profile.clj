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
    (db.organisation/new-organisation conn org)))

(defn assoc-picture [conn photo]
  (cond
    (nil? photo) nil
    (re-find #"^\/image\/" photo) photo
    :else (str/join ["/image/profile/"
                     (:id (db.stakeholder/new-stakeholder-picture conn {:picture photo}))])))

(defn assoc-cv [conn cv]
  (cond
    (nil? cv) nil
    (re-find #"^\/cv\/" cv) cv
    :else (str/join ["/cv/profile/"
                     (:id (db.stakeholder/new-stakeholder-cv conn {:cv cv}))])))

(defn make-profile [conn
                    {:keys [email picture]}
                    {:keys [title first_name
                            last_name linked_in
                            twitter photo cv
                            representation country
                            org about geo_coverage_type]}]
  (let [pic-url (if-let [upload-picture (assoc-picture conn photo)]
                  upload-picture
                  (if picture picture nil))
        cv-url (if-let [upload-cv (assoc-cv conn cv)]
                 upload-cv
                 (if cv cv nil))
        affiliation (if (:name org) (:id (assoc-organisation conn org)) nil)
        profile {:picture pic-url
                 :cv cv-url
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
  [{:keys [id photo about
           title first_name role
           last_name linked_in cv
           twitter representation
           country org_name org_url
           geo_coverage_type
           reviewed_at reviewed_by review_status]}
   tags
   geo]
  {:id id
   :title title
   :first_name first_name
   :last_name last_name
   :linked_in linked_in
   :twitter twitter
   :photo photo
   :cv cv
   :country country
   :representation representation
   :tags (mapv #(:tag %) tags)
   :geo_coverage_type geo_coverage_type
   :geo_coverage_value geo
   :org {:name org_name
         :url org_url}
   :about about
   :role role
   :reviewed_at reviewed_at
   :reviewed_by reviewed_by
   :review_status review_status})

(defn get-geo-data [db id geo-type geo-value]
  (cond
    (contains? #{"regional" "global with elements in specific areas"}
     geo-type)
    (->> {:names geo-value}
         (db.country-group/country-group-by-names db)
         (map #(vector id (:id %) nil)))
    (contains? #{"transnational" "national"}
     geo-type)
    (->> {:codes geo-value}
         (db.country/country-by-codes db)
         (map #(vector id nil (:id %))))))

(defmethod ig/init-key :gpml.handler.profile/get [_ {:keys [db]}]
  (fn [{:keys [jwt-claims]}]
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
    (if-let [id (:id (make-profile (:spec db) jwt-claims body-params))]
      (let [tags (:tags body-params)
            geo-type (:geo_coverage_type body-params)
            geo-value (:geo_coverage_value body-params)
            db (:spec db)
            profile (db.stakeholder/stakeholder-by-id db {:id id})]
        (when (not-empty tags)
          (db.stakeholder/add-stakeholder-tags db {:tags (map #(vector id %) tags)}))
        (when (not-empty geo-value)
          (let [geo-data (get-geo-data db id geo-type geo-value)]
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
          old-profile (db.stakeholder/stakeholder-by-email db jwt-claims)
          new-profile (merge old-profile body-params)
          profile (cond-> new-profile
                    (:photo body-params)
                    (assoc :picture
                           (if (re-find #"^\/image" (:photo body-params))
                             (:photo body-params)
                             (assoc-picture db (:photo body-params))))
                    (= (:photo body-params) nil)
                    (assoc :picture nil)
                    (:cv body-params)
                    (assoc :cv
                           (if (re-find #"^\/cv" (:cv body-params))
                             (:cv body-params)
                             (assoc-cv db (:cv body-params))))
                    (= (:cv body-params) nil)
                    (assoc :cv nil)
                    (-> new-profile :org :url)
                    (assoc :url (-> new-profile :org :url))
                    (-> new-profile :org :name)
                    (assoc :affiliation (:id (assoc-organisation db (:org new-profile))))
                    (:country body-params)
                    (assoc :country (get-country db (:country body-params))))
          _ (db.stakeholder/update-stakeholder db profile)
          _ (db.stakeholder/delete-stakeholder-geo db body-params)
          _ (db.stakeholder/delete-stakeholder-tags db body-params)]
        (when (and (some? (:photo old-profile))
                   (not= (:photo old-profile) (:picture profile)))
            (let [old-pic (-> (str/split (:photo old-profile) #"/image/profile/") second Integer/parseInt)]
            (db.stakeholder/delete-stakeholder-picture-by-id db {:id old-pic})))
        (when (and (some? (:cv old-profile))
                   (not= (:cv old-profile) (:cv profile)))
            (let [old-cv (-> (str/split (:cv old-profile) #"/cv/profile/") second Integer/parseInt)]
            (db.stakeholder/delete-stakeholder-cv-by-id db {:id old-cv})))
        (when (not-empty tags)
          (db.stakeholder/add-stakeholder-tags db {:tags (map #(vector id %) tags)}))
        (when (not-empty geo-value)
          (let [geo-data (get-geo-data db id geo-type geo-value)]
            (when (some? geo-data)
              (db.stakeholder/add-stakeholder-geo db {:geo geo-data}))))
      (resp/status 204))))

(defmethod ig/init-key :gpml.handler.profile/review [_ {:keys [db]}]
  (fn [{:keys [body-params admin]}]
    (let [db (:spec db)
          _ (db.stakeholder/update-stakeholder-status db (assoc body-params :reviewed_by (:id admin)))]
    (assoc (resp/status 204)
      :body {:message "Successfuly Updated"
             :data (db.stakeholder/stakeholder-by-id db body-params)}))))

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
   [:cv {:optional true} string?]
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

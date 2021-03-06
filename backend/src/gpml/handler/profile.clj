(ns gpml.handler.profile
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.string :as str]
            [gpml.db.country :as db.country]
            [gpml.db.country-group :as db.country-group]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.stakeholder :as db.stakeholder]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defn get-country [conn country]
  (:id (db.country/country-by-code conn {:name country})))

(defn get-geo-data [db id geo-type geo-value]
  (cond
    (#{"regional" "global with elements in specific areas"} geo-type)
    (->> {:names geo-value}
         (db.country-group/country-group-by-names db)
         (map #(vector id (:id %) nil)))
    (#{"transnational" "national"} geo-type)
    (->> {:codes geo-value}
         (db.country/country-by-codes db)
         (map #(vector id nil (:id %))))))

(defn new-organisation [conn org]
    (let [country (get-country conn (:country org))
          org-id (:id (db.organisation/new-organisation conn (assoc (dissoc org :id) :country country)))
          org-geo (get-geo-data conn org-id (:geo_coverage_type org) (:geo_coverage_value org))]
      (when (seq org-geo)
        (db.organisation/add-geo-coverage conn {:geo org-geo}))
      org-id))

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
                            twitter photo cv organisation_role
                            representation country
                            org about geo_coverage_type]}]
  (let [pic-url (if-let [upload-picture (assoc-picture conn photo)]
                  upload-picture
                  (if picture picture nil))
        cv-url (if-let [upload-cv (assoc-cv conn cv)]
                 upload-cv
                 (if cv cv nil))
        affiliation (if (= -1 (:id org))
                      (new-organisation conn org)
                      (:id org))
        profile {:picture pic-url
                 :cv cv-url
                 :title title
                 :first_name first_name
                 :last_name last_name
                 :email email
                 :linked_in linked_in
                 :twitter twitter
                 :representation representation
                 :organisation_role organisation_role
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
           country geo_coverage_type
           reviewed_at reviewed_by review_status
           organisation_role public_email]}
   tags
   geo
   org]
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
   :tags (-> (filter (comp #{"general"} :category) tags) first :tags)
   :offering (-> (filter (comp #{"offering"} :category) tags) first :tags)
   :seeking (-> (filter (comp #{"seeking"} :category) tags) first :tags)
   :geo_coverage_type geo_coverage_type
   :geo_coverage_value geo
   :org org
   :about about
   :role role
   :organisation_role organisation_role
   :reviewed_at reviewed_at
   :reviewed_by reviewed_by
   :review_status review_status
   :public_email public_email})

(defmethod ig/init-key :gpml.handler.profile/get [_ {:keys [db]}]
  (fn [{:keys [jwt-claims]}]
    (if-let [profile (db.stakeholder/stakeholder-by-email (:spec db) jwt-claims)]
      (let [conn (:spec db)
            tags (db.stakeholder/stakeholder-tags conn profile)
            org (db.organisation/organisation-by-id conn {:id (:affiliation profile)})
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
            profile (remap-profile profile tags geo org)]
      (resp/response profile))
      (resp/response {}))))

(defmethod ig/init-key :gpml.handler.profile/post [_ {:keys [db]}]
  (fn [{:keys [jwt-claims body-params headers]}]
    (if-let [id (:id (make-profile (:spec db) jwt-claims body-params))]
      (let [tags (into [] (concat (:tags body-params) (:offering body-params) (:seeking body-params)))
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
                      (dissoc
                       (assoc
                         (merge body-params profile)
                         :org (db.organisation/organisation-by-id db {:id (:affiliation profile)}))
                       :affiliation :picture)
                      ))
      (assoc (resp/status 500) :body "Internal Server Error"))))

(defmethod ig/init-key :gpml.handler.profile/put [_ {:keys [db]}]
  (fn [{:keys [jwt-claims body-params]}]
    (jdbc/with-db-transaction [tx (:spec db)]
      (let [id (:id body-params)
            tags (into [] (concat (:tags body-params) (:offering body-params) (:seeking body-params)))
            org (:org body-params)
            geo-type (:geo_coverage_type body-params)
            geo-value (:geo_coverage_value body-params)
            old-profile (db.stakeholder/stakeholder-by-email tx jwt-claims)
            new-profile (merge old-profile body-params)
            profile (cond-> new-profile
                      (:photo body-params)
                      (assoc :picture
                             (cond
                               (re-find #"^\/image|^http" (:photo body-params))
                               (:photo body-params)
                               (re-find #"^data:" (:photo body-params))
                               (assoc-picture tx (:photo body-params))))
                      (= (:photo body-params) nil)
                      (assoc :picture nil)
                      (:cv body-params)
                      (assoc :cv
                             (if (re-find #"^\/cv" (:cv body-params))
                               (:cv body-params)
                               (assoc-cv tx (:cv body-params))))
                      (= (:cv body-params) nil)
                      (assoc :cv nil)
                      (not= -1 (:id org))
                      (assoc :affiliation (:id org))
                      (= -1 (:id org))
                      (assoc :affiliation (new-organisation tx org))
                      (:country body-params)
                      (assoc :country (get-country tx (:country body-params))))]
        (db.stakeholder/update-stakeholder tx profile)
        (db.stakeholder/delete-stakeholder-geo tx body-params)
        (db.stakeholder/delete-stakeholder-tags tx body-params)
        (when (and (some? (:photo old-profile))
                   (not= (:photo old-profile) (:picture profile))
                   (not= "http" (re-find #"^http" (:photo old-profile))))
          (let [photo-url (str/split (:photo old-profile) #"\/image\/profile\/")]
            (when (= 2 (count photo-url))
              (let [old-pic (-> photo-url second Integer/parseInt)]
                (db.stakeholder/delete-stakeholder-picture-by-id tx {:id old-pic})))))
        (when (and (some? (:cv old-profile))
                   (not= (:cv old-profile) (:cv profile)))
          (let [old-cv (-> (str/split (:cv old-profile) #"/cv/profile/") second Integer/parseInt)]
            (db.stakeholder/delete-stakeholder-cv-by-id tx {:id old-cv})))
        (when (not-empty tags)
          (db.stakeholder/add-stakeholder-tags tx {:tags (map #(vector id %) tags)}))
        (when (not-empty geo-value)
          (let [geo-data (get-geo-data tx id geo-type geo-value)]
            (when (some? geo-data)
              (db.stakeholder/add-stakeholder-geo tx {:geo geo-data}))))
        (resp/status 204)))))

(defmethod ig/init-key :gpml.handler.profile/review [_ {:keys [db]}]
  (fn [{:keys [body-params admin]}]
    (let [db (:spec db)
          _ (db.stakeholder/update-stakeholder-status db (assoc body-params :reviewed_by (:id admin)))]
    (assoc (resp/status 204)
      :body {:message "Successfuly Updated"
             :data (db.stakeholder/stakeholder-by-id db body-params)}))))

(defmethod ig/init-key :gpml.handler.profile/pending [_ {:keys [db]}]
  (fn [_]
    (let [profiles (db.stakeholder/pending-approval (:spec db))]
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
   [:public_email {:optional true} boolean?]
   [:about {:optional true} string?]
   [:organisation_role {:optional true} string?]
   [:geo_coverage_type {:optional true}
    [:enum "global", "regional", "national", "transnational",
     "sub-national", "global with elements in specific areas"]]
   [:tags {:optional true}
    [:vector {:min 1 :error/message "Need at least one value for tags"} int?]]
   [:seeking {:optional true}
    [:vector {:min 1 :error/message "Need at least one value for seeking"} int?]]
   [:offering {:optional true}
    [:vector {:min 1 :error/message "Need at least one value for offering"} int?]]
   [:geo_coverage_value {:optional true}
    [:vector {:min 1 :error/message "Need at least one geo coverage value"} string?]]
   [:org {:optional true} map?
    [:map
     [:id {:optional true} int?]
     [:name {:optional true} string?]
     [:url {:optional true} string?]
     [:country {:optional true} string?]
     [:geo_coverage_type {:optional true}
      [:enum "global", "regional", "national", "transnational",
       "sub-national", "global with elements in specific areas"]]
     [:geo_coverage_value {:optional true}
      [:vector {:min 1 :error/message "Need at least one of geo coverage value"} string?]]]]])

#_(def dbtest (dev/db-conn))

(ns gpml.handler.profile
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.string :as str]
            [gpml.auth0-util :as auth0]
            [gpml.email-util :as email]
            [gpml.handler.geo :as handler.geo]
            [gpml.handler.country :as handler.country]
            [gpml.handler.organisation :as handler.org]
            [gpml.handler.image :as handler.image]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.stakeholder :as db.stakeholder]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

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
                            org about geo_coverage_type]}
                    mailjet-config]
  (let [pic-url (if-let [upload-picture
                         (handler.image/assoc-image conn photo "profile")]
                  upload-picture
                  (if picture picture nil))
        cv-url (if-let [upload-cv (assoc-cv conn cv)]
                 upload-cv
                 (if cv cv nil))
        affiliation (if (= -1 (:id org))
                      (handler.org/find-or-create conn org)
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
                 :country (handler.country/id-by-code conn country)
                 :affiliation affiliation}
        stakeholder
        (db.stakeholder/new-stakeholder conn profile)]
    (email/notify-admins-pending-approval
     conn
     mailjet-config
     (merge profile {:type "stakeholder"}))
    stakeholder))

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

(defn pending-profiles-response [conn auth0-config]
  (let [profiles (db.stakeholder/pending-approval conn)
        verified-emails (set (auth0/list-auth0-verified-emails auth0-config))
        profiles-with-verified-flag (map
                                     #(merge %
                                             {:email_verified
                                              (contains? verified-emails (:email %))})
                                     profiles)]
    (resp/response profiles-with-verified-flag)))

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

(defmethod ig/init-key :gpml.handler.profile/post [_ {:keys [db mailjet-config]}]
  (fn [{:keys [jwt-claims body-params headers]}]
    (if-let [id (:id (make-profile (:spec db) jwt-claims body-params mailjet-config))]
      (let [tags (into [] (concat (:tags body-params) (:offering body-params) (:seeking body-params)))
            db (:spec db)
            profile (db.stakeholder/stakeholder-by-id db {:id id})]
        (when (not-empty tags)
          (db.stakeholder/add-stakeholder-tags db {:tags (map #(vector id %) tags)}))
        (when (some? (:geo_coverage_value body-params))
          (let [geo-data (handler.geo/id-vec-geo db id body-params)]
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
            old-profile (db.stakeholder/stakeholder-by-email tx jwt-claims)
            new-profile (merge old-profile body-params)
            profile (cond-> new-profile
                      (:photo body-params)
                      (assoc :picture
                             (cond
                               (re-find #"^\/image|^http" (:photo body-params))
                               (:photo body-params)
                               (re-find #"^data:" (:photo body-params))
                               (handler.image/assoc-image tx (:photo body-params) "profile")))
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
                      (assoc :affiliation (handler.org/find-or-create tx org))
                      (:country body-params)
                      (assoc :country (handler.country/id-by-code tx (:country body-params))))]
        (db.stakeholder/update-stakeholder tx profile)
        (db.stakeholder/delete-stakeholder-geo tx body-params)
        (db.stakeholder/delete-stakeholder-tags tx body-params)
        (when (and (some? (:photo old-profile))
                   (not= (:photo old-profile) (:picture profile))
                   (not= "http" (re-find #"^http" (:photo old-profile))))
          (let [photo-url (str/split (:photo old-profile) #"\/image\/profile\/")]
            (when (= 2 (count photo-url))
              (let [old-pic (-> photo-url second Integer/parseInt)]
                (db.stakeholder/delete-stakeholder-image-by-id tx {:id old-pic})))))
        (when (and (some? (:cv old-profile))
                   (not= (:cv old-profile) (:cv profile)))
          (let [old-cv (-> (str/split (:cv old-profile) #"/cv/profile/") second Integer/parseInt)]
            (db.stakeholder/delete-stakeholder-cv-by-id tx {:id old-cv})))
        (when (not-empty tags)
          (db.stakeholder/add-stakeholder-tags tx {:tags (map #(vector id %) tags)}))
        (when (some? (:geo_coverage_value body-params))
          (let [geo-data (handler.geo/id-vec-geo tx id body-params)]
            (when (some? geo-data)
              (db.stakeholder/add-stakeholder-geo tx {:geo geo-data}))))
        (resp/status 204)))))

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

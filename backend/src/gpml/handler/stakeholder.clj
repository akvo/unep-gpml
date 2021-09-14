(ns gpml.handler.stakeholder
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.string :as str]
            [gpml.auth0-util :as auth0]
            [gpml.email-util :as email]
            [gpml.handler.util :as util]
            [gpml.geo-util :as geo]
            [gpml.constants :as constants]
            [gpml.handler.geo :as handler.geo]
            [gpml.handler.organisation :as handler.org]
            [gpml.handler.image :as handler.image]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.stakeholder :as db.stakeholder]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(def roles-re (->> constants/user-roles
                   (map name)
                   (str/join "|")
                   (format "^(%1$s)((,(%1$s))+)?$")
                   re-pattern))

(defmethod ig/init-key :gpml.handler.stakeholder/get [_ {:keys [db]}]
  (fn [{{{:keys [page limit email-like roles] :as query} :query} :parameters
        user :user approved? :approved?}]
    (resp/response (if (and approved? (= (:role user) "ADMIN"))
                     ;; FIXME: Currently hard-coded to allow only for ADMINS.
                     (let [search (and email-like (format "%%%s%%" email-like))
                           roles (and roles (str/split roles #","))
                           params (assoc query :email-like search :roles roles)
                           stakeholders (db.stakeholder/list-stakeholder-paginated (:spec db) params)
                           count (:count (db.stakeholder/count-stakeholder (:spec db) params))
                           pages (util/page-count count limit)]
                       ;; FIXME: The response is differently shaped
                       ;; for ADMINS and other users. This should be
                       ;; changed once the work on the other branches
                       ;; is finalized. Currently, leaving the public
                       ;; response shape as before to not break other
                       ;; uses of this end-point.
                       {:stakeholders stakeholders :page page :limit limit :pages pages :count count})
                     ;; FIXME: limit & page are ignored when returning public stakeholders!
                     {:stakeholders (->> (db.stakeholder/all-public-stakeholder (:spec db))
                                         (map (fn [stakeholder]
                                                (let [common-keys [:id :title :first_name :last_name]]
                                                  (if (:public_email stakeholder)
                                                    (select-keys stakeholder (conj common-keys :email))
                                                    (select-keys stakeholder common-keys))))))}))))

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
                 :country country
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

(defmethod ig/init-key :gpml.handler.stakeholder/profile [_ {:keys [db]}]
  (fn [{:keys [jwt-claims]}]
    (if-let [profile (db.stakeholder/stakeholder-by-email (:spec db) jwt-claims)]
      (let [conn (:spec db)
            tags (db.stakeholder/stakeholder-tags conn profile)
            org (db.organisation/organisation-by-id conn {:id (:affiliation profile)})
            geo-type (:geo_coverage_type profile)
            geo-value (db.stakeholder/get-stakeholder-geo conn profile)
            geo (cond
                  (contains? #{"regional" "global with elements in specific areas"} geo-type)
                  (mapv :country_group geo-value)
                  (contains? #{"national" "transnational" "sub-national"} geo-type)
                  (mapv :country geo-value))
            profile (remap-profile profile tags geo org)]
        (resp/response profile))
      (resp/response {}))))

(defmethod ig/init-key :gpml.handler.stakeholder/post [_ {:keys [db mailjet-config]}]
  (fn [{:keys [jwt-claims body-params headers]}]
    (let [id (:id (make-profile db jwt-claims body-params mailjet-config))
          tags (into [] (concat (:tags body-params) (:offering body-params) (:seeking body-params)))
          profile (db.stakeholder/stakeholder-by-id db {:id id})
          res (dissoc (assoc (merge body-params profile)
                             :org (db.organisation/organisation-by-id db {:id (:affiliation profile)}))
                      :affiliation :picture)]
      (resp/created (:referer headers) res))))

(defmethod ig/init-key :gpml.handler.stakeholder/put [_ {:keys [db]}]
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
                      (assoc :affiliation (handler.org/find-or-create tx org)))]
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
          (let [geo-data (handler.geo/get-geo-vector id body-params)]
            (db.stakeholder/add-stakeholder-geo tx {:geo geo-data})))
        (resp/status 204)))))

(def org-schema [:map
                [:id {:optional true} int?]
                [:name {:optional true} string?]
                [:url {:optional true} string?]
                [:country {:optional true} int?]
                [:geo_coverage_type {:optional true} geo/coverage_type]
                [:geo_coverage_value {:optional true}
                 [:vector {:min 1 :error/message "Need at least one of geo coverage value"} int?]]])


(defmethod ig/init-key :gpml.handler.stakeholder/post-params [_ _]
  [:map
   [:title {:optional true} string?]
   [:first_name string?]
   [:last_name string?]
   [:linked_in {:optional true} string?]
   [:twitter {:optional true} string?]
   [:photo {:optional true} string?]
   [:cv {:optional true} string?]
   [:representation string?]
   [:country {:optional true} int?]
   [:public_email {:optional true} boolean?]
   [:public_database {:optional true} boolean?]
   [:about {:optional true} string?]
   [:seeking {:optional true}
    [:vector {:min 1 :error/message "Need at least one value for seeking"} int?]]
   [:offering {:optional true}
    [:vector {:min 1 :error/message "Need at least one value for offering"} int?]]
   [:org {:optional true} map? org-schema]])

(defmethod ig/init-key ::get-params [_ _]
  {:query [:map
           [:page {:optional true
                   :default 1}
            int?]
           [:limit {:optional true
                    :default 10}
            int?]
           [:review-status {:optional true}
            (apply conj [:enum] (->> constants/admin-review-status (map name)))]
           [:roles {:optional true}
            [:re roles-re]]
           [:email-like {:optional true}
            string?]]})

(defmethod ig/init-key :gpml.handler.stakeholder/patch [_ {:keys [db]}]
  (fn [{{{:keys [id]} :path
         {:keys [role]} :body}
        :parameters
        admin :admin}]
    (let [params {:role role :reviewed_by (:id admin) :id id}
          count (db.stakeholder/update-stakeholder-role (:spec db) params)]
      (resp/response {:status (if (= count 1) "success" "failed")}))))

(defmethod ig/init-key ::patch-params [_ _]
  {:path [:map [:id int?]]
   :body [:map [:role
                (apply conj [:enum] (->> constants/user-roles (map name)))]]})

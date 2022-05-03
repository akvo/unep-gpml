(ns gpml.handler.stakeholder
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.string :as str]
            [gpml.auth0-util :as auth0]
            [gpml.constants :as constants]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.email-util :as email]
            [gpml.geo-util :as geo]
            [gpml.handler.geo :as handler.geo]
            [gpml.handler.image :as handler.image]
            [gpml.handler.organisation :as handler.org]
            [gpml.handler.tag :as handler.tag]
            [gpml.handler.util :as handler.util]
            [gpml.util :as util]
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
                           pages (handler.util/page-count count limit)]
                       ;; FIXME: The response is differently shaped
                       ;; for ADMINS and other users. This should be
                       ;; changed once the work on the other branches
                       ;; is finalized. Currently, leaving the public
                       ;; response shape as before to not break other
                       ;; uses of this end-point.
                       {:stakeholders stakeholders :page page :limit limit :pages pages :count count})
                     ;; FIXME: limit & page are ignored when returning public stakeholders!
                     {:stakeholders (->> (db.stakeholder/all-public-stakeholders (:spec db))
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

(defn- make-profile [{:keys [title
                             first_name
                             last_name
                             email
                             idp_usernames
                             linked_in
                             public_database
                             public_email
                             non_member_organisation
                             cv
                             affiliation
                             job_title
                             twitter picture
                             country
                             about]}]
  {:title             title
   :first_name        first_name
   :last_name         last_name
   :email             email
   :idp_usernames     idp_usernames
   :linked_in         linked_in
   :twitter           twitter
   :picture           picture
   :cv                cv
   :about             about
   :country           country
   :public_email      (boolean public_email)
   :representation    ""
   :public_database   public_database
   :affiliation       (or affiliation (when (and non_member_organisation (pos? non_member_organisation)) non_member_organisation))
   :job_title job_title})

(defn- create-profile
  [{:keys [id photo picture about
           title first_name role
           non_member_organisation
           last_name idp_usernames
           linked_in cv twitter email
           affiliation job_title representation
           country geo_coverage_type
           reviewed_at reviewed_by review_status
           organisation_role public_email]}
   tags
   geo
   org]
  {:id id
   :title title
   :affiliation (or affiliation (when (and non_member_organisation (pos? non_member_organisation)) non_member_organisation))
   :job_title job_title
   :first_name first_name
   :last_name last_name
   :email email
   :idp_usernames idp_usernames
   :linked_in linked_in
   :twitter twitter
   :photo photo
   :picture picture
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

(defn create-new-profile [db new-profile body-params org]
  (cond-> new-profile
    (:photo body-params)
    (assoc :picture
           (cond
             (re-find #"^\/image|^http" (:photo body-params))
             (:photo body-params)
             (re-find #"^data:" (:photo body-params))
             (handler.image/assoc-image db (:photo body-params) "profile")))
    (= (:photo body-params) nil)
    (assoc :picture nil)
    (:cv body-params)
    (assoc :cv
           (if (re-find #"^\/cv" (:cv body-params))
             (:cv body-params)
             (assoc-cv db (:cv body-params))))
    (= (:cv body-params) nil)
    (assoc :cv nil)
    (and (:id org) (not= -1 (:id org)))
    (assoc :affiliation (:id org))
    (= -1 (:id org))
    (assoc :affiliation (if (= -1 (:id org))
                          (handler.org/create db org)
                          (:id org)))
    (nil? org)
    (assoc :affiliation nil)))

(defn pending-profiles-response [conn auth0-config]
  (let [profiles (db.stakeholder/pending-approval conn)
        verified-emails (set (auth0/list-auth0-verified-emails auth0-config))
        profiles-with-verified-flag (map
                                     #(merge %
                                             {:email_verified
                                              (contains? verified-emails (:email %))})
                                     profiles)]
    (resp/response profiles-with-verified-flag)))

(defn get-stakeholder-profile [db stakeholder]
  (let [conn (:spec db)
        tags (db.stakeholder/stakeholder-tags conn stakeholder)
        org (db.organisation/organisation-by-id conn {:id (:affiliation stakeholder)})
        geo-type (:geo_coverage_type stakeholder)
        geo-value (db.stakeholder/get-stakeholder-geo conn stakeholder)
        geo (cond
              (contains? #{"regional" "global with elements in specific areas"} geo-type)
              (mapv :country_group geo-value)
              (contains? #{"national" "transnational" "sub-national"} geo-type)
              (mapv :country geo-value))
        profile (create-profile stakeholder tags geo org)]
    (if (-> profile :org :is_member)
      (assoc profile :affiliation (-> profile :org :id) :non_member_organisation nil)
      (assoc profile :non_member_organisation (-> profile :org :id) :affiliation nil))))

(defn update-stakeholder [db {:keys [id] :as body-params} old-profile]
  (let [tags (into [] (concat (:tags body-params) (:offering body-params) (:seeking body-params)))
        org (:org body-params)
        new-profile (merge (dissoc old-profile :non_member_organisation)
                      (if (:non_member_organisation body-params)
                        (-> body-params (assoc :affiliation (:non_member_organisation body-params)) (dissoc :non_member_organisation))
                        body-params))
        profile (create-new-profile db new-profile body-params org)]
    (db.stakeholder/update-stakeholder db profile)
    (db.stakeholder/delete-stakeholder-geo db body-params)
    (db.stakeholder/delete-stakeholder-tags db body-params)
    (when (and (some? (:photo old-profile))
            (not= (:photo old-profile) (:picture profile))
            (not= "http" (re-find #"^http" (:photo old-profile))))
      (let [photo-url (str/split (:photo old-profile) #"\/image\/profile\/")]
        (when (= 2 (count photo-url))
          (let [old-pic (-> photo-url second Integer/parseInt)]
            (db.stakeholder/delete-stakeholder-image-by-id db {:id old-pic})))))
    (when (and (some? (:cv old-profile))
            (not= (:cv old-profile) (:cv profile)))
      (let [old-cv (-> (str/split (:cv old-profile) #"/cv/profile/") second Integer/parseInt)]
        (db.stakeholder/delete-stakeholder-cv-by-id db {:id old-cv})))
    (when (not-empty tags)
      (db.stakeholder/add-stakeholder-tags db {:tags (map #(vector id %) tags)}))
    (if (or (some? (:geo_coverage_country_groups body-params))
          (some? (:geo_coverage_countries body-params)))
      (let [geo-data (handler.geo/get-geo-vector-v2 id body-params)]
        (db.stakeholder/add-stakeholder-geo db {:geo geo-data}))
      (when (some? (:geo_coverage_value body-params))
        (let [geo-data (handler.geo/get-geo-vector id body-params)]
          (db.stakeholder/add-stakeholder-geo db {:geo geo-data}))))))

(defmethod ig/init-key :gpml.handler.stakeholder/profile [_ {:keys [db]}]
  (fn [{:keys [jwt-claims]}]
    (if-let [stakeholder (db.stakeholder/stakeholder-by-email (:spec db) jwt-claims)]
      (resp/response (get-stakeholder-profile db stakeholder))
      (resp/response {}))))

(defn- make-affiliation [db mailjet-config org]
  (if-not (:id org)
    (let [org-id (handler.org/create db org)]
      (email/notify-admins-pending-approval db mailjet-config
                                            {:title (:name org) :type "organisation"})
      (when-let [tag-ids (seq (:expertise org))]
        (db.organisation/add-organisation-tags db {:tags (map #(vector org-id %) tag-ids)}))
      org-id)
    (:id org)))

(defn- make-organisation [db org]
  (if-not (:id org)
    (let [org-id (handler.org/create db (-> (if (:subnational_area_only org)
                                              (-> org (dissoc :subnational_area_only) (assoc :subnational_area (:subnational_area_only org)))
                                              org)
                                            (assoc :is_member false)))]
      org-id)
    (:id org)))

(defmethod ig/init-key :gpml.handler.stakeholder/post [_ {:keys [db mailjet-config]}]
  (fn [{:keys [jwt-claims body-params headers]}]
    (let [profile        (make-profile (merge (assoc body-params
                                                     :affiliation (when (:org body-params)
                                                                    (make-affiliation db mailjet-config (:org body-params)))
                                                     :email (:email jwt-claims)
                                                     :idp_usernames [(:sub jwt-claims)]
                                                     :cv (or (assoc-cv db (:cv body-params))
                                                             (:cv body-params))
                                                     :picture (or (handler.image/assoc-image db (:photo body-params) "profile")
                                                                  (let [{:keys [first_name last_name]} (select-keys body-params [:first_name :last_name])]
                                                                    (format "https://ui-avatars.com/api/?size=480&name=%s+%s" first_name last_name))))
                                              (when (:new_org body-params)
                                                {:affiliation (make-organisation db (:new_org body-params))})))
          stakeholder-id (if-let [current-stakeholder (db.stakeholder/stakeholder-by-email db {:email (:email profile)})]
                           (let [idp-usernames (vec (-> current-stakeholder :idp_usernames (concat (:idp_usernames profile))))]
                             (db.stakeholder/update-stakeholder db (assoc (select-keys profile [:affiliation])
                                                                          :id (:id current-stakeholder)
                                                                          :idp_usernames idp-usernames
                                                                          :non_member_organisation nil))
                             (:id current-stakeholder))
                           (let [new-stakeholder (db.stakeholder/new-stakeholder db profile)]
                             (email/notify-admins-pending-approval db mailjet-config
                                                                   (merge profile {:type "stakeholder"}))
                             (when-let [tag-ids (seq (concat (:offering body-params) (:seeking body-params)))]
                               (db.stakeholder/add-stakeholder-tags db {:tags (map #(vector (:id new-stakeholder) %) tag-ids)}))
                             (:id new-stakeholder)))
          profile        (db.stakeholder/stakeholder-by-id db {:id stakeholder-id})
          res            (-> (merge body-params profile)
                             (dissoc :affiliation :picture :new_org)
                             (assoc :org (db.organisation/organisation-by-id db {:id (:affiliation profile)})))]
      (resp/created (:referer headers) res))))

(defmethod ig/init-key :gpml.handler.stakeholder/put [_ {:keys [db]}]
  (fn [{:keys [jwt-claims body-params]}]
    (jdbc/with-db-transaction [tx (:spec db)]
      (let [old-profile (db.stakeholder/stakeholder-by-email tx jwt-claims)]
        (update-stakeholder tx body-params old-profile)
        (resp/status 204)))))

(def ^:const suggested-profiles-per-page 5)

(defn api-suggested-profiles-opts->suggested-profiles-opts
  [suggested-profiles-opts]
  (util/update-if-exists suggested-profiles-opts :page #(Integer/parseInt %)))

(defmethod ig/init-key ::suggested-profiles
  [_ {:keys [db]}]
  (fn [{:keys [jwt-claims parameters]}]
    (if-let [stakeholder (db.stakeholder/stakeholder-by-email (:spec db) {:email (:email jwt-claims)})]
      (let [{page :page} (api-suggested-profiles-opts->suggested-profiles-opts (:query parameters))
            tags (db.stakeholder/stakeholder-tags (:spec db) stakeholder)
            offerings-ids (->> tags (filter #(= (:category %) "offering")) first :tags)
            seekings-ids (->> tags (filter #(= (:category %) "seeking")) first :tags)
            {:keys [offering-seekings seeking-offerings]}
            (handler.tag/get-offerings-seekings-matches db offerings-ids seekings-ids)
            stakeholders (db.stakeholder/get-suggested-stakeholders (:spec db) {:offering-seekings offering-seekings
                                                                                :seeking-offerings seeking-offerings
                                                                                :stakeholder-id (:id stakeholder)
                                                                                :offset (* suggested-profiles-per-page page)
                                                                                :limit suggested-profiles-per-page})]
        (cond
          (and (seq stakeholders) (= (count stakeholders) suggested-profiles-per-page))
          (resp/response {:suggested_profiles (map #(get-stakeholder-profile db %) stakeholders)})

          (not (seq stakeholders))
          (resp/response {:suggested_profiles (->> (db.stakeholder/get-recent-active-stakeholders (:spec db)
                                                                                                  {:limit suggested-profiles-per-page
                                                                                                   :stakeholder-id (:id stakeholder)})
                                                   (map #(get-stakeholder-profile db %)))})

          :else
          (resp/response {:suggested_profiles (->> (db.stakeholder/get-recent-active-stakeholders (:spec db)
                                                                                                  {:limit (- suggested-profiles-per-page (count stakeholders))
                                                                                                   :stakeholder-id (:id stakeholder)})
                                                   (apply conj stakeholders)
                                                   (map #(get-stakeholder-profile db %))
                                                   (distinct))})))
      (resp/response {}))))

(def org-schema
  (into [:map
         [:authorize_submission {:optional true} true?] ;; TODO keep optional until we align with PUT
         [:id {:optional true} int?]
         [:name {:optional true} string?]
         [:url {:optional true} string?]
         [:type {:optional true} string?] ;;representative_group
         [:representative_group_government {:optional true} string?]
         [:representative_group_private_sector {:optional true} string?]
         [:representative_group_academia_research {:optional true} string?]
         [:representative_group_civil_society {:optional true} string?]
         [:representative_group_other {:optional true} string?]
         [:subnational_area {:optional true} string?]
         [:country {:optional true} int?]
         [:expertise {:optional true}
          [:vector {:min 1 :error/message "Need at least one value for expertise"} int?]]
         [:geo_coverage_type {:optional true} geo/coverage_type]]
        handler.geo/params-payload))

(def new-org-schema
  (into
   [:map
    [:geo_coverage_type {:optional true} geo/coverage_type]
    [:country {:optional true} int?]
    [:subnational_area_only {:optional true} string?]
    [:name {:optional true} string?]]
   handler.geo/params-payload))

(defmethod ig/init-key ::suggested-profiles-params
  [_ _]
  {:query [:map
           [:page {:optional true
                   :default "0"}
            string?]]})

(defmethod ig/init-key :gpml.handler.stakeholder/post-params [_ _]
  [:map
   [:title {:optional true} string?]
   [:first_name string?]
   [:last_name string?]
   [:linked_in {:optional true} string?]
   [:twitter {:optional true} string?]
   [:photo {:optional true} string?]
   [:cv {:optional true} string?]
   [:about {:optional true} string?]
   [:country {:optional true} int?]
   [:public_email {:optional true} boolean?]
   [:public_database boolean?]
   [:non-org {:optional true} int?]
   [:geo_coverage_type {:optional true} map?]
   [:seeking {:optional true}
    [:vector {:min 1 :error/message "Need at least one value for seeking"} int?]]
   [:offering {:optional true}
    [:vector {:min 1 :error/message "Need at least one value for offering"} int?]]
   [:new_org {:optional true} new-org-schema]
   [:org {:optional true} org-schema]])

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

(defmethod ig/init-key ::get-by-id [_ {:keys [db]}]
  (fn [{{:keys [path]} :parameters}]
    (let [stakeholder (db.stakeholder/get-stakeholder-by-id (:spec db) path)]
      (resp/response
        (get-stakeholder-profile db stakeholder)))))

(defmethod ig/init-key ::put-by-admin [_ {:keys [db]}]
  (fn [{{:keys [path body]} :parameters}]
    (jdbc/with-db-transaction [tx (:spec db)]
      (let [old-profile (db.stakeholder/stakeholder-by-id tx path)]
        (update-stakeholder tx (assoc body :id (:id path)) old-profile)
        (resp/status 204)))))

(defmethod ig/init-key ::put-by-admin-params [_ _]
  {:path [:map [:id int?]]
   :body [:map
          [:id {:optional true} int?]
          [:title {:optional true} string?]
          [:first_name {:optional true} string?]
          [:last_name {:optional true} string?]
          [:job_title {:optional true} string?]
          [:linked_in {:optional true} string?]
          [:twitter {:optional true} string?]
          [:photo {:optional true} string?]
          [:cv {:optional true} string?]
          [:about {:optional true} string?]
          [:country {:optional true} int?]
          [:public_email {:optional true} boolean?]
          [:non-org {:optional true} int?]
          [:geo_coverage_type {:optional true} map?]
          [:seeking {:optional true}
           [:vector int?]]
          [:offering {:optional true}
           [:vector int?]]
          [:new_org {:optional true} new-org-schema]
          [:org {:optional true} org-schema]]})

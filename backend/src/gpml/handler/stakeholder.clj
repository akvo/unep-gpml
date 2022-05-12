(ns gpml.handler.stakeholder
  (:require
   [clojure.java.jdbc :as jdbc]
   [clojure.string :as str]
   [gpml.auth0-util :as auth0]
   [gpml.constants :as constants]
   [gpml.db.organisation :as db.organisation]
   [gpml.db.resource.tag :as db.resource.tag]
   [gpml.db.stakeholder :as db.stakeholder]
   [gpml.email-util :as email]
   [gpml.geo-util :as geo]
   [gpml.handler.geo :as handler.geo]
   [gpml.handler.image :as handler.image]
   [gpml.handler.organisation :as handler.org]
   [gpml.handler.resource.tag :as handler.resource.tag]
   [gpml.handler.tag :as handler.tag]
   [gpml.handler.util :as handler.util]
   [gpml.pg-util :as pg-util]
   [gpml.util :as util]
   [integrant.core :as ig]
   [ring.util.response :as resp])
  (:import
   [java.sql SQLException]))

(def roles-re (->> constants/user-roles
                   (map name)
                   (str/join "|")
                   (format "^(%1$s)((,(%1$s))+)?$")
                   re-pattern))

(defn- save-stakeholder-tags
  [conn mailjet-config tags stakeholder-id update?]
  (let [grouped-tags (group-by :tag_category tags)]
    (when update?
      (db.resource.tag/delete-resource-tags conn {:table "stakeholder_tag"
                                                  :resource-col "stakeholder"
                                                  :resource-id stakeholder-id}))
    (doseq [[tag-category tags] grouped-tags
            :let [opts {:tags tags
                        :tag-category tag-category
                        :resource-name "stakeholder"
                        :resource-id stakeholder-id}]]
      (handler.resource.tag/create-resource-tags conn mailjet-config opts))))

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

(defn create-new-profile [db mailjet-config new-profile body-params org]
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
                          (handler.org/create db mailjet-config org)
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

(defn update-stakeholder [db mailjet-config {:keys [id] :as body-params} old-profile]
  (let [tags (into [] (concat (:tags body-params) (:offering body-params) (:seeking body-params)))
        org (:org body-params)
        new-profile (merge (dissoc old-profile :non_member_organisation)
                           (if (:non_member_organisation body-params)
                             (-> body-params (assoc :affiliation (:non_member_organisation body-params)) (dissoc :non_member_organisation))
                             body-params))
        profile (create-new-profile db mailjet-config new-profile body-params org)]
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
      (save-stakeholder-tags db mailjet-config tags id true))
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

(defn- make-affiliation*
  [db mailjet-config org]
  (let [org-id (handler.org/create db mailjet-config org)]
    (email/notify-admins-pending-approval db mailjet-config
                                          {:title (:name org) :type "organisation"})
    org-id))

(defn- make-affiliation
  "Creates a new organisation for affiliation. If the organisation
  with the same name exists and it is a `non_member` organisation we
  MUST let the new organisation to be created and remove the
  `non_member`. If the existing organisation is already a `member`
  then we should return an error letting the caller know that an
  organisation with the same name exists. "
  [db mailjet-config org]
  (if-not (:id org)
    (try
      {:success? true
       :org-id (make-affiliation* db mailjet-config org)}
      (catch Exception e
        (if (instance? SQLException e)
          (let [reason (pg-util/get-sql-state e)]
            (if (= reason :unique-constraint-violation)
              (if-let [old-org (first (db.organisation/get-organisations db {:filters {:name (:name org)
                                                                                       :is_member false}}))]
                (do
                  (db.organisation/delete-organisation db {:id (:id old-org)})
                  {:success? true
                   :org-id (make-affiliation* db mailjet-config org)})
                {:success? false
                 :reason reason
                 :error-details {:message (.getMessage e)}})
              {:success? false
               :reason reason
               :error-details {:message (.getMessage e)}}))
          {:success? false
           :reason :could-not-create-org
           :error-details {:message (.getMessage e)}})))
    {:success? true
     :org-id (:id org)}))

(defn- save-stakeholder
  ([config req org-id]
   (save-stakeholder config req org-id false))
  ([{:keys [db mailjet-config]}
    {:keys [jwt-claims body-params headers]}
    org-id
    new-org?]
   (let [profile (make-profile (assoc body-params
                                      :affiliation org-id
                                      :email (:email jwt-claims)
                                      :idp_usernames [(:sub jwt-claims)]
                                      :cv (or (assoc-cv db (:cv body-params))
                                              (:cv body-params))
                                      :picture (or (handler.image/assoc-image db (:photo body-params) "profile")
                                                   (let [{:keys [first_name last_name]} (select-keys body-params [:first_name :last_name])]
                                                     (format "https://ui-avatars.com/api/?size=480&name=%s+%s" first_name last_name)))))
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
                            (:id new-stakeholder)))
         profile (db.stakeholder/stakeholder-by-id db {:id stakeholder-id})]
     (when new-org?
       (handler.org/update-org db mailjet-config {:id org-id :created_by stakeholder-id}))
     (when-let [tags (seq (:tags body-params))]
       (save-stakeholder-tags db mailjet-config tags stakeholder-id false))
     (resp/created (:referer headers) (-> (merge body-params profile)
                                          (dissoc :affiliation :picture)
                                          (assoc :org (db.organisation/organisation-by-id db {:id (:affiliation profile)})))))))

(defmethod ig/init-key :gpml.handler.stakeholder/post [_ {:keys [db mailjet-config] :as config}]
  (fn [{{:keys [org] :as body-params} :body-params :as req}]
    (if (:id org)
      (save-stakeholder config req (:id org))
      (let [result (make-affiliation db mailjet-config (:org body-params))]
        (if (:success? result)
          (save-stakeholder config req (:org-id result) true)
          (if (= :unique-constraint-violation (:reason result))
            {:status 409
             :headers {"content-type" "application/json"}
             :body (assoc result :reason :organisation-name-already-exists)}
            {:status 500
             :headers {"content-type" "application/json"}
             :body result}))))))

(defmethod ig/init-key :gpml.handler.stakeholder/put [_ {:keys [db mailjet-config]}]
  (fn [{:keys [jwt-claims body-params]}]
    (jdbc/with-db-transaction [tx (:spec db)]
      (let [old-profile (db.stakeholder/stakeholder-by-email tx jwt-claims)]
        (update-stakeholder tx mailjet-config body-params old-profile)
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
         [:tags {:optional true}
          [:vector {:optional true}
           [:map {:optional true}
            [:id {:optional true} pos-int?]
            [:tag string?]
            [:tag_category {:optional true} string?]]]]
         [:geo_coverage_type {:optional true} geo/coverage_type]]
        handler.geo/params-payload))

(def new-org-schema
  (into
   [:map
    [:geo_coverage_type {:optional true} geo/coverage_type]
    [:country {:optional true} int?]
    [:subnational_area_only {:optional true} string?]
    [:name {:optional true} string?]
    [:tags {:optional true}
     [:vector {:optional true}
      [:map {:optional true}
       [:id {:optional true} pos-int?]
       [:tag string?]
       [:tag_category {:optional true} string?]]]]]
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
   [:tags {:optional true}
    [:vector {:optional true}
     [:map {:optional true}
      [:id {:optional true} pos-int?]
      [:tag string?]
      [:tag_category string?]]]]
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

(defmethod ig/init-key ::put-by-admin [_ {:keys [db mailjet-config]}]
  (fn [{{:keys [path body]} :parameters}]
    (jdbc/with-db-transaction [tx (:spec db)]
      (let [old-profile (db.stakeholder/stakeholder-by-id tx path)]
        (update-stakeholder tx mailjet-config (assoc body :id (:id path)) old-profile)
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
          [:tags {:optional true}
           [:vector {:optional true}
            [:map {:optional true}
             [:id {:optional true} pos-int?]
             [:tag string?]
             [:tag_category string?]]]]
          [:new_org {:optional true} new-org-schema]
          [:org {:optional true} org-schema]]})

(ns gpml.handler.stakeholder
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.string :as str]
            [duct.logger :refer [log]]
            [gpml.constants :as constants]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.resource.tag :as db.resource.tag]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.handler.geo :as handler.geo]
            [gpml.handler.image :as handler.image]
            [gpml.handler.organisation :as handler.org]
            [gpml.handler.stakeholder.tag :as handler.stakeholder.tag]
            [gpml.handler.util :as handler.util]
            [gpml.util.email :as email]
            [gpml.util.geo :as geo]
            [gpml.util.postgresql :as pg-util]
            [integrant.core :as ig]
            [ring.util.response :as resp])
  (:import [java.sql SQLException]))

(def roles-re (->> constants/user-roles
                   (map name)
                   (str/join "|")
                   (format "^(%1$s)((,(%1$s))+)?$")
                   re-pattern))

(defmethod ig/init-key :gpml.handler.stakeholder/get [_ {:keys [db]}]
  (fn [{{{:keys [page limit email-like roles] :as query} :query} :parameters
        user :user approved? :approved?}]
    (resp/response (if (or (and approved? (= (:role user) "ADMIN"))
                           (= (:role user) :programmatic-access))
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
   :public_database   public_database
   :affiliation       (or affiliation (when (and non_member_organisation (pos? non_member_organisation)) non_member_organisation))
   :job_title job_title})

(defn- create-profile
  [{:keys [id photo picture about
           title first_name role
           non_member_organisation
           last_name idp_usernames
           linked_in cv twitter email
           affiliation job_title
           country geo_coverage_type
           reviewed_at reviewed_by review_status
           organisation_role public_email]}
   tags
   geo
   org]
  (let [{:keys [seeking offering expertise]} (->> tags
                                                  (group-by :tag_relation_category)
                                                  (reduce-kv (fn [m k v] (assoc m (keyword k) (map :tag v))) {}))]
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
     :seeking seeking
     :offering offering
     :expertise expertise
     :tags tags
     :geo_coverage_type geo_coverage_type
     :geo_coverage_value geo
     :org org
     :about about
     :role role
     :organisation_role organisation_role
     :reviewed_at reviewed_at
     :reviewed_by reviewed_by
     :review_status review_status
     :public_email public_email}))

(defn- create-new-profile
  [{:keys [logger mailjet-config] :as config} tx new-profile body-params]
  (let [{:keys [org]} body-params]
    (cond-> new-profile
      (:photo body-params)
      (assoc :picture
             (cond
               (re-find #"^\/image|^http" (:photo body-params))
               (:photo body-params)
               (re-find #"^data:" (:photo body-params))
               (handler.image/assoc-image config tx (:photo body-params) "profile")))

      (and
       (contains? body-params :photo)
       (nil? (get body-params :photo)))
      (assoc :picture nil)

      (:cv body-params)
      (assoc :cv
             (if (re-find #"^\/cv" (:cv body-params))
               (:cv body-params)
               (assoc-cv tx (:cv body-params))))

      (and
       (contains? body-params :cv)
       (nil? (get body-params :cv)))
      (assoc :cv nil)

      (and
       (:id org)
       (not= -1 (:id org)))
      (assoc :affiliation (:id org))

      (= -1 (:id org))
      (assoc :affiliation (if (= -1 (:id org))
                            (handler.org/create tx logger mailjet-config org)
                            (:id org)))
      (and
       (contains? body-params :org)
       (nil? (get body-params :org)))
      (assoc :affiliation nil))))

(defn get-stakeholder-profile [db stakeholder]
  (let [conn (:spec db)
        tags (db.resource.tag/get-resource-tags conn {:table "stakeholder_tag"
                                                      :resource-col "stakeholder"
                                                      :resource-id (:id stakeholder)})
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

(defn update-stakeholder
  [{:keys [logger mailjet-config] :as config} tx {:keys [body-params old-profile]}]
  (let [{:keys [id]} body-params
        new-profile (merge (dissoc old-profile :non_member_organisation)
                           (if (:non_member_organisation body-params)
                             (-> body-params (assoc :affiliation (:non_member_organisation body-params)) (dissoc :non_member_organisation))
                             body-params))
        profile (create-new-profile config tx new-profile body-params)
        tags (handler.stakeholder.tag/api-stakeholder-tags->stakeholder-tags body-params)]
    (db.stakeholder/update-stakeholder tx profile)
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
      (handler.stakeholder.tag/save-stakeholder-tags tx logger mailjet-config {:tags tags
                                                                               :stakeholder-id id
                                                                               :update? true}))))

(defmethod ig/init-key :gpml.handler.stakeholder/profile [_ {:keys [db]}]
  (fn [{:keys [jwt-claims]}]
    (if-let [stakeholder (db.stakeholder/stakeholder-by-email (:spec db) jwt-claims)]
      (resp/response (get-stakeholder-profile db stakeholder))
      (resp/response {}))))

(defn- make-affiliation*
  [db logger mailjet-config org]
  (let [org-id (handler.org/create db logger mailjet-config org)]
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
  [db logger mailjet-config org]
  (if-not (:id org)
    (try
      {:success? true
       :org-id (make-affiliation* db logger mailjet-config org)}
      (catch Exception e
        (if (instance? SQLException e)
          (let [reason (pg-util/get-sql-state e)]
            (if (= reason :unique-constraint-violation)
              (if-let [old-org (first (db.organisation/get-organisations db {:filters {:name (:name org)
                                                                                       :is_member false}}))]
                (do
                  (db.organisation/delete-organisation db {:id (:id old-org)})
                  {:success? true
                   :org-id (make-affiliation* db logger mailjet-config org)})
                {:success? false
                 :reason reason})
              {:success? false
               :reason reason}))
          {:success? false
           :reason :could-not-create-org
           :error-details {:message (.getMessage e)}})))
    {:success? true
     :org-id (:id org)}))

(defn- save-stakeholder
  ([config req org-id]
   (save-stakeholder config req org-id false))
  ([{:keys [db logger mailjet-config] :as config}
    {:keys [jwt-claims body-params headers]}
    org-id
    new-org?]
   (let [profile (make-profile (assoc body-params
                                      :affiliation org-id
                                      :email (:email jwt-claims)
                                      :idp_usernames [(:sub jwt-claims)]
                                      :cv (or (assoc-cv db (:cv body-params))
                                              (:cv body-params))
                                      :picture (handler.image/assoc-image config db (:photo body-params) "profile")))
         stakeholder-id (if-let [current-stakeholder (db.stakeholder/stakeholder-by-email db {:email (:email profile)})]
                          (let [idp-usernames (vec (-> current-stakeholder :idp_usernames (concat (:idp_usernames profile))))
                                expert? (seq (db.stakeholder/get-experts db {:filters {:ids [(:id current-stakeholder)]}
                                                                             :page-size 0
                                                                             :offset 0}))]
                            (db.stakeholder/update-stakeholder db (merge
                                                                   (assoc (select-keys profile [:affiliation])
                                                                          :id (:id current-stakeholder)
                                                                          :idp_usernames idp-usernames
                                                                          :non_member_organisation nil)
                                                                   (when (and expert?
                                                                              (= (:review_status current-stakeholder) "INVITED"))
                                                                     {:review_status "APPROVED"})))
                            (:id current-stakeholder))
                          (let [new-stakeholder (db.stakeholder/new-stakeholder db profile)]
                            (email/notify-admins-pending-approval db mailjet-config
                                                                  (merge profile {:type "stakeholder"}))
                            (:id new-stakeholder)))
         profile (db.stakeholder/stakeholder-by-id db {:id stakeholder-id})
         tags (handler.stakeholder.tag/api-stakeholder-tags->stakeholder-tags body-params)]
     (when new-org?
       (handler.org/update-org db logger mailjet-config {:id org-id :created_by stakeholder-id}))
     (let [save-tags-result (if (seq tags)
                              (handler.stakeholder.tag/save-stakeholder-tags
                               db
                               logger
                               mailjet-config
                               {:tags tags
                                :stakeholder-id stakeholder-id
                                :handle-errors? true})
                              {:success? true})]
       (if (:success? save-tags-result)
         (resp/created (:referer headers) (-> (merge body-params profile)
                                              (dissoc :affiliation :picture)
                                              (assoc :org (db.organisation/organisation-by-id
                                                           db
                                                           {:id (:affiliation profile)}))))
         (resp/bad-request save-tags-result))))))

(defmethod ig/init-key :gpml.handler.stakeholder/post [_ {:keys [db logger mailjet-config] :as config}]
  (fn [{{:keys [org] :as body-params} :body-params :as req}]
    (cond
      (:id org)
      (save-stakeholder config req (:id org))

      (seq org)
      (let [result (make-affiliation db logger mailjet-config (:org body-params))]
        (if (:success? result)
          (save-stakeholder config req (:org-id result) true)
          (if (= :unique-constraint-violation (:reason result))
            {:status 409
             :headers {"content-type" "application/json"}
             :body (assoc result :reason :organisation-name-already-exists)}
            {:status 500
             :headers {"content-type" "application/json"}
             :body result})))

      :else
      (save-stakeholder config req nil false))))

(defmethod ig/init-key :gpml.handler.stakeholder/put
  [_ {:keys [db logger] :as config}]
  (fn [{:keys [jwt-claims body-params]}]
    (try
      (jdbc/with-db-transaction [tx (:spec db)]
        (let [old-profile (db.stakeholder/stakeholder-by-email tx jwt-claims)]
          (update-stakeholder config tx {:body-params body-params
                                         :old-profile old-profile})
          (resp/status {:success? true} 204)))
      (catch Exception e
        (log logger :error ::failed-to-update-stakeholder {:exception-message (.getMessage e)})
        (let [response {:status 500
                        :body {:success? false
                               :reason :could-not-update-stakeholder}}]
          (if (instance? SQLException e)
            response
            (assoc-in response [:body :error-details :error] (.getMessage e))))))))

(def ^:const suggested-profiles-per-page 5)
(def ^:const default-get-suggested-profiles-page 0)

(defn api-suggested-profiles-opts->suggested-profiles-opts
  [{:keys [page] :as suggested-profiles-opts}]
  (if page
    (update suggested-profiles-opts :page #(Integer/parseInt %))
    (assoc suggested-profiles-opts :page default-get-suggested-profiles-page)))

;; TODO: Use limit got from params instead of the one hardcoded from a constant (apply the constant as default if missing).
(defmethod ig/init-key ::suggested-profiles
  [_ {:keys [db]}]
  (fn [{:keys [jwt-claims parameters]}]
    (if-let [stakeholder (db.stakeholder/stakeholder-by-email (:spec db) {:email (:email jwt-claims)})]
      (let [{page :page} (api-suggested-profiles-opts->suggested-profiles-opts (:query parameters))
            tags (db.resource.tag/get-resource-tags (:spec db) {:table "stakeholder_tag"
                                                                :resource-col "stakeholder"
                                                                :resource-id (:id stakeholder)})
            offerings-ids (->> tags
                               (filter #(= (:tag_relation_category %) "offering"))
                               (mapv #(get % :id)))
            seekings-ids (->> tags
                              (filter #(= (:tag_relation_category %) "seeking"))
                              (mapv #(get % :id)))
            stakeholders (db.stakeholder/get-suggested-stakeholders
                          (:spec db)
                          {:seeking-ids-for-offerings seekings-ids
                           :offering-ids-for-seekings offerings-ids
                           :stakeholder-id (:id stakeholder)
                           :offset (* suggested-profiles-per-page page)
                           :limit suggested-profiles-per-page})]
        (cond
          (and (seq stakeholders) (= (count stakeholders) suggested-profiles-per-page))
          (resp/response {:suggested_profiles (mapv #(get-stakeholder-profile db %) stakeholders)})

          (not (seq stakeholders))
          (resp/response {:suggested_profiles (->> (db.stakeholder/get-recent-active-stakeholders
                                                    (:spec db)
                                                    {:limit suggested-profiles-per-page
                                                     :stakeholder-ids [(:id stakeholder)]})
                                                   (mapv #(get-stakeholder-profile db %)))})

          :else
          (resp/response {:suggested_profiles (->> (db.stakeholder/get-recent-active-stakeholders
                                                    (:spec db)
                                                    {:limit (- suggested-profiles-per-page (count stakeholders))
                                                     :stakeholder-ids (conj
                                                                       (->> stakeholders
                                                                            (mapv #(get % :id))
                                                                            (remove nil?))
                                                                       (:id stakeholder))})
                                                   (apply conj (vec stakeholders))
                                                   (mapv #(get-stakeholder-profile db %)))})))
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
   [:seeking {:optional true} [:vector [:string {:min 1}]]]
   [:offering {:optional true} [:vector [:string {:min 1}]]]
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

(defmethod ig/init-key :gpml.handler.stakeholder/patch-params [_ _]
  {:path [:map [:id int?]]
   :body [:map [:role
                (apply conj [:enum] (->> constants/user-roles (map name)))]]})

(defmethod ig/init-key :gpml.handler.stakeholder/get-by-id [_ {:keys [db]}]
  (fn [{{:keys [path]} :parameters}]
    (let [stakeholder (db.stakeholder/get-stakeholder-by-id (:spec db) path)]
      (resp/response
       (get-stakeholder-profile db stakeholder)))))

(defmethod ig/init-key :gpml.handler.stakeholder/put-by-admin
  [_ {:keys [db logger] :as config}]
  (fn [{{:keys [path body]} :parameters}]
    (try
      (jdbc/with-db-transaction [tx (:spec db)]
        (let [old-profile (db.stakeholder/stakeholder-by-id tx path)]
          (update-stakeholder config tx {:body-params (assoc body :id (:id path))
                                         :old-profile old-profile})
          (resp/status {:success? true} 204)))
      (catch Exception e
        (log logger :error ::failed-to-update-stakeholder {:exception-message (.getMessage e)})
        (let [response {:status 500
                        :body {:success? false
                               :reason :could-not-update-stakeholder}}]
          (if (instance? SQLException e)
            response
            (assoc-in response [:body :error-details :error] (.getMessage e))))))))

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
          [:seeking {:optional true} [:vector [:string {:min 1}]]]
          [:offering {:optional true} [:vector [:string {:min 1}]]]
          [:expertise {:optional true} [:vector [:string {:min 1}]]]
          [:tags {:optional true}
           [:vector {:optional true}
            [:map {:optional true}
             [:id {:optional true} pos-int?]
             [:tag string?]
             [:tag_category string?]]]]
          [:new_org {:optional true} new-org-schema]
          [:org {:optional true} org-schema]]})

(ns gpml.handler.stakeholder
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.string :as str]
            [duct.logger :refer [log]]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.resource.tag :as db.resource.tag]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.domain.stakeholder :as dom.stakeholder]
            [gpml.domain.types :as dom.types]
            [gpml.handler.image :as handler.image]
            [gpml.handler.organisation :as handler.org]
            [gpml.handler.resource.geo-coverage :as handler.geo]
            [gpml.handler.resource.permission :as h.r.permission]
            [gpml.handler.responses :as r]
            [gpml.handler.stakeholder.tag :as handler.stakeholder.tag]
            [gpml.handler.util :as handler.util]
            [gpml.service.permissions :as srv.permissions]
            [gpml.util.email :as email]
            [gpml.util.geo :as geo]
            [integrant.core :as ig]
            [ring.util.response :as resp])
  (:import [java.sql SQLException]))

(def roles-re (->> dom.stakeholder/role-types
                   (str/join "|")
                   (format "^(%1$s)((,(%1$s))+)?$")
                   re-pattern))

(defmethod ig/init-key :gpml.handler.stakeholder/get [_ {:keys [db] :as config}]
  (fn [{{{:keys [page limit email-like roles] :as query} :query} :parameters
        user :user}]
    (resp/response (if (or (h.r.permission/super-admin? config (:id user))
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
   :affiliation       affiliation
   :job_title         job_title})

(defn- create-profile
  [{:keys [id photo picture about
           title first_name role
           last_name idp_usernames
           linked_in cv twitter email
           affiliation job_title
           country geo_coverage_type
           reviewed_at reviewed_by review_status
           organisation_role public_email]}
   tags
   org]
  (let [{:keys [seeking offering expertise]} (->> tags
                                                  (group-by :tag_relation_category)
                                                  (reduce-kv (fn [m k v] (assoc m (keyword k) (map :tag v))) {}))]
    {:id id
     :title title
     :affiliation affiliation
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
                            (let [org-id (handler.org/create tx logger mailjet-config (dissoc org :id))]
                              (srv.permissions/assign-roles-to-users-from-connections
                               {:conn tx
                                :logger logger}
                               {:context-type :organisation
                                :resource-id org-id
                                :individual-connections [{:role "owner"
                                                          :stakeholder (:id new-profile)}]})
                              org-id)
                            ;; TODO: We are not sure if we should remove the ownership-related role assignment
                            ;; from the user to the previous organisation, if he has changed it here.
                            (:id org)))
      (and
       (contains? body-params :org)
       (nil? (get body-params :org)))
      (assoc :affiliation nil))))

(defn- get-stakeholder-profile [db stakeholder]
  (let [conn (:spec db)
        tags (db.resource.tag/get-resource-tags conn {:table "stakeholder_tag"
                                                      :resource-col "stakeholder"
                                                      :resource-id (:id stakeholder)})
        org (db.organisation/organisation-by-id conn {:id (:affiliation stakeholder)})]
    (create-profile stakeholder tags org)))

(defn- update-stakeholder
  [{:keys [logger mailjet-config] :as config} tx {:keys [body-params old-profile]}]
  (let [{:keys [id org]} body-params
        new-profile (merge
                     old-profile
                     (if (:id org)
                       (-> body-params (assoc :affiliation (:id org)) (dissoc :org :org-name))
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

(defn- create-stakeholder!
  [conn logger new-sth]
  (let [result (db.stakeholder/new-stakeholder conn new-sth)
        sth-id (:id result)
        role-assignments [{:role-name :unapproved-user
                           :context-type :application
                           :resource-id srv.permissions/root-app-resource-id
                           :user-id sth-id}]]
    (srv.permissions/create-resource-context
     {:conn conn
      :logger logger}
     {:context-type :stakeholder
      :resource-id sth-id})
    (srv.permissions/assign-roles-to-users
     {:conn conn
      :logger logger}
     role-assignments)
    sth-id))

(defn- update-stakeholder-profile
  [conn old-sth new-sth]
  (let [idp-usernames (-> (concat (:idp_usernames old-sth)
                                  (:idp_usernames new-sth))
                          distinct
                          vec)
        expert? (seq (db.stakeholder/get-experts conn {:filters {:ids [(:id old-sth)]}
                                                       :page-size 0
                                                       :offset 0}))
        to-update (merge
                   (assoc (select-keys new-sth [:affiliation])
                          :id (:id old-sth)
                          :idp_usernames idp-usernames
                          :non_member_organisation nil)
                   (when (and expert?
                              (= (:review_status old-sth) "INVITED"))
                     {:review_status "APPROVED"}))]
    (db.stakeholder/update-stakeholder conn to-update)
    (:id old-sth)))

;; FIXME: The permissions metadata adding part is not right, as we are re-creating org related to the new stakeholder,
;; so we need to handle that and ensure we get the right resource-id for the permissions.
(defn- save-stakeholder
  [{:keys [db logger mailjet-config] :as config}
   {{:keys [body]} :parameters
    :keys [jwt-claims] :as _req}]
  (try
    (jdbc/with-db-transaction [tx (:spec db)]
      (let [org (:org body)
            new-sth (make-profile (assoc body
                                         :affiliation (:id org)
                                         :email (:email jwt-claims)
                                         :idp_usernames [(:sub jwt-claims)]
                                         :cv (or (assoc-cv tx (:cv body))
                                                 (:cv body))
                                         :picture (handler.image/assoc-image config
                                                                             tx
                                                                             (:photo body)
                                                                             "profile")))
            old-sth (db.stakeholder/stakeholder-by-email tx {:email (:email new-sth)})
            sth-id (if old-sth
                     (update-stakeholder-profile tx old-sth new-sth)
                     (create-stakeholder! tx logger new-sth))
            tags (handler.stakeholder.tag/api-stakeholder-tags->stakeholder-tags body)
            save-tags-result (if-not (seq tags)
                               {:success? true}
                               (handler.stakeholder.tag/save-stakeholder-tags tx
                                                                              logger
                                                                              mailjet-config
                                                                              {:tags tags
                                                                               :stakeholder-id sth-id
                                                                               :handle-errors? true}))
            save-org-result (cond
                              ;; The user is being created with either:
                              ;;
                              ;; 1. A new non-member
                              ;; organisation. This is an assumption
                              ;; that both FE and BE are aligned
                              ;; with. New users are only allowed to
                              ;; SELECT an existing MEMBER
                              ;; organisation or CREATE a
                              ;; NON-MEMBER. If they choose to create
                              ;; a non-member, the org will be created
                              ;; before the user profile is
                              ;; submitted. Once they submit the
                              ;; profile, the non-member organisation
                              ;; will be passed as payload. So here
                              ;; with `(not (:is_member org))` we are
                              ;; signaling that it's a new non-member
                              ;; organisation.
                              ;;
                              ;; 2. If the user selected a member
                              ;; organisation, then it isn't a new
                              ;; organisation and we shouldn't do
                              ;; anything.
                              ;;
                              ;; Signaling that it's a new
                              ;; organisation means that the user is
                              ;; the creator and we should set the
                              ;; `created_by` field in the
                              ;; organisation's entity table.
                              (:id org)
                              (let [old-org (first (db.organisation/get-organisations tx
                                                                                      {:filters {:id (:id org)}}))]
                                (if-not (:is_member old-org)
                                  (do
                                    ;; We assign `resource-owner` role to the stakeholder that has created the org,
                                    ;; as it is a non-member organisation that he can edit without being approved yet.
                                    (srv.permissions/assign-roles-to-users-from-connections
                                     {:conn tx
                                      :logger logger}
                                     {:context-type :organisation
                                      :resource-id (:id org)
                                      :individual-connections [{:role "owner"
                                                                :stakeholder sth-id}]})
                                    {:success? (boolean (handler.org/update-org tx
                                                                                logger
                                                                                mailjet-config
                                                                                {:id (:id org)
                                                                                 :created_by sth-id}))})
                                  ;; This means the org is a MEMBER, approved organisation, where the stakeholder
                                  ;; should not have ownership permissions, so we don't need to do anything else.
                                  {:success? true}))

                              :else
                              {:success? true})
            new-sth (db.stakeholder/stakeholder-by-id tx {:id sth-id})]
        (when-not (:success? save-tags-result)
          (throw (ex-info "Failed to save stakeholder tags." save-tags-result)))
        (when-not (:success? save-org-result)
          (throw (ex-info "Failed to create or update organisation." save-org-result)))
        (when-not old-sth
          (email/notify-admins-pending-approval tx
                                                mailjet-config
                                                (merge new-sth {:type "stakeholder"})))
        ;; FIXME: we are not adding the `:success?` key here because
        ;; it would break the FE, as it expects a JSON with the
        ;; stakeholder fields. We would need to sync with FE to change
        ;; this.
        (r/created (-> (merge body new-sth)
                       (dissoc :affiliation :picture)
                       (assoc :org (db.organisation/organisation-by-id
                                    tx
                                    {:id (:affiliation new-sth)}))))))
    (catch Exception e
      (let [{:keys [reason]} (ex-data e)]
        (log logger :error ::failed-to-create-or-update-stakeholder {:exception-message (ex-message e)})
        (if (= reason :organisation-name-already-exists)
          (r/conflict {:success? false
                       :reason reason})
          (r/server-error {:success? false
                           :reason :failed-to-create-or-update-profile
                           :error-details {:error (ex-message e)}}))))))

(defmethod ig/init-key :gpml.handler.stakeholder/post
  [_ config]
  (fn [req]
    (save-stakeholder config req)))

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

(defmethod ig/init-key :gpml.handler.stakeholder/suggested-profiles
  [_ {:keys [db]}]
  (fn [{:keys [jwt-claims parameters]}]
    (if-let [stakeholder (db.stakeholder/stakeholder-by-email (:spec db) {:email (:email jwt-claims)})]
      (let [{page :page limit :limit} (:query parameters)
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
                           :offset (* limit page)
                           :limit limit})]
        (cond
          (and (seq stakeholders) (= (count stakeholders) limit))
          (resp/response {:suggested_profiles (mapv #(get-stakeholder-profile db %) stakeholders)})

          (not (seq stakeholders))
          (resp/response {:suggested_profiles (->> (db.stakeholder/get-recent-active-stakeholders
                                                    (:spec db)
                                                    {:limit limit
                                                     :stakeholder-ids [(:id stakeholder)]})
                                                   (mapv #(get-stakeholder-profile db %)))})

          :else
          (resp/response {:suggested_profiles (->> (db.stakeholder/get-recent-active-stakeholders
                                                    (:spec db)
                                                    {:limit (- limit (count stakeholders))
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
         [:program {:optional true} string?]
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
        handler.geo/api-geo-coverage-schemas))

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
   handler.geo/api-geo-coverage-schemas))

(defmethod ig/init-key :gpml.handler.stakeholder/suggested-profiles-params
  [_ _]
  {:query [:map
           [:page
            {:default 0}
            [:int
             {:min 0}]]
           [:limit
            {:default 5}
            pos-int?]]})

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

(defmethod ig/init-key :gpml.handler.stakeholder/get-params [_ _]
  {:query [:map
           [:page {:default 1}
            int?]
           [:limit {:default 10}
            int?]
           [:review-status {:optional true}
            (apply conj [:enum] (remove #{"REVIEWER"} dom.types/review-statuses))]
           [:roles {:optional true}
            [:re roles-re]]
           [:email-like {:optional true}
            string?]]})

(defmethod ig/init-key :gpml.handler.stakeholder/patch
  [_ {:keys [db logger] :as config}]
  (fn [{{{:keys [id]} :path
         {:keys [role]} :body}
        :parameters
        user :user}]
    (if (h.r.permission/super-admin? config (:id user))
      (try
        (jdbc/with-db-transaction [tx (:spec db)]
          (let [target-user (db.stakeholder/stakeholder-by-id tx {:id id})
                prev-user-role (:role target-user)
                params {:role role :reviewed_by (:id user) :id id}
                count (db.stakeholder/update-stakeholder-role tx params)]
            (if (or (= prev-user-role role)
                    (not (contains? #{prev-user-role role} "ADMIN")))
              (resp/response {:status (if (= count 1) "success" "failed")})
              (let [{:keys [success?]} (if (= "ADMIN" prev-user-role)
                                         (srv.permissions/remove-user-from-super-admins
                                          {:conn tx
                                           :logger logger}
                                          id)
                                         (srv.permissions/make-user-super-admin
                                          {:conn tx
                                           :logger logger}
                                          id))]
                (if success?
                  (resp/response {:status "success"})
                  (throw (ex-info "Error making the user super-admin in RBAC"
                                  {:reason :error-updating-rbac-super-admins})))))))
        (catch Throwable e
          (log logger :error ::failed-to-update-stakeholder-role {:exception-message (.getMessage e)})
          (let [response {:status 500
                          :body {:success? false
                                 :reason :could-not-update-stakeholder-role}}]
            (if (instance? SQLException e)
              response
              (assoc-in response [:body :error-details :error] (.getMessage e))))))
      (r/forbidden {:message "Unauthorized"}))))

(defmethod ig/init-key :gpml.handler.stakeholder/patch-params [_ _]
  {:path [:map [:id int?]]
   :body [:map [:role
                (apply conj [:enum] dom.stakeholder/role-types)]]})

(defmethod ig/init-key :gpml.handler.stakeholder/get-by-id
  [_ {:keys [db] :as config}]
  (fn [{{:keys [path]} :parameters user :user}]
    (if (or (h.r.permission/super-admin? config (:id user))
            (= (:id path) (:id user)))
      (let [stakeholder (db.stakeholder/get-stakeholder-by-id (:spec db) path)]
        (resp/response
         (get-stakeholder-profile db stakeholder)))
      (r/forbidden {:message "Unauthorized"}))))

(defmethod ig/init-key :gpml.handler.stakeholder/put-restricted
  [_ {:keys [db logger] :as config}]
  (fn [{{:keys [path body]} :parameters user :user}]
    (if (or (h.r.permission/super-admin? config (:id user))
            (= (:id path) (:id user)))
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
              (assoc-in response [:body :error-details :error] (.getMessage e))))))
      (r/forbidden {:message "Unauthorized"}))))

(defmethod ig/init-key :gpml.handler.stakeholder/put-restricted-params [_ _]
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
          [:affiliation {:optional true} [:maybe pos-int?]]
          [:tags {:optional true}
           [:vector {:optional true}
            [:map {:optional true}
             [:id {:optional true} pos-int?]
             [:tag string?]
             [:tag_category string?]]]]
          [:new_org {:optional true} new-org-schema]
          [:org {:optional true} org-schema]]})

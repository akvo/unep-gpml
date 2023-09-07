(ns gpml.handler.stakeholder
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.string :as str]
            [duct.logger :refer [log]]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.resource.tag :as db.resource.tag]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.domain.stakeholder :as dom.stakeholder]
            [gpml.domain.types :as dom.types]
            [gpml.handler.resource.geo-coverage :as handler.geo]
            [gpml.handler.resource.permission :as h.r.permission]
            [gpml.handler.responses :as r]
            [gpml.handler.stakeholder.tag :as handler.stakeholder.tag]
            [gpml.handler.util :as handler.util]
            [gpml.service.permissions :as srv.permissions]
            [gpml.service.stakeholder :as srv.stakeholder]
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

(defn- make-profile
  [{:keys [title first_name last_name email
           idp_usernames linked_in public_database
           public_email affiliation
           job_title twitter
           country about
           cv picture org tags]}]
  {:title             title
   :first_name        first_name
   :last_name         last_name
   :email             email
   :idp_usernames     idp_usernames
   :linked_in         linked_in
   :twitter           twitter
   :about             about
   :country           country
   :public_email      (boolean public_email)
   :public_database   public_database
   :affiliation       affiliation
   :job_title         job_title
   :cv                cv
   :picture           picture
   :org               org
   :tags              tags})

(defn- create-profile
  [{:keys [id about
           title first-name role
           last-name idp-usernames
           linked-in cv picture twitter email
           affiliation job-title
           country geo-coverage-type
           reviewed-at reviewed-by review-status
           organisation-role public-email tags org]}]
  (let [{:keys [seeking offering expertise]} (->> tags
                                                  (group-by :tag_relation_category)
                                                  (reduce-kv (fn [m k v] (assoc m (keyword k) (map :tag v))) {}))]
    {:id id
     :title title
     :affiliation affiliation
     :job_title job-title
     :first_name first-name
     :last_name last-name
     :email email
     :idp_usernames idp-usernames
     :linked_in linked-in
     :twitter twitter
     :country country
     :seeking seeking
     :offering offering
     :expertise expertise
     :tags tags
     :geo_coverage_type geo-coverage-type
     :org org
     :about about
     :role role
     :organisation_role organisation-role
     :reviewed_at reviewed-at
     :reviewed_by reviewed-by
     :review_status review-status
     :public_email public-email
     :cv cv
     :picture picture}))

(defn- get-stakeholder-profile
  [config stakeholder-id]
  (let [result (srv.stakeholder/get-stakeholder-profile config stakeholder-id)]
    (when (:success? result)
      (create-profile (:stakeholder result)))))

(defmethod ig/init-key :gpml.handler.stakeholder/profile
  [_ config]
  (fn [{:keys [user]}]
    (if-let [user-id (:id user)]
      (r/ok (or (get-stakeholder-profile config user-id) {}))
      (r/ok {}))))

(defn- create-stakeholder
  [config stakeholder]
  (let [result (srv.stakeholder/create-stakeholder config
                                                   stakeholder)]
    (if (:success? result)
      (get-in result [:stakeholder :id])
      (throw (ex-info "Failed to create stakeholder" result)))))

(defn- update-stakeholder
  [config stakeholder]
  (let [result (srv.stakeholder/update-stakeholder config
                                                   stakeholder)]
    (if (:success? result)
      (get-in result [:stakeholder :id])
      (throw (ex-info "Failed to update stakeholder" {:result result})))))

(defn- save-stakeholder
  [{:keys [db logger mailjet-config] :as config}
   {{:keys [body]} :parameters
    :keys [jwt-claims headers] :as _req}]
  (try
    (let [conn (:spec db)
          org (:org body)
          tags (handler.stakeholder.tag/api-stakeholder-tags->stakeholder-tags body)
          new-sth (make-profile (assoc body
                                       :affiliation (:id org)
                                       :email (:email jwt-claims)
                                       :idp_usernames [(:sub jwt-claims)]
                                       :picture {:payload (:picture body)
                                                 :user-agent (get headers "user-agent")}
                                       :tags tags
                                       :org org))
          old-sth (db.stakeholder/stakeholder-by-email conn {:email (:email new-sth)})
          sth-id (if old-sth
                   (update-stakeholder config (assoc new-sth :id (:id old-sth)))
                   (create-stakeholder config new-sth))
          new-sth (db.stakeholder/stakeholder-by-id conn {:id sth-id})]
      (when-not old-sth
        (email/notify-admins-pending-approval conn
                                              mailjet-config
                                              (merge new-sth {:type "stakeholder"})))
      ;; FIXME: we are not adding the `:success?` key here because
      ;; it would break the FE, as it expects a JSON with the
      ;; stakeholder fields. We would need to sync with FE to change
      ;; this.
      (r/created (-> (merge body new-sth)
                     (dissoc :affiliation :picture :cv)
                     (assoc :org (db.organisation/organisation-by-id
                                  conn
                                  {:id (:affiliation new-sth)})))))
    (catch Throwable t
      (let [{:keys [reason]} (ex-data t)]
        (log logger :error ::failed-to-create-or-update-stakeholder {:exception-message (ex-message t)})
        (if (= reason :organisation-name-already-exists)
          (r/conflict {:success? false
                       :reason reason})
          (r/server-error {:success? false
                           :reason :failed-to-create-or-update-profile
                           :error-details {:error (ex-message t)}}))))))

(defmethod ig/init-key :gpml.handler.stakeholder/post
  [_ config]
  (fn [req]
    (save-stakeholder config req)))

(defmethod ig/init-key :gpml.handler.stakeholder/put
  [_ {:keys [logger] :as config}]
  (fn [{:keys [body-params headers user]}]
    (try
      (let [tags (handler.stakeholder.tag/api-stakeholder-tags->stakeholder-tags body-params)]
        (update-stakeholder config (-> body-params
                                       (assoc :id (:id user)
                                              :picture {:payload (:picture body-params)
                                                        :user-agent (get headers "user-agent")}
                                              :tags tags)
                                       (dissoc :review_status)))
        (resp/status {:success? true} 204))
      (catch Exception e
        (log logger :error ::failed-to-update-stakeholder {:exception-message (.getMessage e)})
        (let [response {:status 500
                        :body {:success? false
                               :reason :could-not-update-stakeholder}}]
          (if (instance? SQLException e)
            response
            (assoc-in response [:body :error-details :error] (.getMessage e))))))))

(defmethod ig/init-key :gpml.handler.stakeholder/suggested-profiles
  [_ {:keys [db] :as config}]
  (fn [{:keys [jwt-claims parameters user]}]
    (if-not (h.r.permission/operation-allowed?
             config
             {:user-id (:id user)
              :entity-type :application
              :entity-id srv.permissions/root-app-resource-id
              :custom-permission :read-suggested-profiles
              :root-context? true})
      (r/forbidden {:message "Unauthorized"})
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
            (resp/response {:suggested_profiles (->> stakeholders
                                                     (mapv #(get-stakeholder-profile config (:id %)))
                                                     (remove nil?)
                                                     vec)})

            (not (seq stakeholders)) (resp/response {:suggested_profiles (->> (db.stakeholder/get-recent-active-stakeholders
                                                                               (:spec db)
                                                                               {:limit limit
                                                                                :stakeholder-ids [(:id stakeholder)]})
                                                                              (mapv #(get-stakeholder-profile config (:id %)))
                                                                              (remove nil?)
                                                                              vec)})

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
                                                     (mapv #(get-stakeholder-profile config (:id %)))
                                                     (remove nil?)
                                                     vec)})))
        (resp/response {:suggested_profiles []})))))

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
   [:picture {:optional true} string?]
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
  [_ config]
  (fn [{{:keys [path]} :parameters user :user}]
    (if (or (h.r.permission/super-admin? config (:id user))
            (= (:id path) (:id user)))
      (r/ok (or (get-stakeholder-profile config (:id path)) {}))
      (r/forbidden {:message "Unauthorized"}))))

(defmethod ig/init-key :gpml.handler.stakeholder/put-restricted
  [_ {:keys [logger] :as config}]
  (fn [{{:keys [path body]} :parameters user :user :as req}]
    (if (or (h.r.permission/super-admin? config (:id user))
            (= (:id path) (:id user)))
      (try
        (let [tags (handler.stakeholder.tag/api-stakeholder-tags->stakeholder-tags body)]
          (update-stakeholder config (assoc body
                                            :id (:id path)
                                            :tags tags
                                            :picture {:payload (:picture body)
                                                      :user-agent (get-in req [:headers "user-agent"])}))
          (resp/status {:success? true} 204))
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
          [:picture {:optional true} string?]
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

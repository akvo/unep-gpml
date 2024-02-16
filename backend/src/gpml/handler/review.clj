(ns gpml.handler.review
  (:require
   [clojure.java.jdbc :as jdbc]
   [clojure.set :as set]
   [clojure.string :as str]
   [duct.logger :refer [log]]
   [gpml.db.review :as db.review]
   [gpml.db.stakeholder :as db.stakeholder]
   [gpml.domain.stakeholder :as dom.stakeholder]
   [gpml.domain.types :as dom.types]
   [gpml.handler.resource.permission :as h.r.permission]
   [gpml.handler.responses :as r]
   [gpml.handler.util :as util]
   [gpml.service.permissions :as srv.permissions]
   [gpml.util.email :as email]
   [gpml.util.regular-expressions :as util.regex]
   [integrant.core :as ig]
   [malli.util :as mu]
   [ring.util.response :as resp])
  (:import [java.sql SQLException]))

(defn- reviews-by-reviewer-id [conn opts]
  (map (fn [{:keys [details] :as review}]
         (let [[title picture] details]
           (-> review
               (assoc :title title)
               (assoc :picture picture)
               (dissoc :details))))
       (db.review/reviews-by-reviewer-id conn opts)))

(def ^:private review-status-re
  (->> dom.types/reviewer-review-statuses
       (map symbol)
       (str/join "|")
       (format "^(%1$s)((,(%1$s))+)?$")
       re-pattern))

(defn- api-opts->opts
  [{:keys [roles q]}]
  (cond-> {}
    (seq roles)
    (assoc-in [:filters :roles] (str/split roles #","))

    (seq q)
    (assoc-in [:filters :search-text] (str/lower-case q))

    true
    (assoc-in [:filters :review-statuses] ["APPROVED"])))

(defn- reviewer->api-reviewer
  [reviewer]
  (select-keys reviewer [:id :first_name :last_name :email :role]))

(defn- get-reviewers
  [{:keys [db logger]} query]
  (try
    (let [opts (api-opts->opts query)
          conn (:spec db)
          reviewers (db.stakeholder/get-stakeholders conn opts)]
      (resp/response {:success? true
                      :reviewers (map reviewer->api-reviewer reviewers)}))
    (catch Exception e
      (log logger :error ::failed-to-get-reviewers {:exception-message (.getMessage e)})
      (let [response {:status 500
                      :body {:success? false
                             :reason :could-not-get-reviewers}}]

        (if (instance? SQLException e)
          response
          (assoc response :error-details {:error (.getMessage e)}))))))

(defn- new-review*
  [{:keys [logger conn mailjet-config topic-type topic-id assigned-by]} c reviewer-id]
  (let [params {:topic-type topic-type
                :topic-id topic-id
                :assigned-by assigned-by
                :reviewer reviewer-id}
        reviewer (db.stakeholder/stakeholder-by-id conn {:id reviewer-id})
        reviewer-name (email/get-user-full-name reviewer)
        new-review (db.review/new-review conn params)
        review (db.review/review-by-id conn new-review)
        role-assignments [{:role-name :resource-reviewer
                           :context-type (h.r.permission/entity-type->context-type topic-type)
                           :resource-id topic-id
                           :user-id reviewer-id}]]
    (srv.permissions/assign-roles-to-users
     {:conn conn
      :logger logger}
     role-assignments)
    (email/send-email mailjet-config
                      email/unep-sender
                      (format "[%s] Review requested on new %s" (:app-name mailjet-config) topic-type)
                      (list {:Name reviewer-name :Email (:email reviewer)})
                      (list (email/notify-reviewer-pending-review-text reviewer-name (:app-domain mailjet-config) topic-type (:title review)))
                      (list nil))
    (conj c review)))

(defn- new-multiple-review
  [logger db mailjet-config topic-type topic-id reviewers assigned-by]
  (let [topic-type* (util/get-internal-topic-type topic-type)]
    (jdbc/with-db-transaction [conn (:spec db)]
      (db.review/delete-reviews conn {:topic-type topic-type* :topic-id topic-id})
      (resp/response {:reviews (reduce (partial new-review* {:logger logger
                                                             :conn conn
                                                             :mailjet-config mailjet-config
                                                             :topic-type topic-type*
                                                             :topic-id topic-id
                                                             :assigned-by assigned-by})
                                       []
                                       reviewers)}))))

(defn- change-reviewers
  [logger db mailjet-config topic-type topic-id reviewers user]
  (let [topic-type* (util/get-internal-topic-type topic-type)
        assigned-by (:id user)]
    (jdbc/with-db-transaction [tx (:spec db)]
      (let [reviews (db.review/reviews-filter tx {:topic-type topic-type* :topic-id topic-id})
            current-reviewers (set (map :reviewer reviews))
            [reviewers-to-delete reviewers-to-create reviewers-to-keep] (let [news (set reviewers)
                                                                              olds (set current-reviewers)
                                                                              to-keep (set/intersection news olds)
                                                                              to-delete (set/difference olds news)
                                                                              to-create (set/difference news olds)]
                                                                          [to-delete to-create to-keep])
            reviews-to-delete (filter #(contains? reviewers-to-delete (:reviewer %)) reviews)]
        (doseq [r reviews-to-delete]
          (let [review-id (:id r)
                role-unassignments [{:role-name :resource-reviewer
                                     :context-type (h.r.permission/entity-type->context-type topic-type)
                                     :resource-id topic-id
                                     :user-id (:reviewer r)}]]
            (db.review/delete-review-by-id tx {:id review-id})
            (srv.permissions/unassign-roles-from-users
             {:conn tx
              :logger logger}
             role-unassignments)))
        (resp/response {:reviews (into
                                  reviewers-to-keep
                                  (reduce (partial new-review* {:logger logger
                                                                :conn tx
                                                                :mailjet-config mailjet-config
                                                                :topic-type topic-type*
                                                                :topic-id topic-id
                                                                :assigned-by assigned-by}) [] reviewers-to-create))})))))

(defn- update-review-status
  [db mailjet-config topic-type topic-id review-status review-comment user]
  (let [topic-type* (util/get-internal-topic-type topic-type)]
    (jdbc/with-db-transaction [conn (:spec db)]
      (if-let [review (first (db.review/reviews-filter
                              conn
                              {:topic-type topic-type* :topic-id topic-id :reviewer (:id user)}))]
                                ;; If assigned to the current-user
        (if (= (:reviewer review) (:id user))
          (let [review-id (db.review/update-review-status
                           conn
                           {:id (:id review)
                            :review-status review-status
                            :review-comment review-comment})
                admin (db.stakeholder/stakeholder-by-id conn {:id (:assigned_by review)})]
            (email/send-email mailjet-config
                              email/unep-sender
                              (format "[%s] Review submitted on %s: %s" (:app-name mailjet-config) topic-type (:title review))
                              (list {:Name (email/get-user-full-name admin) :Email (:email admin)})
                              (list (email/notify-review-submitted-text
                                     (email/get-user-full-name admin) (:app-domain mailjet-config) topic-type (:title review) review-status review-comment))
                              (list nil))
            (resp/response review-id))
          (r/not-found))
        (r/not-found)))))

(defn- list-reviews
  [db reviewer page limit status only]
  (let [conn (:spec db)
        review-status (and status (str/split status #","))
        params {:reviewer (:id reviewer) :page page :limit limit :review-status review-status
                :only only}
        reviews (reviews-by-reviewer-id conn params)
        count (:count (db.review/count-by-reviewer-id conn params))
        pages (util/page-count count limit)]
    (resp/response {:reviews reviews :page page :limit limit :pages pages :count count})))

(defmethod ig/init-key :gpml.handler.review/get-reviewers
  [_ config]
  (fn [{{:keys [query]} :parameters user :user}]
    (if (h.r.permission/super-admin? config (:id user))
      (get-reviewers config query)
      (r/forbidden {:message "Unauthorized"}))))

(defmethod ig/init-key :gpml.handler.review/new-multiple-review
  [_ {:keys [db mailjet-config logger] :as config}]
  (fn [{{{:keys [topic-type topic-id]} :path
         {:keys [reviewers]} :body} :parameters
        user :user
        :as req}]
    (try
      (if (h.r.permission/super-admin? config (:id user))
        (new-multiple-review logger db mailjet-config topic-type topic-id reviewers (:id user))
        (r/forbidden {:message "Unauthorized"}))
      (catch Throwable t
        (let [log-data {:exception-message (ex-message t)
                        :exception-data (ex-data t)
                        :context-data {:req-params (:parameters req)
                                       :user-id (:id user)}}]
          (log logger :error :failed-add-multiple-reviews log-data)
          (log logger :debug :failed-add-multiple-reviews (assoc log-data :stack-trace (.getStackTrace t)))
          (r/server-error {:success? false}))))))

(defn- get-reviews [db topic-type topic-id]
  (let [conn (:spec db)
        topic-type (util/get-internal-topic-type topic-type)
        reviews (db.review/reviews-filter
                 conn
                 {:topic-type topic-type :topic-id topic-id})]
    (resp/response reviews)))

(defmethod ig/init-key :gpml.handler.review/update-review
  [_ {:keys [logger db mailjet-config] :as config}]
  (fn [{{{:keys [topic-type topic-id]} :path
         {:keys [review-status review-comment reviewers]} :body} :parameters
        user :user}]
    (if reviewers
      (if (h.r.permission/super-admin? config (:id user))
        (change-reviewers logger db mailjet-config topic-type topic-id reviewers user)
        (r/forbidden {:message "Unauthorized"}))
      (if (h.r.permission/operation-allowed?
           config
           {:user-id (:id user)
            :entity-type (h.r.permission/entity-type->context-type topic-type)
            :entity-id topic-id
            :operation-type :review})
        (update-review-status db mailjet-config topic-type topic-id review-status review-comment user)
        (r/forbidden {:message "Unauthorized"})))))

(defmethod ig/init-key :gpml.handler.review/get-reviews
  [_ {:keys [db] :as config}]
  (fn [{{{:keys [topic-type topic-id]} :path} :parameters user :user}]
    (if (h.r.permission/super-admin? config (:id user))
      (get-reviews db topic-type topic-id)
      (r/forbidden {:message "Unauthorized"}))))

(defmethod ig/init-key :gpml.handler.review/list-user-reviews
  [_ {:keys [db] :as config}]
  (fn [{{{:keys [page limit review-status only]} :query} :parameters
        user :user}]
    (if (h.r.permission/operation-allowed?
         config
         {:user-id (:id user)
          :entity-type :application
          :custom-permission :list-assigned-reviews
          :root-context? true})
      (list-reviews db user page limit review-status only)
      (r/forbidden {:message "Unauthorized"}))))

(defmethod ig/init-key :gpml.handler.review/get-reviewers-params [_ _]
  (let [possible-roles-txt (str/join "|" dom.stakeholder/role-types)
        error-message (str "Allowed values: " possible-roles-txt)]
    {:query
     [:map
      [:roles {:optional true
               :error/message error-message
               :swagger {:description (str "Comma separated list of user roles. Possible values: " possible-roles-txt)
                         :type "string"}}
       [:and
        [:string {:min 1}]
        [:re {:error/message error-message} (util.regex/comma-separated-enums-re dom.stakeholder/role-types)]]]
      [:q {:optional true
           :swagger {:description "Search text query."
                     :type "string"}}
       [:string {:min 1}]]]}))

(defmethod ig/init-key :gpml.handler.review/list-user-reviews-params [_ _]
  {:query
   [:map
    [:page {:optional true
            :default 1}
     int?]
    [:limit {:optional true
             :default 10}
     int?]
    [:only {:optional true} [:enum "resources" "stakeholders"]]
    [:review-status {:optional true}
     [:re review-status-re]]]})

(defmethod ig/init-key :gpml.handler.review/review-status-params [_ _]
  (apply conj [:enum] dom.types/reviewer-review-statuses))

(defmethod ig/init-key :gpml.handler.review/get-reviewers-responses [_ _]
  {200 {:body
        [:map
         [:success? boolean?]
         [:reviewers
          [:sequential
           (mu/select-keys dom.stakeholder/Stakeholder [:id :first_name :last_name :email :role])]]]}
   500 {:body
        [:map
         [:success? boolean?]
         [:reason keyword?]
         [:error-details {:optional true}
          [:map
           [:error [:string]]]]]}})

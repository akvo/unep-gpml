(ns gpml.handler.stakeholder.expert
  (:require
   [clojure.java.jdbc :as jdbc]
   [clojure.string :as str]
   [duct.logger :refer [log]]
   [gpml.db.invitation :as db.invitation]
   [gpml.db.stakeholder :as db.stakeholder]
   [gpml.handler.stakeholder :as handler.stakeholder]
   [gpml.handler.stakeholder.tag :as handler.stakeholder.tag]
   [gpml.pg-util :as pg-util]
   [gpml.util :as util]
   [gpml.util.email :as email]
   [integrant.core :as ig]
   [jsonista.core :as json]
   [ring.util.response :as resp])
  (:import
   [java.sql SQLException]))

(def get-experts-params
  [:map
   [:tags
    {:optional true
     :swagger {:description "Comma separated list of tags."
               :type "string"}}
    [:string {:min 1}]]
   [:countries
    {:optional true
     :swagger {:description "Comma separated list of countries' IDs."
               :type "string"}}
    [:string {:min 1}]]
   [:page_size
    {:optional true
     :default 12
     :swagger {:description "Maximum number of elements per page. (Max: 12)"
               :type "integer"}}
    [:int {:min 1 :max 12}]]
   [:page_n
    {:optional true
     :default 0
     :swagger {:description "Page number"
               :type "integer"}}
    [:int {:min 0}]]])

(def get-experts-response
  [:map
   [:experts [:fn coll?]]
   [:count [:int {:min 0}]]])

(def invite-experts-params
  [:vector
   [:map
    [:first_name
     {:optional false
      :swagger {:description "Stakeholder's first name."
                :type "string"}}
     [:string {:min 1}]]
    [:last_name
     {:optional false
      :swagger {:description "Stakeholder's last name."
                :type "string"}}
     [:string {:min 1}]]
    [:email
     {:optional false
      :swagger {:description "Stakeholder's email address."
                :type "string"}}
     [:string {:min 1}]]
    [:expertise {:optional true} [:vector [:string {:min 1}]]]]])

(def invite-experts-response
  [:map
   [:success?
    [:boolean]]
   [:invited-experts
    [:vector
     [:map
      [:id
       {:swagger {:description "The invitation ID."
                  :type "string"
                  :format "uuid"}}
       [:string {:min 1}]]
      [:stakeholder_id
       {:swagger {:description "Stakeholder's ID."
                  :type "integer"}}
       [:int {:min 0}]]
      [:email
       {:swagger {:description "Stakeholder's email"
                  :type "string"}}
       [:string {:min 1}]]]]]])

(defn- api-opts->opts
  [{:keys [page_size page_n tags countries]}]
  (cond-> {}
    page_size
    (assoc :page-size page_size)

    page_n
    (assoc :page-n page_n :offset (* page_size page_n))

    (seq tags)
    (assoc-in [:filters :tags] (map str/lower-case (str/split tags #",")))

    (seq countries)
    (assoc-in [:filters :countries] (map #(Integer/parseInt %) (str/split countries #",")))

    true
    (assoc-in [:filters :experts?] true)))

(defn- expert->api-expert
  [expert]
  (merge expert (handler.stakeholder.tag/unwrap-tags expert)))

(defn- get-experts
  [{:keys [db]}
   {{:keys [query]} :parameters :as _req}]
  (try
    (let [opts (api-opts->opts query)
          experts (db.stakeholder/get-experts (:spec db) opts)
          experts-count (-> (db.stakeholder/get-experts (:spec db) (assoc opts :count-only? true))
                            first
                            :count)]
      (resp/response {:experts (map expert->api-expert experts)
                      :count experts-count}))
    (catch Exception e
      (if (instance? SQLException e)
        {:status 500
         :body {:success? false
                :reason (pg-util/get-sql-state e)}}
        {:status 500
         :reason :could-not-get-experts
         :error-details {:exception-message (.getMessage e)}}))))

(defn- send-invitation-emails
  [{:keys [mailjet-config app-domain logger]} invitations]
  (try
    (doseq [{invitation-id :id
             first-name :first_name
             last-name :last_name
             email :email :as invitation} invitations
            :let [msg (email/notify-expert-invitation-text first-name last-name invitation-id app-domain)]]
      (let [{:keys [status body]} (email/send-email mailjet-config
                                                    email/unep-sender
                                                    "Join the UNEP GPML Platform"
                                                    [{:Name (str first-name " " last-name)
                                                      :Email email}]
                                                    [msg]
                                                    [nil])]
        (when-not (<= 200 status 299)
          (log logger :error ::send-invitation-email-failed {:context-data invitation
                                                             :email-msg msg
                                                             :response-body (json/read-value body json/keyword-keys-object-mapper)}))))
    (catch Exception e
      (log logger :error ::send-invitation-emails-failed {:exception-message (.getMessage e)
                                                          :context-data {:invitations invitations}}))))

(defn- invite-experts
  [{:keys [db mailjet-config logger] :as config}
   {{:keys [body]} :parameters}]
  (try
    (jdbc/with-db-transaction [conn (:spec db)]
      (let [experts (map #(select-keys % [:first_name :last_name :email]) body)
            expert-cols (-> experts first keys)
            expert-values (util/apply-select-values experts expert-cols)
            expert-stakeholders (db.stakeholder/create-stakeholders conn {:cols (map name expert-cols)
                                                                          :values expert-values})
            invitation-values (map (fn [{:keys [id email]}]
                                     (vector (util/uuid) id email))
                                   expert-stakeholders)
            experts-by-email (group-by :email experts)
            invitations (->> (db.invitation/create-invitations conn {:values invitation-values})
                             (map #(merge % (get-in experts-by-email [(:email %) 0]))))]
        (doseq [{:keys [email expertise]} body
                :let [stakeholder-id (get-in (group-by :email expert-stakeholders) [email 0 :id])]]
          (handler.stakeholder/save-stakeholder-tags conn
                                                     mailjet-config
                                                     {:tags (handler.stakeholder/prep-stakeholder-tags {:expertise expertise})
                                                      :stakeholder-id stakeholder-id}))
        (future (send-invitation-emails config invitations))
        (resp/response {:success? true
                        :invited-experts (map #(update % :id str) invitations)})))
    (catch Exception e
      (log logger :error ::invite-experts-error {:exception-message (.getMessage e)})
      (if (instance? SQLException e)
        {:status 500
         :body {:success? false
                :reason (if (= :unique-constraint-violation (pg-util/get-sql-state e))
                          :stakeholder-email-already-exists
                          (pg-util/get-sql-state e))}}
        {:status 500
         :body {:success? false
                :reason :could-not-create-expert}}))))

(defmethod ig/init-key :gpml.handler.stakeholder.expert/get [_ config]
  (fn [req]
    (get-experts config req)))

(defmethod ig/init-key :gpml.handler.stakeholder.expert/post [_ config]
  (fn [req]
    (invite-experts config req)))

(defmethod ig/init-key :gpml.handler.stakeholder.expert/get-params [_ _]
  {:query get-experts-params})

(defmethod ig/init-key :gpml.handler.stakeholder.expert/get-response [_ _]
  {200 {:body get-experts-response}})

(defmethod ig/init-key :gpml.handler.stakeholder.expert/post-params [_ _]
  {:body invite-experts-params})

(defmethod ig/init-key :gpml.handler.stakeholder.expert/post-response [_ _]
  {200 {:body invite-experts-response}})

(ns gpml.auth
  (:require [gpml.db.comment :as db.comment]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.project :as db.prj]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.topic-stakeholder-auth :as db.ts-auth]
            [gpml.handler.responses :as r]
            [gpml.util :as util]
            [integrant.core :as ig]
            [malli.core :as malli])
  (:import [com.auth0.jwk JwkProvider JwkProviderBuilder]
           [com.auth0.jwt JWT]
           [com.auth0.jwt.impl JsonNodeClaim]
           [com.auth0.utils.tokens IdTokenVerifier PublicKeyProvider SignatureVerifier]))

(def verifier-opts
  [:map
   [:issuer [:re #"^https://\S+/$"]]
   [:audience [:re #"^\S+$"]]])

(defn validate-opts
  [opts]
  (or (malli/validate verifier-opts opts)
      (throw
       (ex-info "Invalid IdToken verifier options"
                (malli/explain verifier-opts opts)))))

(defn signature-verifier [issuer]
  (let [jwk-provider (-> issuer
                         (JwkProviderBuilder.)
                         (.build))
        public-key-provider (reify PublicKeyProvider
                              (getPublicKeyById [this key-id]
                                (.getPublicKey (.get ^JwkProvider jwk-provider key-id))))]
    (SignatureVerifier/forRS256 public-key-provider)))

(defn token-verifier [{:keys [issuer audience signature-verifier]}]
  (.build
   (IdTokenVerifier/init issuer
                         audience
                         signature-verifier)))

(defn get-claims
  [token]
  (reduce-kv (fn [m ^String k ^JsonNodeClaim v]
               (assoc m (keyword k) (case k
                                      "email_verified" (.asBoolean v)
                                      "iat" (.asDate v)
                                      "exp" (.asDate v)
                                      (.asString v))))
             {}
             (into {} (.getClaims (JWT/decode token)))))

(defmethod ig/prep-key :gpml.auth/auth-middleware [_ opts]
  (when (validate-opts opts)
    opts))

(defmethod ig/prep-key :gpml.auth/auth-middleware-ckan [_ opts]
  (when (validate-opts opts)
    opts))

(defn check-authentication
  ([request verify-fn]
   (check-authentication request verify-fn :user))
  ([request verify-fn auth-middleware-type]
   (if-let [auth-header (get-in request [:headers "authorization"])]
     (let [[_ token] (re-find #"^Bearer (\S+)$" auth-header)
           [valid? error-msg-or-claims] (verify-fn token)]
       (cond
         valid?
         {:authenticated? true
          :jwt-claims error-msg-or-claims}

         (and (= auth-middleware-type :programmatic)
              (not (contains? request :authenticated?)))
         {:authenticated? false
          :auth-error-message error-msg-or-claims
          :status 403}

         (= auth-middleware-type :programmatic)
         {}

         :else
         {:authenticated? false
          :auth-error-message error-msg-or-claims
          :status 403}))
     {:authenticated? false
      :auth-error-message "Authentication required"
      :status 401})))

(defn check-approved [conn {:keys [jwt-claims]}]
  (let [stakeholder (and (:email jwt-claims)
                         (:email_verified jwt-claims)
                         (db.stakeholder/stakeholder-by-email conn jwt-claims))]
    {:approved? (= "APPROVED" (:review_status stakeholder))
     :user (or stakeholder nil)}))

(defn id-token-verifier
  [signature-verifier opts]
  (fn [token]
    (let [id-token-verifier (token-verifier (assoc opts :signature-verifier signature-verifier))]
      (try
        (.verify ^IdTokenVerifier id-token-verifier token)
        [true (get-claims token)]
        (catch Exception e
          [false (.getMessage e)])))))

(defmethod ig/init-key :gpml.auth/auth-middleware [_ opts]
  (fn [handler]
    (let [signature-verifier (signature-verifier (:issuer opts))]
      (fn [request]
        (let [conn (-> opts :db :spec)
              auth-info (check-authentication
                         request
                         (id-token-verifier signature-verifier opts))
              user-info (check-approved conn auth-info)]
          (handler (merge request auth-info user-info)))))))

(defn- auth-middleware-programmatic
  [opts]
  (fn [handler]
    (let [signature-verifier (signature-verifier (:issuer opts))]
      (fn [request]
        (let [auth-info (check-authentication
                         request
                         (id-token-verifier signature-verifier opts)
                         :programmatic)
              user-info {:user {:role :programmatic-access}}]
          (cond
            (:authenticated? auth-info)
            (handler (merge request auth-info user-info))

            (seq auth-info)
            (handler (merge request auth-info))

            :else
            (handler request)))))))

(defmethod ig/init-key :gpml.auth/auth-middleware-ckan [_ opts]
  (auth-middleware-programmatic opts))

(defmethod ig/init-key :gpml.auth/auth-middleware-auth0-actions [_ opts]
  (auth-middleware-programmatic opts))

(defmethod ig/init-key :gpml.auth/auth-middleware-gpml-programmatic [_ opts]
  (auth-middleware-programmatic opts))

(defmethod ig/init-key :gpml.auth/auth-required [_ _]
  (fn [handler]
    (fn [request]
      (if (:authenticated? request)
        (handler request)
        {:status (:status request)
         :body {:message (:auth-error-message request)}}))))

(defmethod ig/init-key :gpml.auth/approved-user [_ _]
  (fn [handler]
    (fn [{:keys [approved? jwt-claims] :as request}]
      (if approved?
        (handler request)
        (if (:email_verified jwt-claims)
          {:status 403
           :headers {"content-type" "unauthorized"}
           :body {:message "Unauthorized"
                  :reason "User does not exist or is not approved yet"}}
          {:status 403
           :headers {"content-type" "unauthorized"}
           :body {:message "Unauthorized"
                  :reason "User must verify the email address"}})))))

(defmethod ig/init-key :gpml.auth/admin-required-middleware [_ _]
  (fn [handler]
    (fn [{:keys [user approved?] :as request}]
      (if (and approved? (= "ADMIN" (:role user)))
        (handler (assoc request :admin user))
        {:status 403
         :body {:message "Unauthorized"}}))))

(defmethod ig/init-key :gpml.auth/admin-or-reviewer-required-middleware [_ _]
  (fn [handler]
    (fn [{:keys [user approved?] :as request}]
      (if (and approved? (contains? #{"ADMIN" "REVIEWER"} (:role user)))
        (handler (assoc request :reviewer user))
        {:status 403
         :body {:message "Unauthorized"}}))))

(defmethod ig/init-key :gpml.auth/restrict-to-admin-and-comment-author-middleware
  [_ {:keys [db]}]
  (fn [handler]
    (fn [{:keys [user parameters] :as request}]
      (let [{:keys [path body]} parameters
            comment (first (db.comment/get-resource-comments (:spec db) {:id (util/uuid (or (:id path) (:id body)))}))]
        (if (or (some #{(:role user)} ["ADMIN"])
                (= (:author_id comment) (:id user)))
          (handler request)
          {:status 403
           :body {:message "Unauthorized"}})))))

(defmethod ig/init-key :gpml.auth/restrict-to-organisation-admin-or-owner
  [_ {:keys [db]}]
  (fn [handler]
    (fn [{{:keys [path]} :parameters user :user :as request}]
      (let [stakeholder-auth-roles
            (->> (db.ts-auth/get-topic-stakeholder-auths (:spec db)
                                                         {:filters {:topic-types ["organisation"]
                                                                    :topics-ids [(:id path)]
                                                                    :stakeholder [(:id user)]}})
                 first
                 :roles
                 set)
            organisation (first (db.organisation/get-organisations (:spec db)
                                                                   {:filters {:created_by (:id user)}}))
            org-creator? (= (:id user) (:created_by organisation))]
        (if (or (= (:role user) "ADMIN")
                org-creator?
                (some #(get stakeholder-auth-roles %) ["owner" "focal-point"]))
          (handler request)
          {:status 403
           :headers {"content-type" "application/json"}
           :body {:message "Unauthorized"
                  :reason "User don't have the necessary permissions to edit this organisation."}})))))

(defmethod ig/init-key :gpml.auth/restrict-to-project-owner
  [_ {:keys [db]}]
  (fn [handler]
    (fn [{{:keys [path]} :parameters user :user :as request}]
      (let [db-opts (db.prj/opts->db-opts {:stakeholders_ids [(:id user)]
                                           :ids [(:id path)]})
            project (first (db.prj/get-projects (:spec db) {:filters db-opts}))]
        (if (seq project)
          (handler request)
          (r/unauthorized {:message "Unauthorized"
                           :reason "User don't have the necessary permissions to edit or read the project."}))))))

(def owners-schema
  [:owners {:optional true}
   [:vector integer?]])

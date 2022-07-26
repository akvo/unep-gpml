(ns gpml.handler.auth
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.set :as set]
            [duct.logger :refer [log]]
            [gpml.constants :as constants]
            [gpml.db.topic-stakeholder-auth :as db.ts-auth]
            [gpml.domain.stakeholder :as dom.stakeholder]
            [gpml.domain.topic-stakeholder-auth :as dom.ts-auth]
            [gpml.handler.util :as util]
            [integrant.core :as ig]
            [malli.util :as mu]
            [ring.util.response :as resp])
  (:import [java.sql SQLException]))

(def ^:private shared-path-params
  [:map
   [:topic-type (apply conj [:enum] constants/topics)]
   [:topic-id [:int {:min 0}]]
   [:stakeholder [:int {:min 0}]]])

(defn grant-topic-to-stakeholder!
  [conn {:keys [topic-id topic-type stakeholder-id roles]}]
  {:pre [(empty? (set/difference (set roles) dom.ts-auth/role-types))]}
  (let [opts {:topic-id    topic-id
              :topic-type  topic-type
              :stakeholder stakeholder-id
              :roles       roles}]
    (db.ts-auth/new-auth conn opts)))

(defn- max-focal-points?
  "Checks whether a resource has reached the maximum amount of focal
  points roles assignment."
  [{:keys [db]} {:keys [topic-type topic-id] :as params}]
  (let [stakeholder-auths
        (db.ts-auth/get-topic-stakeholder-auths db
                                                {:filters {:roles ["focal-point"]
                                                           :topics-ids [topic-id]
                                                           :topics-type [topic-type]}})]
    (< (count stakeholder-auths) dom.ts-auth/max-focal-points)))

(defmethod ig/init-key :gpml.handler.auth/get-topic-auth
  [_ {:keys [db logger]}]
  (fn [{{:keys [path]} :parameters user :user}]
    (try
      (let [conn (:spec db)
            authorized? user
            path (update path :topic-type util/get-internal-topic-type)]
        (if authorized?
          (if-let [data (db.ts-auth/get-auth-by-topic conn path)]
            (resp/response (assoc (merge path {:auth-stakeholders data}) :success? true))
            util/not-found)
          util/unauthorized))
      (catch Exception e
        (log logger :error ::failed-to-get-topic-auth {:exception-message (.getMessage e)
                                                       :context-data path})
        (let [response {:status 500
                        :body {:success? false
                               :reason :failed-to-get-topic-auth}}]
          (if (instance? SQLException e)
            response
            (assoc-in response [:body :error-details :error] (.getMessage e))))))))

(defmethod ig/init-key :gpml.handler.auth/post-topic-auth
  [_ {:keys [db logger] :as config}]
  (fn [{{:keys [path body]} :parameters user :user}]
    (try
      (let [conn (:spec db)
            authorized? user
            path        (update path :topic-type util/get-internal-topic-type)]
        (if authorized?
          (if (and (= "organisation" (:topic-type path))
                   (max-focal-points? config path))
            (resp/bad-request {:success? false
                               :reason :maximum-focal-points-reached})
            (do
              (jdbc/with-db-transaction [tx-conn conn]
                (db.ts-auth/delete-auth-by-topic tx-conn path)
                (doseq [s (:stakeholders body)]
                  (grant-topic-to-stakeholder! tx-conn
                                               (assoc path
                                                      :stakeholder-id (:id s)
                                                      :roles (:roles s)))))
              (resp/response (assoc (merge path body) :success? true))))
          util/unauthorized))
      (catch Exception e
        (log logger :error ::failed-to-grant-topic-to-stakeholder {:exception-message (.getMessage e)
                                                                   :context-data path})
        (let [response {:status 500
                        :body {:success? false
                               :reason :failed-to-grant-topic-to-stakeholder}}]
          (if (instance? SQLException e)
            response
            (assoc-in response [:body :error-details :error] (.getMessage e))))))))

(defmethod ig/init-key :gpml.handler.auth/get-topic-stakeholder-auth
  [_ {:keys [db logger]}]
  (fn [{{:keys [path]} :parameters user :user}]
    (try
      (let [conn (:spec db)
            authorized? user
            path (update path :topic-type util/get-internal-topic-type)]
        (if authorized?
          (if-let [data (db.ts-auth/get-auth-by-topic-and-stakeholder conn path)]
            (resp/response (assoc (merge path data) :success? true))
            util/not-found)
          util/unauthorized))
      (catch Exception e
        (log logger :error ::failed-to-get-stakeholder-auth {:exception-message (.getMessage e)
                                                             :context-data path})
        (let [response {:status 500
                        :body {:success? false
                               :reason :failed-to-get-topic-stakeholder-auth}}]
          (if (instance? SQLException e)
            response
            (assoc-in response [:body :error-details :error] (.getMessage e))))))))

(defmethod ig/init-key :gpml.handler.auth/new-roles [_ {:keys [db logger]}]
  (fn [{{:keys [path body] :as config} :parameters user :user}]
    (try
      (let [conn (:spec db)
            authorized? user
            path (update path :topic-type util/get-internal-topic-type)]
        (if authorized?
          (if (and (= "organisation" (:topic-type path))
                   (get (set (:roles body)) "focal-point")
                   (max-focal-points? config path))
            (resp/bad-request {:success? false
                               :reason :maximum-focal-points-reached})
            (do
              (db.ts-auth/new-auth conn (merge path body))
              (resp/response (assoc (merge path body) :success? true))))
          util/unauthorized))
      (catch Exception e
        (log logger :error ::failed-to-add-new-roles-to-stakeholder {:exception-message (.getMessage e)
                                                                     :context-data {:path path
                                                                                    :body body}})
        (let [response {:status 500
                        :body {:success? false
                               :reason :failed-to-add-new-roles-to-stakeholder}}]
          (if (instance? SQLException e)
            response
            (assoc-in response [:body :error-details :error] (.getMessage e))))))))

(defmethod ig/init-key :gpml.handler.auth/update-roles
  [_ {:keys [db logger] :as config}]
  (fn [{{:keys [path body]} :parameters user :user}]
    (try
      (let [conn (:spec db)
            authorized? user
            path (update path :topic-type util/get-internal-topic-type)]
        (if authorized?
          (if (and (= "organisation" (:topic-type path))
                   (get (set (:roles body)) "focal-point")
                   (max-focal-points? config path))
            (resp/bad-request {:success? false
                               :reason :maximum-focal-points-reached})
            (do
              (db.ts-auth/update-auth conn (merge path body))
              (resp/response (assoc (merge path body) :success? true))))
          util/unauthorized))
      (catch Exception e
        (log logger :error ::failed-to-update-roles {:exception-message (.getMessage e)
                                                     :context-data {:path path
                                                                    :body body}})
        (let [response {:status 500
                        :body {:success? false
                               :reason :failed-to-update-roles}}]
          (if (instance? SQLException e)
            response
            (assoc-in response [:body :error-details :error] (.getMessage e))))))))

(defmethod ig/init-key :gpml.handler.auth/delete
  [_ {:keys [db logger]}]
  (fn [{{:keys [path body]} :parameters user :user}]
    (try
      (let [conn (:spec db)
            authorized? user
            path (update path :topic-type util/get-internal-topic-type)]
        (if authorized?
          (do
            (db.ts-auth/delete-auth conn path)
            (resp/response (assoc (merge path body) :success? true)))
          util/unauthorized))
      (catch Exception e
        (log logger :error ::failed-to-delete-topic-stakeholder-auth {:exception-message (.getMessage e)
                                                                      :context-data {:path path
                                                                                     :body body}})
        (let [response {:status 500
                        :body {:success? false
                               :reason :failed-to-delete-topic-stakeholder-auth}}]
          (if (instance? SQLException e)
            response
            (assoc-in response [:body :error-details :error] (.getMessage e))))))))

(defmethod ig/init-key :gpml.handler.auth/get-topic-auth-params [_ _]
  {:path (mu/dissoc shared-path-params :stakeholder)})

(defmethod ig/init-key :gpml.handler.auth/post-topic-auth-params [_ _]
  {:path (mu/dissoc shared-path-params :stakeholder)
   :body [:map
          [:stakeholders
           [:vector (-> dom.stakeholder/Stakeholder
                        (mu/select-keys [:id])
                        (mu/assoc :roles (mu/get dom.ts-auth/TopicStakeholderAuth :roles)))]]]})

(defmethod ig/init-key :gpml.handler.auth/delete-params [_ _]
  {:path shared-path-params})

(defmethod ig/init-key :gpml.handler.auth/new-roles-params [_ _]
  {:path shared-path-params
   :body (mu/select-keys dom.ts-auth/TopicStakeholderAuth [:roles])})

(defmethod ig/init-key :gpml.handler.auth/get-topic-stakeholder-auth-params [_ _]
  {:path shared-path-params})

(defmethod ig/init-key :gpml.handler.auth/update-roles-params [_ _]
  {:path shared-path-params
   :body (mu/select-keys dom.ts-auth/TopicStakeholderAuth [:roles])})

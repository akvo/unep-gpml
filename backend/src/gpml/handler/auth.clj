(ns gpml.handler.auth
  (:require
   [clojure.java.jdbc :as jdbc]
   [clojure.string :as str]
   [duct.logger :refer [log]]
   [gpml.domain.stakeholder :as dom.stakeholder]
   [gpml.domain.topic-stakeholder-auth :as dom.ts-auth]
   [gpml.domain.types :as dom.types]
   [gpml.handler.resource.permission :as h.r.permission]
   [gpml.handler.responses :as r]
   [gpml.handler.util :as util]
   [gpml.service.association :as srv.association]
   [integrant.core :as ig]
   [malli.util :as mu]
   [medley.core :as medley]
   [taoensso.timbre :as timbre]))

(def ^:private shared-path-params
  [:map
   [:topic-type (apply conj [:enum] dom.types/topic-types)]
   [:topic-id [:int {:min 0}]]
   [:stakeholder [:int {:min 0}]]])

(defn- ->sth-associations [stakeholders associations]
  (reduce (fn [updated-associations {:keys [id roles]}]
            (let [old-acs (medley/find-first (fn [acs]
                                               (and (= (:stakeholder acs) id)
                                                    (= (:role acs) (first roles))))
                                             associations)
                  role (first roles)]
              (if (seq old-acs)
                (conj updated-associations {:id (:id old-acs)
                                            :stakeholder id
                                            :role role})
                (conj updated-associations {:stakeholder id
                                            :role role}))))
          []
          stakeholders))

(defmethod ig/init-key :gpml.handler.auth/post-topic-auth
  [_ {:keys [db logger] :as config}]
  (fn [{{:keys [path body]} :parameters user :user}]
    (try
      (if-not (h.r.permission/super-admin? config (:id user))
        (r/forbidden {:message "Unauthorized"})
        (let [conn (:spec db)
              resource-id (:topic-id path)
              resource-type (-> (:topic-type path)
                                (util/get-internal-topic-type))]
          (jdbc/with-db-transaction [tx conn]
            (let [stakeholders (:stakeholders body)
                  associations (srv.association/get-associations {:conn tx
                                                                  :logger logger}
                                                                 {:table (str "stakeholder_" resource-type)
                                                                  :resource-col resource-type
                                                                  :filters {:resource-id resource-id}})
                  sth-associations (->sth-associations stakeholders associations)]
              (if (and (= "organisation" resource-type)
                       (> (count sth-associations) dom.ts-auth/max-focal-points))
                (throw (ex-info "Maximum focal points reached" {:reason :maximum-focal-points-reached}))
                (srv.association/save-sth-associations {:conn tx
                                                        :logger logger}
                                                       {:sth-associations sth-associations
                                                        :resource-type (str/replace resource-type \_ \-)
                                                        :resource-id resource-id}))
              (r/ok (merge {:success? true} path body))))))
      (catch Exception t
        (timbre/with-context+ path
          (log logger :error :failed-to-grant-topic-to-stakeholder t))
        (let [{:keys [reason]} (ex-data t)]
          (if (= reason :maximum-focal-points-reached)
            (r/bad-request {:success? false
                            :reason reason})
            (r/server-error {:success? false
                             :reason :failed-to-grant-topic-to-stakeholder
                             :error-details {:error (ex-message t)}})))))))

(defmethod ig/init-key :gpml.handler.auth/post-topic-auth-params [_ _]
  {:path (mu/dissoc shared-path-params :stakeholder)
   :body [:map
          [:stakeholders
           [:vector (-> dom.stakeholder/Stakeholder
                        (mu/select-keys [:id])
                        (mu/assoc :roles (mu/get dom.ts-auth/TopicStakeholderAuth :roles)))]]]})

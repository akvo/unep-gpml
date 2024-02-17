(ns gpml.handler.badge
  (:require
   [camel-snake-kebab.core :refer [->kebab-case]]
   [camel-snake-kebab.extras :as cske]
   [duct.logger :refer [log]]
   [gpml.db.badge :as db.badge]
   [gpml.domain.types :as dom.types]
   [gpml.handler.resource.permission :as h.r.permission]
   [gpml.handler.responses :as r]
   [integrant.core :as ig])
  (:import
   (java.sql SQLException)))

(defn- get-badge-by-id-or-name [{:keys [db]} badge-id-or-name]
  (db.badge/get-badge-by-id-or-name
   (:spec db)
   (if (integer? badge-id-or-name)
     {:id badge-id-or-name}
     {:name badge-id-or-name})))

(defn- handle-badge-assignment [{:keys [db]} {:keys [assign entity-type entity-id badge-id assigned-by]}]
  (let [badge-assignment-table (keyword (format "%s_badge" (name entity-type)))
        badge-assignment-entity-col (keyword (format "%s_id" (name entity-type)))
        badge-assignment {:badge-assignment-table badge-assignment-table
                          :badge-assignment-entity-col badge-assignment-entity-col
                          :badge-id badge-id
                          :badge-assignment-entity-id entity-id
                          :assigned-by assigned-by}]
    (if assign
      (db.badge/add-badge-assignment (:spec db) badge-assignment entity-type)
      (db.badge/remove-badge-assignment (:spec db) badge-assignment))))

(defmethod ig/init-key :gpml.handler.badge/get
  [_ {:keys [logger] :as config}]
  (fn [req]
    (try
      (let [badge-id-or-name (get-in req [:parameters :path :id-or-name])
            {:keys [success? reason] :as result} (get-badge-by-id-or-name config badge-id-or-name)]
        (if success?
          (r/ok result)
          (if (= reason :not-found)
            (r/not-found {})
            (r/server-error result))))
      (catch Exception t
        (log logger :error ::get-badge-failed {:exception-message (.getMessage t)})
        (r/server-error {:success? false
                         :reason :could-not-get-badge
                         :error-details {:message (.getMessage t)}})))))

(def ^:private common-badge-path-params-schema
  [:map
   [:id-or-name
    {:swagger
     {:description "The Badge's name or its id."
      :allowEmptyValue false}}
    [:or
     [:int {:min 1}]
     [:string {:min 1}]]]])

(def ^:private handle-badge-assignment-body-params-schema
  [:map
   [:assign
    {:swagger {:description "A boolean value that determines if the entity is assigned to the badge or not."
               :type "boolean"}}
    [:boolean]]
   [:entity_id
    {:swagger {:description "The entity ID to assign/unassign."
               :type "integer"}}
    [:int {:min 1}]]
   [:entity_type
    {:swagger {:description "The entity type to assign/unassign."
               :type "string"
               :enum (map name dom.types/badge-assignable-entity-types)}}
    (dom.types/get-type-schema :badge-assignable-entity-type)]])

(defmethod ig/init-key :gpml.handler.badge/get-params
  [_ _]
  {:path common-badge-path-params-schema})

(defmethod ig/init-key :gpml.handler.badge.assign/post
  [_ {:keys [logger] :as config}]
  (fn [{:keys [parameters user]}]
    (try
      (let [badge-id-or-name (get-in parameters [:path :id-or-name])
            {:keys [badge success? reason] :as result} (get-badge-by-id-or-name config badge-id-or-name)]
        (if-not success?
          (if (= reason :not-found)
            (r/not-found {:reason :badge-not-found})
            (r/server-error (dissoc result :success?)))
          (if-not (or (h.r.permission/operation-allowed? config
                                                         {:user-id (:id user)
                                                          :entity-type :badge
                                                          :entity-id (if (seq badge)
                                                                       (:id badge)
                                                                       badge-id-or-name)
                                                          :operation-type :assign
                                                          :root-context? false})
                      ;; FIXME: This is a bypass as per internal
                      ;; decision. This should be removed in the
                      ;; future and dealt with enterily with RBAC
                      ;; system.
                      (= (:name badge) "country-validated"))
            (r/forbidden {:message "Unauthorized"})
            (let [badge-id (if (seq badge)
                             (:id badge)
                             badge-id-or-name)
                  body-params (-> (cske/transform-keys ->kebab-case (:body parameters))
                                  (assoc :badge-id badge-id)
                                  (assoc :assigned-by (:id user)))
                  {:keys [success? reason]} (handle-badge-assignment config body-params)]
              (cond
                success?
                (r/ok {})

                (= reason :already-exists)
                (r/conflict {:reason :already-exists})

                (get #{:badge-not-found :entity-not-found} reason)
                (r/not-found {:reason reason})

                :else
                (r/server-error (dissoc result :success?)))))))
      (catch Exception t
        (log logger :error ::failed-to-assign-or-unassign-badge {:exception-message (.getMessage t)})
        (let [response {:success? false
                        :reason :could-not-assign-or-unassign-badge}]

          (if (instance? SQLException t)
            (r/server-error response)
            (r/server-error (assoc-in response [:error-details :error] (.getMessage t)))))))))

(defmethod ig/init-key :gpml.handler.badge.assign/post-params
  [_ _]
  {:path common-badge-path-params-schema
   :body handle-badge-assignment-body-params-schema})

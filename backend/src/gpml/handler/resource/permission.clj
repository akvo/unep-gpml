(ns gpml.handler.resource.permission
  (:require [clojure.string :as str]
            [dev.gethop.rbac :as rbac]
            [gpml.domain.resource :as dom.resource]
            [gpml.service.permissions :as srv.permissions]))

(defn entity-type->context-type
  [entity-type]
  (cond
    (some #{entity-type} dom.resource/types)
    :resource

    :else (keyword (str/replace entity-type "_" "-"))))

;; TODO: Add pre condition for ensuring a valid operation-type value
(defn operation-allowed?
  "FIXME: Add docstring"
  [{:keys [db logger]}
   {:keys [user-id entity-type entity-id operation-type root-context? custom-permission custom-context-type]}]
  (let [context-type-entity (entity-type->context-type (name entity-type))
        [context-type resource-id] (if-not root-context?
                                     [context-type-entity entity-id]
                                     [srv.permissions/root-app-context-type srv.permissions/root-app-resource-id])
        permission-ns-name (cond
                             custom-permission
                             (name custom-permission)

                             (and root-context? entity-type)
                             (str (name operation-type) "-" (name context-type-entity))

                             :else
                             (name operation-type))
        permission (keyword (name context-type) permission-ns-name)]
    (rbac/has-permission
     (:spec db)
     logger
     user-id
     resource-id
     (if custom-context-type
       custom-context-type
       context-type)
     permission)))

(defn super-admin?
  "FIXME: Add docstring"
  [{:keys [db logger]} user-id]
  (let [{:keys [success? super-admin?]} (rbac/super-admin? (:spec db) logger user-id)]
    (and success? super-admin?)))

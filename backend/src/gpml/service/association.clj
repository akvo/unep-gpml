(ns gpml.service.association
  (:require [clojure.string :as str]
            [gpml.db.rbac-util :as db.rbac-util]
            [gpml.db.resource.association :as db.res.acs]
            [gpml.service.permissions :as srv.permissions]
            [medley.core :as medley]))

(defn get-associations-diff
  "FIXME:"
  [new-acs old-acs]
  (reduce
   (fn [acs-diff {:keys [id] :as acs}]
     (let [in-existing (some #(when (= id (:id %)) %) old-acs)
           in-updated (some #(when (= id (:id %)) %) new-acs)
           to-create? (not id)]
       (cond
         to-create?
         (update acs-diff :to-create conj acs)

         (and in-existing (not in-updated))
         (update acs-diff :to-delete conj in-existing)

         (and in-updated in-existing (not= (:role in-updated) (:role in-existing)))
         (update acs-diff :to-update conj (assoc in-updated :old-role (:role in-existing)))

         :else
         acs-diff)))
   {:to-create []
    :to-delete []
    :to-update []}
   (medley/distinct-by
    (fn [x] (or (:id x) x))
    (concat new-acs old-acs))))

(defn- get-sth-org-role-assignments
  [conn resource-type resource-id org-id]
  (if-let [focal-points (seq (db.res.acs/get-resource-associations
                              conn
                              {:table "stakeholder_organisation"
                               :resource-col "organisation"
                               :resource-assoc-type "organisation_association"
                               :filters {:resource-id org-id
                                         :associations ["focal-point"]}}))]
    (reduce
     (fn [role-assignments {:keys [stakeholder]}]
       (conj role-assignments {:user-id stakeholder
                               :role-name :resource-owner
                               :resource-id resource-id
                               :context-type (keyword resource-type)}))
     []
     focal-points)
    []))

(defn org-associations->rbac-role-assignments
  "FIXME:"
  [conn resource-type resource-id org-associations]
  (reduce
   (fn [org-role-assignments {:keys [organisation old-role role]}]
     (if-not (get #{"owner"} (or old-role role))
       org-role-assignments
       (let [rbac-role-assignments (get-sth-org-role-assignments conn resource-type resource-id organisation)]
         (if (seq rbac-role-assignments)
           (concat org-role-assignments rbac-role-assignments)
           org-role-assignments))))
   []
   org-associations))

(defn- get-sth-org-focal-point-role-unassignments
  "Gets the role unassignments for a stakeholder `sth-id` that is
  associated with an organisation `org-id` as a
  `focal-point`. Stakeholders can do operations on behalf of an
  organisation on those resources where the organisation has an
  association of `owner`. When this happens, the `focal-point`s of the
  organisation gain `resource-owner` RBAC role's collection of
  permissions on that resource to act on behalf of the organisation."
  [conn org-id sth-id]
  (let [associations (db.res.acs/get-sth-org-focal-point-resources-associations*
                      conn
                      {:org-id org-id
                       :sth-id sth-id})]
    (if (seq associations)
      (reduce
       (fn [role-unassignments {:keys [stakeholder_id resource_type resource_id]}]
         (conj role-unassignments {:user-id stakeholder_id
                                   :role-name :resource-owner
                                   :context-type (keyword (str/replace resource_type \_ \-))
                                   :resource-id resource_id}))
       []
       associations)
      [])))

(defn- get-sth-org-focal-point-role-assignments
  [conn org-id sth-id]
  (let [associations (db.res.acs/get-all-organisation-owner-associations*
                      conn
                      {:org-id org-id})]
    (if (seq associations)
      (reduce
       (fn [role-assignments {:keys [resource_type resource_id]}]
         (conj role-assignments {:user-id sth-id
                                 :role-name :resource-owner
                                 :context-type (keyword (str/replace resource_type \_ \-))
                                 :resource-id resource_id}))
       []
       associations)
      [])))

(defn sth-associations->rbac-role-unassignments
  "FIXME:"
  [conn sth-associations resource-type resource-id]
  (reduce
   (fn [role-unassignments {:keys [stakeholder old-role role]}]
     (cond
       ;; If the association is with an organisation we have to get
       ;; all the `owner` associations of that organisation with
       ;; platform resources. Because of permission inheritance, we
       ;; then have to create role unassignments for all those
       ;; resources with each resource. Since, an organisation's
       ;; `focal-point` has ownership rights on all organisation
       ;; resources (only on organisation `owner` associations).
       (= "organisation" resource-type)
       (apply conj role-unassignments (get-sth-org-focal-point-role-unassignments
                                       conn
                                       resource-id
                                       stakeholder))

       (get #{"owner" "resource_editor"} (or old-role role))
       (conj role-unassignments {:user-id stakeholder
                                 :role-name (if (= "owner" role)
                                              :resource-owner
                                              :resource-editor)
                                 :context-type (keyword resource-type)
                                 :resource-id resource-id})

       :else
       role-unassignments))
   []
   sth-associations))

(defn- sth-associations->rbac-role-assignments
  [conn sth-associations resource-type resource-id]
  (reduce
   (fn [role-assignments {:keys [stakeholder role]}]
     (cond
       (= "organisation" resource-type)
       (apply conj role-assignments (get-sth-org-focal-point-role-assignments conn
                                                                              resource-id
                                                                              stakeholder))

       (get #{"owner" "resource_editor"} role)
       (conj role-assignments {:user-id stakeholder
                               :role-name (if (= "owner" role)
                                            :resource-owner
                                            :resource-editor)
                               :context-type (keyword resource-type)
                               :resource-id resource-id})

       :else
       role-assignments))
   []
   sth-associations))

(defn get-associations
  "FIXME:"
  [{:keys [conn _logger]} opts]
  (db.res.acs/get-resource-associations conn opts))

(defn save-sth-associations
  "FIXME:"
  [{:keys [conn] :as config}
   {:keys [sth-associations resource-type resource-id]}]
  (let [table-suffix (str/replace resource-type \- \_)
        old-resource-owners-editors
        (->> (db.rbac-util/get-users-with-granted-permission-on-resource
              conn
              {:resource-id resource-id
               :context-type-name resource-type
               :permission-name (str resource-type "/update")})
             (map :user_id)
             set)
        old-associations (db.res.acs/get-resource-associations
                          conn
                          {:table (str "stakeholder_" table-suffix)
                           :resource-col resource-type
                           :filters {:resource-id resource-id}})
        {:keys [to-create to-update to-delete]}
        (get-associations-diff sth-associations old-associations)
        to-save (->> (concat to-create to-update)
                     (remove #(get old-resource-owners-editors (:stakeholder %))))
        role-unassingments (sth-associations->rbac-role-unassignments
                            conn
                            (concat to-delete to-update)
                            resource-type
                            resource-id)
        role-assignments (sth-associations->rbac-role-assignments
                          conn
                          to-save
                          resource-type
                          resource-id)]
    (when (seq to-delete)
      (db.res.acs/delete-stakeholder-associations
       conn
       {:table-suffix table-suffix
        :ids (map :id to-delete)}))
    (when (seq to-save)
      (doseq [{:keys [id stakeholder role]} to-save
              :let [db-opts (cond-> {:table-suffix table-suffix
                                     :resource-col table-suffix
                                     :stakeholder stakeholder
                                     :resource-id resource-id
                                     :association role
                                     :remarks nil}
                              id
                              (assoc :id id))]]
        (if id
          (db.res.acs/update-stakeholder-association conn db-opts)
          (db.res.acs/create-stakeholder-association conn db-opts))))
    (when (seq role-unassingments)
      (srv.permissions/unassign-roles-from-users
       config
       role-unassingments))
    (when (seq role-assignments)
      (srv.permissions/assign-roles-to-users
       config
       role-assignments))))

(defn save-org-associations
  "FIXME:"
  [{:keys [conn] :as config}
   {:keys [org-associations resource-type resource-id]}]
  (let [table-suffix (str/replace resource-type \- \_)
        old-resource-owners (->> (db.rbac-util/get-users-with-granted-permission-on-resource
                                  conn
                                  {:resource-id resource-id
                                   :context-type-name resource-type
                                   :permission-name (str resource-type "/delete")})
                                 (map :user_id)
                                 set)
        old-associations (db.res.acs/get-resource-associations
                          conn
                          {:table (str "organisation_" table-suffix)
                           :resource-col resource-type
                           :filters {:resource-id resource-id}})
        {:keys [to-create to-delete to-update]}
        (get-associations-diff org-associations old-associations)
        to-save (concat to-create to-update)
        role-unassignments (org-associations->rbac-role-assignments
                            conn
                            resource-type
                            resource-id
                            (concat to-delete to-update))
        role-assignments (->> (org-associations->rbac-role-assignments
                               conn
                               resource-type
                               resource-id
                               to-save)
                              (remove #(get old-resource-owners (:user-id %)))
                              (medley/distinct-by (juxt :user-id :resource-id)))]
    (when (seq to-delete)
      (db.res.acs/delete-organisation-associations
       conn
       {:table-suffix table-suffix
        :ids (map :id to-delete)}))
    (when (seq to-save)
      (doseq [{:keys [id organisation role]} to-save
              :let [db-opts (cond-> {:table-suffix table-suffix
                                     :resource-col table-suffix
                                     :organisation organisation
                                     :resource-id resource-id
                                     :association role
                                     :remarks nil}
                              id
                              (assoc :id id))]]
        (if id
          (db.res.acs/update-organisation-association conn db-opts)
          (db.res.acs/create-organisation-association conn db-opts))))
    (when (seq role-unassignments)
      (srv.permissions/unassign-roles-from-users
       config
       role-unassignments))
    (when (seq role-assignments)
      (srv.permissions/assign-roles-to-users
       config
       role-assignments))))

(defn save-associations
  "FIXME:"
  [config {:keys [org-associations sth-associations _resource-type _resource-id] :as opts}]
  (when (seq org-associations)
    (save-org-associations config opts))
  (when (seq sth-associations)
    (save-sth-associations config opts)))

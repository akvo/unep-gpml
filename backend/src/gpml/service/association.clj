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
  (when-let [focal-points (seq (db.res.acs/get-resource-associations conn
                                                                     {:table "stakeholder_organisation"
                                                                      :resource-col "organisation"
                                                                      :resource-assoc-type "organisation_association"
                                                                      :filters {:resource-id org-id
                                                                                :associations ["focal-point"]}}))]
    (map (fn [{:keys [stakeholder]}]
           {:user-id stakeholder
            :role-name :resource-owner
            :resource-id resource-id
            :context-type resource-type})
         focal-points)))

(defn org-associations->rbac-role-unassignments
  "FIXME:"
  [conn resource-type resource-id org-associations]
  (reduce
   (fn [org-role-unassignments {:keys [organisation old-role role]}]
     (when (get #{"owner"} (or old-role role))
       (let [rbac-role-unassignments (get-sth-org-role-assignments conn resource-type resource-id organisation)]
         (if (seq rbac-role-unassignments)
           (concat org-role-unassignments rbac-role-unassignments)
           org-role-unassignments))))
   []
   org-associations))

(defn org-associations->rbac-role-assignments
  "FIXME:"
  [conn resource-type resource-id org-associations]
  (reduce
   (fn [org-role-assignments {:keys [organisation role]}]
     (when (get #{"owner"} role)
       (let [rbac-role-assignments (get-sth-org-role-assignments conn resource-type resource-id organisation)]
         (if (seq rbac-role-assignments)
           (concat org-role-assignments rbac-role-assignments)
           org-role-assignments))))
   []
   org-associations))

(defn sth-associations->rbac-role-unassignments
  "FIXME:"
  [sth-associations resource-type resource-id]
  (keep
   (fn [{:keys [stakeholder old-role role]}]
     (when (get #{"owner" "resource_editor"} (or old-role role))
       {:user-id stakeholder
        :role-name (keyword (str/replace role \_ \-))
        :context-type resource-type
        :resource-id resource-id}))
   sth-associations))

(defn save-sth-associations
  "FIXME:"
  [{:keys [conn logger]} {:keys [sth-associations resource-type resource-id]}]
  (let [table-suffix (str/replace resource-type \- \_)
        old-resource-owners-editors
        (->> (db.rbac-util/get-users-with-granted-permission-on-resource conn
                                                                         {:resource-id resource-id
                                                                          :context-type-name resource-type
                                                                          :permission-name (str resource-type "/update")})
             (map :user_id)
             set)
        old-associations (db.res.acs/get-resource-associations conn
                                                               {:table (str "stakeholder_" table-suffix)
                                                                :resource-col resource-type
                                                                :filters {:resource-id resource-id}})
        {:keys [to-create to-update to-delete]}
        (get-associations-diff sth-associations old-associations)
        to-save (concat to-create to-update)
        sth-to-assign (remove #(get old-resource-owners-editors (:stakeholder %)) to-save)
        role-unassingments (sth-associations->rbac-role-unassignments (concat to-delete to-update)
                                                                      resource-type
                                                                      resource-id)]
    (when (seq to-delete)
      (db.res.acs/delete-stakeholder-associations conn
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
      (srv.permissions/unassign-roles-from-users {:conn conn
                                                  :logger logger}
                                                 role-unassingments))
    (when (seq sth-to-assign)
      (srv.permissions/assign-roles-to-users-from-connections {:conn conn
                                                               :logger logger}
                                                              {:context-type (keyword resource-type)
                                                               :resource-id resource-id
                                                               :individual-connections sth-to-assign}))))

(defn save-org-associations
  "FIXME:"
  [{:keys [conn logger]} {:keys [org-associations resource-type resource-id]}]
  (let [table-suffix (str/replace resource-type \- \_)
        old-resource-owners (->> (db.rbac-util/get-users-with-granted-permission-on-resource conn
                                                                                             {:resource-id resource-id
                                                                                              :context-type-name resource-type
                                                                                              :permission-name (str resource-type "/delete")})
                                 (map :user_id)
                                 set)
        old-associations (db.res.acs/get-resource-associations conn
                                                               {:table (str "organisation_" table-suffix)
                                                                :resource-col resource-type
                                                                :filters {:resource-id resource-id}})
        {:keys [to-create to-delete to-update]}
        (get-associations-diff org-associations old-associations)
        to-save (concat to-create to-update)
        role-unassignments (org-associations->rbac-role-unassignments conn
                                                                      resource-type
                                                                      resource-id
                                                                      (concat to-delete to-update))
        role-assignments (->> (org-associations->rbac-role-assignments conn
                                                                       resource-type
                                                                       resource-id
                                                                       to-save)
                              (remove #(get old-resource-owners (:user-id %))))]
    (when (seq to-delete)
      (db.res.acs/delete-organisation-associations conn
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
      (srv.permissions/unassign-roles-from-users {:conn conn
                                                  :logger logger}
                                                 role-unassignments))
    (when (seq role-assignments)
      (srv.permissions/assign-roles-to-users {:conn conn
                                              :logger logger}
                                             role-assignments))))

(defn save-associations
  "FIXME:"
  [config {:keys [org-associations sth-associations _resource-type _resource-id] :as opts}]
  (when (seq org-associations)
    (save-org-associations config opts))
  (when (seq sth-associations)
    (save-sth-associations config opts)))

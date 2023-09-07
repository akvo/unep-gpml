(ns gpml.test-util
  (:require [gpml.db.stakeholder :as db.stakeholder]
            [gpml.fixtures :as fixtures]
            [gpml.service.permissions :as srv.permissions]
            [integrant.core :as ig]))

(defn db-test-conn
  []
  (-> fixtures/*system*
      (ig/init [:duct.database.sql/hikaricp])
      :duct.database.sql/hikaricp
      :spec))

(defn create-test-stakeholder
  [{:keys [db logger]} email review-status role]
  (let [conn (:spec db)
        info {:picture "https://picsum.photos/200"
              :cv nil
              :title "Mr."
              :first_name "John"
              :last_name "Doe"
              :affiliation nil
              :email email
              :linked_in nil
              :twitter nil
              :url nil
              :country nil
              :representation "test"
              :about "Lorem Ipsum"
              :geo_coverage_type nil
              :idp_usernames ["auth0|123"]}
        sth (db.stakeholder/new-stakeholder conn info)
        sth-id (:id sth)]
    (db.stakeholder/update-stakeholder-status conn (assoc sth :review_status review-status))
    (db.stakeholder/update-stakeholder-role conn (assoc sth :role role))
    (db.stakeholder/stakeholder-by-id conn sth)
    (srv.permissions/create-resource-context {:conn conn
                                              :logger logger}
                                             {:context-type :stakeholder
                                              :resource-id sth-id})
    (cond
      (and (get #{"USER" "REVIEWER"} role)
           (= review-status "APPROVED"))
      (srv.permissions/assign-roles-to-users
       {:conn conn
        :logger logger}
       [{:role-name :approved-user
         :context-type :application
         :resource-id srv.permissions/root-app-resource-id
         :user-id sth-id}])

      (and (get #{"USER" "REVIEWER"} role)
           (= review-status "SUBMITTED"))
      (srv.permissions/assign-roles-to-users
       {:conn conn
        :logger logger}
       [{:role-name :unapproved-user
         :context-type :application
         :resource-id srv.permissions/root-app-resource-id
         :user-id sth-id}])

      (= role "ADMIN")
      (srv.permissions/make-user-super-admin
       {:conn conn
        :logger logger}
       sth-id)

      (= review-status "REJECTED")
      (srv.permissions/unassign-all-roles
       {:conn conn
        :logger logger}
       sth-id)

      :else
      :do-nothing)
    sth-id))

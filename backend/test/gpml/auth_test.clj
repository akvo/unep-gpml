(ns gpml.auth-test
  (:require [clojure.test :refer [are deftest is testing use-fixtures]]
            [gpml.auth :as auth]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.fixtures :as fixtures]
            [integrant.core :as ig]))

(use-fixtures :each fixtures/with-test-system)

(deftest id-token-verifier-options
  (testing "Everything OK, trailing slash and non empty strings"
    (is (true? (auth/validate-opts {:issuer "https://tenant.auth0.com/"
                                    :audience "SomeLongString"}))))
  (testing ":issuer must have a trailing slash"
    (is (thrown? clojure.lang.ExceptionInfo
                 (auth/validate-opts {:issuer "https://tenant.auth0.com"
                                      :audience "SomeLongString"}))))
  (testing ":issuer must not contain white space"
    (is (thrown? clojure.lang.ExceptionInfo
                 (auth/validate-opts {:issuer " https://tenant.auth0.com/"
                                      :audience "SomeLongString"}))))
  (testing ":audience must contain at least one non white space"
    (is (thrown? clojure.lang.ExceptionInfo
                 (auth/validate-opts {:issuer "https://tenant.auth0.com/"
                                      :audience ""})))))

(defn- new-stakeholder [db id email role review_status]
  (let [info {:id id
              :picture nil
              :cv nil
              :title "Mr."
              :first_name "First name"
              :last_name "Last name"
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
        sth (db.stakeholder/new-stakeholder db info)]
    (db.stakeholder/update-stakeholder-status db (assoc sth :review_status review_status))
    (db.stakeholder/update-stakeholder-role db (assoc sth :role role))
    (db.stakeholder/stakeholder-by-id db sth)))

(deftest test-check-authentication
  (testing "Testing check-authentication logic"
    (are [expected auth-header result] (= expected (select-keys (auth/check-authentication {:headers {"authorization" auth-header}}
                                                                                           (constantly result))
                                                                [:status :authenticated?]))
      {:status 401
       :authenticated? false} nil nil
      {:authenticated? true} "any-token-that-is-valid" [true {:any-claim true}]
      {:status 403
       :authenticated? false} "not-a-valid-token" [false "IDToken can't be verified"])))

(deftest test-check-approved
  (testing "Testing get-user-info logic"
    (let [system (-> fixtures/*system*
                     (ig/init [::auth/auth-middleware]))
          db (-> system :duct.database.sql/hikaricp :spec)

          ;; Create approved user
          approved (new-stakeholder db 1 "user@un.org" "USER" "APPROVED")

          ;; Create unapproved stakeholder
          unapproved (new-stakeholder db 2 "foo@bar.org" "USER" "SUBMITTED")]

      (are [expected auth-header]
           (= expected (auth/get-user-info db auth-header))

        ;; Anonymous user
        {:approved? false :user nil} {:authenticated? false}

        ;; Unverified email user should be able to use the application
        ;; but will be restricted with RBAC permissions until GPML
        ;; admins approves the user and also making sure their verify
        ;; their emails.
        {:approved? false :user unapproved}
        {:jwt-claims unapproved}

        ;; Approved, verified email user
        {:approved? true :user approved}
        {:jwt-claims approved}))))

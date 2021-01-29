(ns gpml.auth-test
  (:require [clojure.test :refer [deftest testing is use-fixtures are]]
            [gpml.auth :as auth]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.fixtures :as fixtures]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

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

(defn- new-stakeholder [db email role]
  (let [sth (db.stakeholder/new-stakeholder db
                                            {:picture "https://picsum.photos/200"
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
                                             :geo_coverage_type nil})]
    (db.stakeholder/approve-stakeholder db sth)
    (db.stakeholder/update-stakeholder-role db {:id (:id sth)
                                                :role role})))

(defn post-request
  [email]
  (->
   (mock/request :post "/" {})
   (assoc :jwt-claims {:email email})))

(deftest test-admin-middleware
  (let [system (-> fixtures/*system*
                   (ig/init [::auth/admin-required-middleware]))
        db (-> system :duct.database.sql/hikaricp :spec)
        middleware (::auth/admin-required-middleware system)
        admin (new-stakeholder db "admin@un.org" "ADMIN")]
    (new-stakeholder db "user@un.org" "USER")
    (let [handler (middleware (fn [{{admin-id :id} :admin}]
                                (testing "> admin id added correctly to request"
                                  (is (= admin admin-id)))
                                {:status 200 :body "OK"}))]
      (testing "An admin is authorized to perform the request"
        (is (= 200 (-> "admin@un.org"
                       post-request
                       handler
                       :status))))
      (testing "A normal user is **not** authorized to perform the request"
        (is (= 403 (-> "user@un.org"
                       post-request
                       handler
                       :status)))))))

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

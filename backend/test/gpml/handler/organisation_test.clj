(ns gpml.handler.organisation-test
  (:require
   [clojure.test :refer [deftest is testing use-fixtures]]
   [gpml.db.organisation :as db.organisation]
   [gpml.db.stakeholder :as db.stakeholder]
   [gpml.fixtures :as fixtures]
   [gpml.handler.organisation :as organisation]
   [gpml.handler.stakeholder :as stakeholder]
   [gpml.util.postgresql :as pg-util]
   [integrant.core :as ig]
   [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(defn- create-random-stakeholder
  [db {:keys [first-name last-name review-status email]}]
  (let [profile {:email email
                 :first_name first-name
                 :geo_coverage_type nil
                 :affiliation nil
                 :title "Mr"
                 :public_email false
                 :public_database false
                 :picture nil
                 :last_name last-name
                 :country nil
                 :review_status (pg-util/->PGEnum review-status "review_status")
                 :idp_usernames ["auth0|123"]}
        insert-cols (keys profile)
        insert-values (vals (select-keys profile  (vec insert-cols)))]
    (db.stakeholder/create-stakeholders db {:cols (map name insert-cols)
                                            :values [insert-values]})
    profile))

(deftest create-organisation-test
  (let [system          (ig/init fixtures/*system* [::organisation/post ::stakeholder/post])
        profile-handler (::stakeholder/post system)
        org-handler     (::organisation/post system)
        db              (-> system :duct.database.sql/hikaricp :spec)]
    (testing "New profile is created with new organisation"
      (let [email (format "created_by_%s@akvo.org" (fixtures/uuid))
            profile (create-random-stakeholder db {:first-name "John"
                                                   :last-name "Doe"
                                                   :email email
                                                   :review-status "SUBMITTED"})
            body-params     {:name              "test10001"
                             :geo_coverage_type "regional"
                             :country           nil
                             :type              "Company"
                             :url               "mycompany.org"}
            jwt-claims      {:email "john@org" :picture "test.jpg"}
            _               (profile-handler (-> (mock/request :post "/")
                                                 (assoc :jwt-claims jwt-claims)
                                                 (assoc :body-params profile)))
            resp            (org-handler (-> (mock/request :post "/")
                                             (assoc :jwt-claims jwt-claims)
                                             (assoc :body-params body-params)))]
        (is (= 201 (:status resp)))
        (is (:success? (:body resp)))
        (is (= (assoc body-params :id 10001) (-> resp :body :org)))))
    (testing "Trying to create a member organisation with non-existent user should fail"
      (let [body-params  {:name "test10002"
                          :is_member true
                          :geo_coverage_type "regional"
                          :country nil
                          :type "Company"
                          :url "mycompany.org"}
            {:keys [status body]} (org-handler (-> (mock/request :post "/")
                                                   (assoc :jwt-claims {:email "i-dont-exist@org"})
                                                   (assoc :body-params body-params)))]
        (is (= 400 status))
        (is (not (:success? body)))
        (is (= :can-not-create-member-org-if-user-does-not-exist (:reason body)))))
    (testing "Trying to create a member organisation with REJECTED user status should fail"
      (let [email (format "created_by_%s@akvo.org" (fixtures/uuid))
            _ (create-random-stakeholder db {:first-name "John"
                                             :last-name "Doe"
                                             :email email
                                             :review-status "REJECTED"})
            body-params  {:name "test10002"
                          :is_member true
                          :geo_coverage_type "regional"
                          :country nil
                          :type "Company"
                          :url "mycompany.org"}
            {:keys [status body]} (org-handler (-> (mock/request :post "/")
                                                   (assoc :jwt-claims {:email email})
                                                   (assoc :body-params body-params)))]
        (is (= 400 status))
        (is (not (:success? body)))
        (is (= :can-not-create-member-org-if-user-is-in-rejected-state (:reason body)))))
    (testing "Trying to create an organisation with an existing name should fail"
      (let [email (format "created_by_%s@akvo.org" (fixtures/uuid))
            _ (create-random-stakeholder db {:first-name "John"
                                             :last-name "Doe"
                                             :email email
                                             :review-status "SUBMITTED"})
            body-params  {:name "test10002"
                          :is_member true
                          :geo_coverage_type "regional"
                          :country nil
                          :type "Company"
                          :url "mycompany.org"}
            _ (db.organisation/new-organisation db body-params)
            {:keys [status body]} (org-handler (-> (mock/request :post "/")
                                                   (assoc :jwt-claims {:email email})
                                                   (assoc :body-params body-params)))]
        (is (= 409 status))
        (is (not (:success? body)))
        (is (= :organisation-name-already-exists (:reason body)))))
    (testing "Trying to create a non-member organisation when caller user doesn't exist should work"
      (let [body-params  {:name "test10003"
                          :is_member false
                          :geo_coverage_type "regional"
                          :country nil
                          :type "Company"
                          :url "mycompany.org"}
            {:keys [status body]} (org-handler (-> (mock/request :post "/")
                                                   (assoc :jwt-claims {})
                                                   (assoc :body-params body-params)))]
        (is (= 201 status))
        (is (:success? body))
        (is (get-in body [:org :id]))))))

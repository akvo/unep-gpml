(ns gpml.handler.stakeholder-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.fixtures :as fixtures]
            [gpml.handler.stakeholder :as stakeholder]
            [gpml.test-util :as test-util]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(deftest get-stakeholders-public-test
  (let [system (ig/init fixtures/*system* [::stakeholder/get])
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        handler (::stakeholder/get system)
        ;; Reviewers
        _ (test-util/create-test-stakeholder config
                                             "reviewer-approved@org.com"
                                             "APPROVED"
                                             "REVIEWER")
        _ (test-util/create-test-stakeholder config
                                             "reviewer-submitted@org.com"
                                             "SUBMITTED"
                                             "REVIEWER")
        ;; Admins
        admin-id (test-util/create-test-stakeholder config
                                                    "admin-approved@org.com"
                                                    "APPROVED"
                                                    "ADMIN")
        admin (db.stakeholder/stakeholder-by-id conn {:id admin-id})
        _ (test-util/create-test-stakeholder config
                                             "admin-submitted@org.com"
                                             "SUBMITTED"
                                             "ADMIN")
        ;; User
        user-id (test-util/create-test-stakeholder config
                                                   "user-approved@org.com"
                                                   "APPROVED"
                                                   "USER")
        user (db.stakeholder/stakeholder-by-id conn {:id user-id})
        _ (test-util/create-test-stakeholder config
                                             "user-submitted@org.com"
                                             "SUBMITTED"
                                             "USER")]

    (testing "Get stakeholders WITHOUT authenticating"
      (let [resp (handler (mock/request :get "/"))
            body (-> resp :body :stakeholders)]
        (is (= 200 (:status resp)))
        (is (= 3 (count body)))
        (is (nil? (:stakeholders body)))))

    (testing "Get all stakeholders WITHOUT admin role"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc :approved? true
                                     :user user
                                     :parameters {:query {:page 1 :limit 10}})))
            body (-> resp :body :stakeholders)]
        (is (= 200 (:status resp)))
        (is (= 3 (count body)))
        (is (nil? (:stakeholders body)))))

    (testing "Get all stakeholders"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc :approved? true
                                     :user admin
                                     :parameters {:query {:page 1 :limit 10}})))
            body (:body resp)
            stakeholders (:stakeholders body)]
        (is (= 200 (:status resp)))
        (is (= 6 (:count body)))
        (is (not-empty stakeholders))))

    (testing "Get only approved stakeholders"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc :approved? true
                                     :user admin
                                     :parameters {:query {:page 1 :limit 10 :review-status "APPROVED"}})))
            body (:body resp)
            stakeholders (:stakeholders body)]
        (is (= 200 (:status resp)))
        (is (= 3 (:count body)))
        (is (= #{"APPROVED"} (->> stakeholders (map :review_status) set)))))

    (testing "Get USERS & REVIEWERS"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc :approved? true
                                     :user admin
                                     :parameters {:query {:page 1 :limit 10 :roles "USER,REVIEWER"}})))
            body (:body resp)
            stakeholders (:stakeholders body)]
        (is (= 200 (:status resp)))
        (is (= 4 (:count body)))
        (is (= #{"APPROVED", "SUBMITTED"} (->> stakeholders (map :review_status) set)))
        (is (= #{"USER", "REVIEWER"} (->> stakeholders (map :role) set)))))

    (testing "Get stakeholders with -approved@ email"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc :approved? true
                                     :user admin
                                     :parameters {:query {:page 1 :limit 10 :email-like "-approved@"}})))
            body (:body resp)
            stakeholders (:stakeholders body)]
        (is (= 200 (:status resp)))
        (is (= 3 (:count body)))
        (is (= #{"APPROVED"} (->> stakeholders (map :review_status) set)))
        (is (= #{"USER", "REVIEWER", "ADMIN"} (->> stakeholders (map :role) set)))))))

(deftest stakeholder-patch-test
  (let [system (ig/init fixtures/*system* [::stakeholder/patch])
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        handler (::stakeholder/patch system)
        ;; Admins
        admin-id (test-util/create-test-stakeholder config
                                                    "admin-approved@org.com"
                                                    "APPROVED"
                                                    "ADMIN")
        ;; User
        user-id (test-util/create-test-stakeholder config
                                                   "user-approved@org.com"
                                                   "APPROVED"
                                                   "USER")]

    (testing "Change USER to REVIEWER"
      (let [resp (handler (-> (mock/request :patch "/")
                              (assoc
                               :user {:id admin-id}
                               :parameters {:path {:id user-id}
                                            :body {:role "REVIEWER"}})))
            body (:body resp)
            user (db.stakeholder/stakeholder-by-id conn {:id user-id})]
        (is (= 200 (:status resp)))
        (is (= "success" (:status body)))
        (is (= "REVIEWER" (:role user)))))
    (testing "Change USER to REVIEWER fails because user doesn't have enough permissions"
      (let [resp (handler (-> (mock/request :patch "/")
                              (assoc
                               :user {:id user-id}
                               :parameters {:path {:id user-id}
                                            :body {:role "REVIEWER"}})))]
        (is (= 403 (:status resp)))))))

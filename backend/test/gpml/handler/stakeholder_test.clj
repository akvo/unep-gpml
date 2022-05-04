(ns gpml.handler.stakeholder-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.fixtures :as fixtures]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.handler.stakeholder :as stakeholder]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(defn- new-stakeholder [db email first_name last_name role review_status]
  (let [info {:picture "https://picsum.photos/200"
              :affiliation nil
              :country nil
              :representation ""
              :geo_coverage_type nil
              :title "Mr."
              :first_name first_name
              :last_name last_name
              :public_email true
              :email email
              :idp_usernames ["auth0|123"]}
        sth (db.stakeholder/new-stakeholder db info)]
    (db.stakeholder/update-stakeholder-status db (assoc sth :review_status review_status))
    (db.stakeholder/update-stakeholder-role db (assoc sth :role role))
    sth))

(deftest get-stakeholders-public-test
  (let [system (ig/init fixtures/*system* [::stakeholder/get])
        handler (::stakeholder/get system)
        db (-> system :duct.database.sql/hikaricp :spec)
        ;; Reviewers
        _ (new-stakeholder db "reviewer-approved@org.com" "R" "A" "REVIEWER" "APPROVED")
        _ (new-stakeholder db "reviewer-submitted@org.com" "R" "S" "REVIEWER" "SUBMITTED")
        ;; Admins
        admin-id (new-stakeholder db "admin-approved@org.com" "A" "A" "ADMIN" "APPROVED")
        admin (db.stakeholder/stakeholder-by-id db admin-id)
        _ (new-stakeholder db "admin-submitted@org.com" "A" "S" "ADMIN" "SUBMITTED")
        ;; User
        user-id (new-stakeholder db "user-approved@org.com" "U" "A" "USER" "APPROVED")
        user (db.stakeholder/stakeholder-by-id db user-id)
        _ (new-stakeholder db "user-submitted@org.com" "U" "S" "USER" "SUBMITTED")]

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
        handler (::stakeholder/patch system)
        db (-> system :duct.database.sql/hikaricp :spec)
        ;; Admins
        admin-id (new-stakeholder db "admin-approved@org.com" "A" "A" "ADMIN" "APPROVED")
        ;; User
        user-id (new-stakeholder db "user-approved@org.com" "U" "A" "USER" "APPROVED")]

    (testing "Change USER to REVIEWER"
      (let [resp (handler (-> (mock/request :patch "/")
                              (assoc
                               :admin admin-id
                               :parameters {:path user-id
                                            :body {:role "REVIEWER"}})))
            body (:body resp)
            user (db.stakeholder/stakeholder-by-id db user-id)]
        (is (= 200 (:status resp)))
        (is (= "success" (:status body)))
        (is (= "REVIEWER" (:role user)))))))

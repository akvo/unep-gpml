(ns gpml.handler.review-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.fixtures :as fixtures]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.review :as db.review]
            [gpml.handler.review :as review]
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
              :email email}
        sth (db.stakeholder/new-stakeholder db info)]
    (db.stakeholder/update-stakeholder-status db (assoc sth :review_status review_status))
    (db.stakeholder/update-stakeholder-role db (assoc sth :role role))
    sth))

(deftest get-reviewers-test
  (testing "Get reviewers endpoint returns non empty response"
    (let [system (ig/init fixtures/*system* [::review/get-reviewers])
          handler (::review/get-reviewers system)
          db (-> system :duct.database.sql/hikaricp :spec)
          ;; Reviewers
          _ (new-stakeholder db "reviewer-approved@org.com" "R" "A" "REVIEWER" "APPROVED")
          _ (new-stakeholder db "reviewer-submitted@org.com" "R" "S" "REVIEWER" "SUBMITTED")
          ;; Admins
          _ (new-stakeholder db "admin-approved@org.com" "A" "A" "ADMIN" "APPROVED")
          _ (new-stakeholder db "admin-submitted@org.com" "A" "S" "ADMIN" "SUBMITTED")
          ;; User
          _ (new-stakeholder db "user-approved@org.com" "U" "A" "USER" "APPROVED")
          _ (new-stakeholder db "user-submitted@org.com" "U" "S" "USER" "SUBMITTED")
          resp (handler (mock/request :get "/"))
          body (:body resp)]
      (is (= 200 (:status resp)))
      (is (= 2 (count body)))
      (is (= #{"ADMIN" "REVIEWER"} (set (map :role body)))))))

(deftest get-topic-review
  (let [system (ig/init fixtures/*system* [::review/get-review])
        handler (::review/get-review system)
        db (-> system :duct.database.sql/hikaricp :spec)
        admin (new-stakeholder db "admin-approved@org.com" "R" "A" "ADMIN" "APPROVED")
        reviewer (new-stakeholder db "reviewer-approved@org.com" "R" "A" "REVIEWER" "APPROVED")
        user (new-stakeholder db "user-submitted@org.com" "U" "S" "USER" "SUBMITTED")]

    (testing "Fetching topic review when NO REVIEWER ASSIGNED"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc
                               :parameters {:path {:topic-type "stakeholder"
                                                   :topic-id (:id user)}})))
            body (:body resp)]
        (is (= 200 (:status resp)))
        (is (empty? body))))

    (testing "Fetching topic review when REVIEWER ASSIGNED"
      (let [stakeholder-id (:id user)
            _ (db.review/new-review db {:topic-name "stakeholder"
                                        :topic-id stakeholder-id
                                        :assigned-by (:id admin)
                                        :reviewer (:id reviewer)})
            resp (handler (-> (mock/request :get "/")
                              (assoc
                               :parameters {:path {:topic-type "stakeholder"
                                                   :topic-id (:id user)}})))
            body (:body resp)]
        (is (= 200 (:status resp)))
        (is (= (:id reviewer) (:reviewer body)))
        (is (= (:id admin) (:assigned_by body)))
        (is (= "stakeholder" (:topic_name body)))
        (is (= (:id user) (:topic_id body)))))))


(deftest assign-reviewer
  (let [system (ig/init fixtures/*system* [::review/assign-reviewer])
        handler (::review/assign-reviewer system)
        db (-> system :duct.database.sql/hikaricp :spec)
        admin (new-stakeholder db "admin-approved@org.com" "R" "A" "ADMIN" "APPROVED")
        reviewer (new-stakeholder db "reviewer@org.com" "R" "A" "REVIEWER" "APPROVED")
        reviewer2 (new-stakeholder db "reviewer2@org.com" "R" "A" "REVIEWER" "APPROVED")
        user (new-stakeholder db "user-submitted@org.com" "U" "S" "USER" "SUBMITTED")]

    (testing "Assign new reviewer"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc
                               :parameters {:path {:topic-type "stakeholder"
                                                   :topic-id (:id user)}
                                            :body {:assigned-by (:id admin)
                                                   :reviewer (:id reviewer)}})))
            body (:body resp)
            review (db.review/review-by-id db body)]
        (is (= 200 (:status resp)))
        (is (= (:reviewer review) (:id reviewer)))
        (is (= (:assigned_by review) (:id admin)))
        (is (= (:topic_id review) (:id user)))))


    (testing "Change reviewer"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc
                               :parameters {:path {:topic-type "stakeholder"
                                                   :topic-id (:id user)}
                                            :body {:assigned-by (:id admin)
                                                   :reviewer (:id reviewer2)}})))
            body (:body resp)
            review (db.review/review-by-id db body)]
        (is (= 200 (:status resp)))
        (is (= (:reviewer review) (:id reviewer2)))
        (is (= (:assigned_by review) (:id admin)))
        (is (= (:topic_id review) (:id user)))))))

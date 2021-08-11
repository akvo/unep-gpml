(ns gpml.handler.review-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.fixtures :as fixtures]
            [gpml.db.stakeholder :as db.stakeholder]
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
    (db.stakeholder/update-stakeholder-role db (assoc sth :role role))))

(deftest handler-test
  (testing "Landing endpoint returns non empty response"
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

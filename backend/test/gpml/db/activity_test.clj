(ns gpml.db.activity-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.db.activity :as sut]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.fixtures :as fixtures]
            [gpml.test-util :as test-util]
            [gpml.util :as util]))

(use-fixtures :each fixtures/with-test-system)

(defn make-profile [first-name last-name email]
  {:picture nil
   :cv nil
   :title "mr."
   :first_name first-name
   :last_name last-name
   :affiliation nil
   :email email
   :linked_in nil
   :twitter nil
   :url nil
   :country nil
   :representation "test"
   :about "Lorem Ipsum"
   :geo_coverage_type "global"
   :role "USER"
   :idp_usernames ["auth0|123"]})

(defn random-activity-data [owner-id metadata]
  {:id (util/uuid)
   :type (rand-nth ["create_resource" "bookmark_resource"])
   :owner_id owner-id
   :metadata metadata})

(defn create-dummy-activity [db owner-id]
  (let [activity (random-activity-data owner-id {})]
    (sut/create-activity db activity)))

(deftest create-activity-test
  (let [db (test-util/db-test-conn)
        test-stakeholder-id (:id (db.stakeholder/new-stakeholder db (make-profile "John" "Doe" "mail@org.com")))]
    (testing "Create an activity happy path"
      (let [activity (random-activity-data test-stakeholder-id {})
            result (sut/create-activity db activity)]
        (is (= 1 result))))
    (testing "Create an activity with metadata"
      (let [activity (random-activity-data test-stakeholder-id {:some_metadata 1})
            result (sut/create-activity db activity)]
        (is (= 1 result))))))

(deftest get-recent-activity-test
  (let [db (test-util/db-test-conn)
        test-stakeholder-id (:id (db.stakeholder/new-stakeholder db (make-profile "John" "Doe" "mail@org.com")))]
    (create-dummy-activity db test-stakeholder-id)
    (testing "Get recent activities"
      (let [result (sut/get-recent-activities db)]
        (is (coll? result))
        (is (= (count result) 1))))
    (testing "Recent activities should be limited"
      (let [_ (dotimes [_ 10] (create-dummy-activity db test-stakeholder-id))
            result (sut/get-recent-activities db)]
        (is (= (count result) 5))))))

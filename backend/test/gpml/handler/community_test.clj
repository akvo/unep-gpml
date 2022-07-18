(ns gpml.handler.community-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.topic-test :as db.topic-test]
            [gpml.fixtures :as fixtures]
            [gpml.handler.community :as sut]
            [gpml.seeder.main :as seeder]
            [gpml.test-util :as test-util]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(deftest get-community-members
  (let [db (test-util/db-test-conn)
        system (-> fixtures/*system*
                   (ig/init [::sut/get]))
        handler (::sut/get system)
        profile-data (db.topic-test/make-profile "John" "Doe" "john.doe@org.com")
        sth (db.stakeholder/new-stakeholder db profile-data)
        _ (db.stakeholder/update-stakeholder-status db (assoc sth :review_status "APPROVED"))
        default-api-limit sut/default-api-limit]
    (seeder/seed db {:country? true :organisation? true})

    (testing "Retrieve community members list with default params"
      (let [resp (handler (mock/request :get "/"))
            body (-> resp :body)]
        (is (= default-api-limit (count (:results body))))
        (is (= 1 (:count (first (filter #(= "stakeholder" (:network_type %)) (:counts body))))))))

    (testing "Retrieve community members with custom filters"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc :parameters {:query {:limit 1 :networkType "stakeholder" :q "John Doe"}})))
            body (:body resp)]
        (is (= 1 (count (:results body))))
        (is (= "John Doe" (-> body :results first :name)))
        (is (= 1 (:count (first (filter #(= "stakeholder" (:network_type %)) (:counts body))))))))))

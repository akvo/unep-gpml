(ns gpml.handler.community-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.fixtures :as fixtures]
            [gpml.handler.community :as sut]
            [gpml.seeder.main :as seeder]
            [gpml.test-util :as test-util]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(deftest get-community-members
  (let [system (-> fixtures/*system*
                   (ig/init [::sut/get]))
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        handler (::sut/get system)
        sth-id (test-util/create-test-stakeholder config
                                                  "john.doe@mail.invalid"
                                                  "APPROVED"
                                                  "USER")
        default-api-limit sut/default-api-limit]
    (seeder/seed conn {:country? true :organisation? true})
    (testing "Retrieve community members list with default params"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc :user {:id sth-id})))
            body (-> resp :body)]
        (is (= default-api-limit (count (:results body))))
        (is (= 1 (:count (first (filter #(= "stakeholder" (:network_type %)) (:counts body))))))))
    (testing "Retrieve community members with custom filters"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc :parameters {:query {:limit 1 :networkType "stakeholder" :q "John Doe"}}
                                     :user {:id sth-id})))
            body (:body resp)]
        (is (= 1 (count (:results body))))
        (is (= "John Doe" (-> body :results first :name)))
        (is (= 1 (:count (first (filter #(= "stakeholder" (:network_type %)) (:counts body))))))))
    (testing "Users that are not signed up can't see the community members list"
      (let [resp (handler (mock/request :get "/"))
            status (:status resp)]
        (is (= 403 status))))
    (testing "Users that are not approved can't see the community members list"
      (let [sth-id (test-util/create-test-stakeholder config
                                                      "john.doe2@mail.invalid"
                                                      "SUBMITTED"
                                                      "USER")
            resp (handler (-> (mock/request :get "/")
                              (assoc :user {:id sth-id})))
            status (:status resp)]
        (is (= 403 status))))))

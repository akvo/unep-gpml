(ns gpml.handler.activity-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.fixtures :as fixtures]
            [gpml.handler.activity :as sut]
            [gpml.test-util :as test-util]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(deftest get-recent-activities-test
  (let [system (ig/init fixtures/*system* [::sut/get-recent])
        config (get system [:duct/const :gpml.config/common])
        handler (::sut/get-recent system)]
    (testing "Testing getting activities for approved user"
      (let [sth-id (test-util/create-test-stakeholder config
                                                      "john.doe@mail.invalid"
                                                      "APPROVED"
                                                      "USER")
            resp (handler (-> (mock/request :get "/recent")
                              (assoc :user {:id sth-id})))]
        (is (= 200 (:status resp)))))
    (testing "Testing getting activities for unapproved user"
      (let [sth-id (test-util/create-test-stakeholder config
                                                      "john.doe2@mail.invalid"
                                                      "SUBMITTED"
                                                      "USER")
            resp (handler (-> (mock/request :get "/recent")
                              (assoc :user {:id sth-id})))]
        (is (= 403 (:status resp)))))))

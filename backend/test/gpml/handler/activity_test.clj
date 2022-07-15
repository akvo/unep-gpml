(ns gpml.handler.activity-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.fixtures :as fixtures]
            [gpml.handler.activity :as sut]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(deftest get-recent-activities-test
  (let [system (ig/init fixtures/*system* [::sut/get-recent])
        handler (::sut/get-recent system)]
    (testing "Testing getting activities happy path"
      (let [resp (handler (mock/request :get "/recent"))]
        (is (= 200 (:status resp)))))))

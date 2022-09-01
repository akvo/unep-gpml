(ns gpml.handler.landing-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.fixtures :as fixtures]
            [gpml.handler.landing :as landing]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(deftest handler-test
  (testing "Landing endpoint returns non empty response"
    (let [system (ig/init fixtures/*system* [::landing/get])
          handler (::landing/get system)
          resp (handler (mock/request :get "/"))]
      (is (= 200 (:status resp)))
      (is (not-empty (:body resp)))
      (is (some #(= {:initiative 0 :countries 0} %) (-> resp :body :summary))))))

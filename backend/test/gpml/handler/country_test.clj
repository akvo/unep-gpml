(ns gpml.handler.country-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.db.country :as db.country]
            [gpml.fixtures :as fixtures]
            [gpml.handler.country :as country]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(deftest handler-test
  (testing "Country endpoint returns non empty response"
    (let [system (ig/init fixtures/*system* [::country/get])
          handler (::country/get system)
          db (-> system :duct.database.sql/hikaricp :spec)
          _ (db.country/new-country db {:name "The Netherlands" :iso_code_a3 "NLD" :description "Member State"})
          resp (handler (mock/request :get "/"))]
      (is (= 200 (:status resp)))
      (is (not-empty (:body resp)))
      (is (= "NLD" (-> resp :body first :iso_code_a3))))))

(ns gpml.handler.initiative-test
  (:require [clojure.java.io :as io]
            [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.db.initiative :as db.initiative]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.domain.types :as dom.types]
            [gpml.fixtures :as fixtures]
            [gpml.handler.initiative :as initiative]
            [gpml.handler.profile-test :as profile-test]
            [gpml.seeder.main :as seeder]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(deftest handler-post-test
  (testing "New initiative is created"
    (let [system (ig/init fixtures/*system* [::initiative/post])
          handler (::initiative/post system)
          db (-> system :duct.database.sql/hikaricp :spec)
          ;; create new country [IDN SPA]
          ;; create new country group [Africa Asia Europe]
          ;; create new organisation [Akvo]
          ;; create new general 3 tags
          _ (profile-test/seed-important-database db)
          ;; create new user name John
          user (db.stakeholder/new-stakeholder db (profile-test/new-profile 1))
          _ (db.stakeholder/update-stakeholder-status db (assoc user :review_status "APPROVED"))
          ;; John create new initiative with new organisation
          submission (seeder/parse-data
                      (slurp (io/resource "examples/submission-initiative.json"))
                      {:keywords? true
                       :add-default-lang? true})
          resp (handler (-> (mock/request :post "/")
                            (assoc :jwt-claims {:email "john@org"})
                            (assoc :body-params (assoc submission :version 1))
                            (assoc :parameters {:body {:source dom.types/default-resource-source}})))
          data (db.initiative/initiative-by-id db (:body resp))]
      (is (= 201 (:status resp)))
      (is (= 1 (-> data :version)))
      (is (= 10001 (-> data :created_by)))
      (is (= 10001 (-> data :id)))
      (is (= "SUBMITTED" (-> data :review_status)))
      (is (= (:url data) (:url submission)))
      (doseq [[k v] submission]
        (testing (str "testing-" k)
          (is (= v (get data k))))))))

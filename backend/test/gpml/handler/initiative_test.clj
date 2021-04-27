(ns gpml.handler.initiative-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.fixtures :as fixtures]
            [gpml.handler.initiative :as initiative]
            [gpml.handler.profile-test :as profile-test]
            [gpml.db.initiative :as db.initiative]
            [gpml.db.stakeholder :as db.stakeholder]
            [integrant.core :as ig]
            [ring.mock.request :as mock]
            [clojure.java.io :as io]
            [jsonista.core :as j]))

(use-fixtures :each fixtures/with-test-system)

(defn parse-data [s {:keys [keywords?]}]
  (if keywords?
    (j/read-value s j/keyword-keys-object-mapper)
    (j/read-value s)))

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
          user (db.stakeholder/new-stakeholder db (profile-test/new-profile 1 1))
          _ (db.stakeholder/update-stakeholder-status db (assoc user :review_status "APPROVED"))
          ;; John create new initiative with new organisation
          submission (parse-data
                       (slurp (io/resource "examples/submission-initiative.json"))
                       {:keywords? true})
          resp (handler (-> (mock/request :post "/")
                            (assoc :jwt-claims {:email "john@org"})
                            (assoc :body-params (assoc submission :version 1))))
          data (db.initiative/initiative-by-id db (:body resp))]
      (is (= 201 (:status resp)))
      (is (= 1 (-> data :version)))
      (is (= 10001 (-> data :created_by)))
      (is (= 10001 (-> data :id)))
      (is (= "SUBMITTED" (-> data :review_status)))
      (doseq [[k v] submission]
        (testing (str "testing-" k)
          (is (= v (get data k))))))))

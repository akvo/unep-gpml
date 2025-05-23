(ns gpml.handler.initiative-test
  (:require
   [clojure.java.io :as io]
   [clojure.test :refer [deftest is testing use-fixtures]]
   [gpml.db.initiative :as db.initiative]
   [gpml.domain.types :as dom.types]
   [gpml.fixtures :as fixtures]
   [gpml.handler.initiative :as initiative]
   [gpml.handler.profile-test :as profile-test]
   [gpml.seeder.main :as seeder]
   [gpml.test-util :as test-util]
   [integrant.core :as ig]
   [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(deftest handler-post-test
  (let [system (ig/init fixtures/*system* [::initiative/post])
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        handler (::initiative/post system)
        _ (profile-test/seed-important-database conn)]
    (testing "New initiative is created"
      (let [;; create new user name John
            sth-id (test-util/create-test-stakeholder config
                                                      "john.doe@mail.invalid"
                                                      "APPROVED"
                                                      "USER")
            sth (test-util/stakeholder-by-id config {:id sth-id})
            ;; John create new initiative with new organisation
            submission (seeder/parse-data
                        (slurp (io/resource "examples/submission-initiative.json"))
                        {:keywords? true
                         :add-default-lang? true})
            resp (handler (-> (mock/request :post "/")
                              (assoc :user sth)
                              (assoc :body-params (assoc submission :version 1))
                              (assoc :parameters {:body {:source dom.types/default-resource-source}})))
            data (db.initiative/initiative-by-id conn (:body resp))]
        (is (= 201 (:status resp)))
        (is (= 1 (-> data :version)))
        (is (= 10001 (-> data :created_by)))
        (is (= 10001 (-> data :id)))
        (is (= "SUBMITTED" (-> data :review_status)))
        (is (= (:url data) (:url submission)))
        (doseq [[k v] submission]
          (testing (str "testing-" k)
            (is (= v (get data k)))))))
    (testing "Unapproved users can't create a resource"
      (let [;; create new user name John
            sth-id (test-util/create-test-stakeholder config
                                                      "john.doe2@mail.invalid"
                                                      "SUBMITTED"
                                                      "USER")
            sth (test-util/stakeholder-by-id config {:id sth-id})
            ;; John create new initiative with new organisation
            submission (seeder/parse-data
                        (slurp (io/resource "examples/submission-initiative.json"))
                        {:keywords? true
                         :add-default-lang? true})
            resp (handler (-> (mock/request :post "/")
                              (assoc :user sth)
                              (assoc :body-params (assoc submission :version 1))
                              (assoc :parameters {:body {:source dom.types/default-resource-source}})))]
        (is (= 403 (:status resp)))))))

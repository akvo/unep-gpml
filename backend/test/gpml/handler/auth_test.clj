(ns gpml.handler.auth-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.fixtures :as fixtures]
            [gpml.handler.auth :as auth]
            [gpml.seeder.main :as seeder]
            [gpml.test-util :as test-util]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(deftest post-topic-auth-handler-test
  (let [system (ig/init fixtures/*system* [::auth/post-topic-auth])
        config (get system [:duct/const :gpml.config/common])
        handler (::auth/post-topic-auth system)
        db (-> system :duct.database.sql/hikaricp :spec)
        admin-id (test-util/create-test-stakeholder config
                                                    "john.doe.admin@mail.invalid"
                                                    "APPROVED"
                                                    "ADMIN")]
    (seeder/seed db {:organisation? true :resource? true})
    (testing "Only super admin users can call this endpoint"
      (let [sth-id (test-util/create-test-stakeholder config
                                                      "john.doe.user@mail.invalid"
                                                      "APPROVED"
                                                      "USER")
            request (-> (mock/request :post "/")
                        (assoc :parameters {:path {:topic-type "organisation" :topic-id 1}
                                            :body {:stakeholders [{:id sth-id
                                                                   :roles ["focal-point"]}]}}
                               :user {:id sth-id}))
            {:keys [status]} (handler request)]
        (is (= 403 status))))
    (testing "Allow adding a focal point to an organisation"
      (let [sth-id (test-util/create-test-stakeholder config
                                                      "john.doe.user2@mail.invalid"
                                                      "APPROVED"
                                                      "USER")
            request (-> (mock/request :post "/")
                        (assoc :parameters {:path {:topic-type "organisation" :topic-id 1}
                                            :body {:stakeholders [{:id sth-id
                                                                   :roles ["focal-point"]}]}}
                               :user {:id admin-id}))
            {:keys [status body]} (handler request)]
        (is (= 200 status))
        (is (:success? body))))
    (testing "More than two focal points in the same organisation should fail"
      (let [sth-id-1 (test-util/create-test-stakeholder config
                                                        "john.doe1@mail.invalid"
                                                        "APPROVED"
                                                        "USER")
            sth-id-2 (test-util/create-test-stakeholder config
                                                        "john.doe2@mail.invalid"
                                                        "APPROVED"
                                                        "USER")
            sth-id-3 (test-util/create-test-stakeholder config
                                                        "john.doe3@mail.invalid"
                                                        "APPROVED"
                                                        "USER")
            request (-> (mock/request :post "/")
                        (assoc :parameters {:path {:topic-type "organisation" :topic-id 1}
                                            :body {:stakeholders [{:id sth-id-1
                                                                   :roles ["focal-point"]}
                                                                  {:id sth-id-2
                                                                   :roles ["focal-point"]}
                                                                  {:id sth-id-3
                                                                   :roles ["focal-point"]}]}}
                               :user {:id admin-id}))
            {:keys [status body]} (handler request)]
        (is (= 400 status))
        (is (not (:success? body)))
        (is (= :maximum-focal-points-reached (:reason body)))))))

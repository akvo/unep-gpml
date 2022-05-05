(ns gpml.handler.archive-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.handler.archive :as archive]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.handler.profile-test :as profile-test]
            [gpml.fixtures :as fixtures]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(deftest handler-get-test
  (testing "Get archived submission content"
    (let [system (ig/init fixtures/*system* [::archive/get])
          handler (::archive/get system)
          db (-> system :duct.database.sql/hikaricp :spec)
          _ (profile-test/seed-important-database db)
          ;; create new admin name Jane
          admin (profile-test/new-profile 1)
          admin (db.stakeholder/new-stakeholder db  (assoc admin
                                                           :email "jane@org"
                                                           :first_name "Jane"))
          _ (db.stakeholder/update-stakeholder-role db (assoc admin
                                                              :role "ADMIN"
                                                              :review_status "APPROVED"))
          ;; User Default
          user (profile-test/new-profile 1)
          ;; create new user name John
          _ (db.stakeholder/new-stakeholder db  (profile-test/new-profile 1))

          ;; create new user name Bob
          user_bob (db.stakeholder/new-stakeholder db  (assoc user
                                                              :email "bob@org"
                                                              :first_name "Bob"
                                                              :last_name "Doe"))
          ;; Jane reject Bob
          _ (db.stakeholder/update-stakeholder-status db (assoc user_bob
                                                                :review_status "REJECTED"
                                                                :reviewed_by (:id admin)))

          ;; create new user name Justin
          user_justin (db.stakeholder/new-stakeholder db  (assoc user
                                                                 :email "justin@org"
                                                                 :first_name "Justin"
                                                                 :last_name "Doe"))
          ;; Jane approve justin
          _ (db.stakeholder/update-stakeholder-status db (assoc user_justin
                                                                :review_status "APPROVED"
                                                                :reviewed_by (:id admin)))

          ;; Jane trying to see the list of archive user in this case Nick
          resp (handler (-> (mock/request :get "/")
                            (assoc :jwt-claims {:email "jane@org"}
                                   :admin admin
                                   :parameters {:query {:page 1
                                                        :limit 10}})))]
      (is (= 200 (:status resp)))
      ;; Jane, Justin and Bob, Exclude John
      (is (= 3 (-> resp :body :count)))
      (is (= 3 (count (-> resp :body :data))))
      (is (= "stakeholder" (-> resp :body :data first :type)))
      (is (= "Jane Doe" (-> resp :body :data first :reviewed_by)))
      (is (= "APPROVED" (-> resp :body :data first :review_status)))
      (is (= "Mr. Doe Justin" (-> resp :body :data first :title)))
      (is (= "Mr. Doe Bob" (-> resp :body :data second :title)))
      (is (= "REJECTED" (-> resp :body :data second :review_status))))))

(ns gpml.handler.submission-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.handler.submission :as submission]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.event :as db.event]
            [gpml.handler.profile-test :as profile-test]
            [gpml.fixtures :as fixtures]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(deftest handler-get-test
  (testing "Get pending submission list"
    (let [system (ig/init fixtures/*system* [::submission/get])
          handler (::submission/get system)
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
          _ (db.stakeholder/new-stakeholder db  (assoc user
                                                       :email "bob@org"
                                                       :first_name "Bob"
                                                       :last_name "Doe"))

          ;; create new user name Justin
          user_justin (db.stakeholder/new-stakeholder db  (assoc user
                                                                 :email "justin@org"
                                                                 :first_name "Justin"
                                                                 :last_name "Doe"))

          ;; Jane approve justin
          _ (db.stakeholder/update-stakeholder-status db (assoc user_justin
                                                                :review_status "APPROVED"
                                                                :reviewed_by (:id admin)))

          ;; Justin create an event
          _ (db.event/new-event db {:title "Title"
                                    :start_date "2021-02-03T09:00:00Z"
                                    :end_date "2021-02-03T10:00:00Z"
                                    :description "desc"
                                    :remarks "some remarks"
                                    :country nil
                                    :city nil
                                    :image nil
                                    :geo_coverage_type "global"
                                    :created_by (:id user_justin)})

          ;; Jane trying to see the list of submission user in this case Nick
          resp (handler (-> (mock/request :get "/")
                            (assoc :jwt-claims {:email "jane@org"}
                                   :admin admin
                                   :parameters {:query {:page 1
                                                        :review_status "SUBMITTED"
                                                        :limit 10}})))]
      (is (= 200 (:status resp)))
      ;; John and Bob, Exclude Justin
      ;; Doesn't include tags created while seeding db as they're now "APPROVED"
      (is (= 3 (-> resp :body :count)))
      (is (= 3 (count (-> resp :body :data))))
      (is (= "stakeholder" (-> resp :body :data first :type)))
      (is (= "/submission/stakeholder/10002" (-> resp :body :data first :preview)))
      (is (= "Mr. Doe Bob" (-> resp :body :data second :title)))
      (is (= "event" (some #{"event"} (map #(:type %) (-> resp :body :data)))))
      (is (= "event" (-> resp :body :data last :type)))
      (is (= "justin@org" (-> (filter #(not= "tag" (:type %)) (-> resp :body :data)) last :created_by))))))

(deftest handler-get-detail-test
  (testing "Get pending submission detail"
    (let [system (ig/init fixtures/*system* [::submission/get-detail])
          handler (::submission/get-detail system)
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
          ;; create new user name Justin
          user (profile-test/new-profile 1)
          justin (db.stakeholder/new-stakeholder db (assoc user
                                                           :email "justin@org"
                                                           :first_name "Justin"
                                                           :last_name "Doe"))
          resp (handler (-> (mock/request :get "/")
                            (assoc :jwt-claims {:email "jane@org"}
                                   :admin admin
                                   :parameters
                                   {:path (assoc justin :submission "stakeholder")})))
          body (:body resp)]
      (is (not (:public_email justin)))
      (is (= (:email body) "justin@org")))))

(deftest remap-initative-test
  (testing "Get remap initiative code"
    ;; This is a regression test, and doesn't necessarily test
    ;; everything that the remap function is doing.
    (let [system (ig/init fixtures/*system* [::submission/get-detail])
          db (-> system :duct.database.sql/hikaricp :spec)
          initiative {:q24 {:national "National"} :q24_2 {:73 "Spain"}}
          data (submission/remap-initiative initiative db)]
      (is (= "National" (:geo_coverage_type data)))
      (is (= ["Spain"] (:geo_coverage_values data))))))

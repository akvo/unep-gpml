(ns gpml.db.like-test
  (:require
   [clojure.test :refer [deftest is testing use-fixtures]]
   [gpml.db.country :as db.country]
   [gpml.db.like :as db.like]
   [gpml.db.stakeholder :as db.stakeholder]
   [gpml.db.topic :as db.topic]
   [gpml.fixtures :as fixtures]
   [gpml.seeder.main :as seeder]
   [gpml.test-util :as test-util]))

(use-fixtures :each fixtures/with-test-system)

(defn- new-stakeholder [db email]
  (db.stakeholder/new-stakeholder
   db {:picture "https://picsum.photos/200"
       :cv nil
       :title "Mr."
       :first_name "First name"
       :last_name "Last name"
       :affiliation nil
       :email email
       :linked_in nil
       :twitter nil
       :url nil
       :country (-> (db.country/get-countries db {:filters {:iso-codes-a3 ["HND"] :descriptions ["Member State"]}}) first :id)
       :representation "test"
       :about "Lorem Ipsum"
       :geo_coverage_type nil
       :role "USER"
       :idp_usernames ["auth0|123"]}))

(deftest new-like-test
  (let [db (test-util/db-test-conn)]
    (seeder/seed db {:country? true
                     :technology? true})
    (let [sth1-id (:id (new-stakeholder db "email1@un.org"))
          sth2-id (:id (new-stakeholder db "email2@un.org"))]
      (testing "Creating a new relation between a stakeholder and a technolgy item"
        (db.like/create-like db {:stakeholder-id sth1-id
                                 :resource-type "technology"
                                 :resource-id  1})
        (db.like/create-like db {:stakeholder-id sth2-id
                                 :resource-type "technology"
                                 :resource-id 1}))
      (testing "Like counts should be correct"
        (let [tech (into [] (comp (map :json)
                                  (filter #(= 1 (:id %))))
                         (db.topic/get-topics db {:topic #{"technology"}}))]
          (is (= 2 (:likes (first tech))))))
      (testing "Attempting to create the `like` should fail"
        (is (thrown-with-msg? java.sql.BatchUpdateException #"duplicate key value"
                              (db.like/create-like db {:stakeholder-id sth1-id
                                                       :resource-type "technology"
                                                       :resource-id 1}))))
      (testing "Deleting a like should work"
        (is (not-empty (db.like/get-likes db {:stakeholder-id sth1-id})))
        (db.like/delete-like db {:stakeholder-id sth1-id
                                 :resource-type "technology"
                                 :resource-id  1})
        (is (empty? (db.like/get-likes db {:stakeholder-id sth1-id})))))))

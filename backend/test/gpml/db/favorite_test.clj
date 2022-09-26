(ns gpml.db.favorite-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.db.country :as db.country]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.stakeholder :as db.stakeholder]
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
       :country (-> (db.country/get-countries db {:filters {:iso-codes-a3 ["IDN"] :descriptions ["Member State"]}}) first :id)
       :representation "test"
       :about "Lorem Ipsum"
       :geo_coverage_type nil
       :role "USER"
       :idp_usernames ["auth0|123"]}))

(deftest new-relation-test
  (let [db (test-util/db-test-conn)]
    (seeder/seed db {:country? true
                     :technology? true})
    (let [sth1-id (:id (new-stakeholder db "email1@un.org"))
          sth2-id (:id (new-stakeholder db "email2@un.org"))]
      (testing "Creating a new relation between a stakeholder and a technolgy item"
        (db.favorite/new-stakeholder-association db {:stakeholder sth1-id
                                                     :topic "technology"
                                                     :topic_id 1
                                                     :association "user"
                                                     :remarks nil})
        (db.favorite/new-stakeholder-association db {:stakeholder sth1-id
                                                     :topic "technology"
                                                     :topic_id 1
                                                     :association "interested in"
                                                     :remarks nil})
        (db.favorite/new-stakeholder-association db {:stakeholder sth2-id
                                                     :topic "technology"
                                                     :topic_id 1
                                                     :association "interested in"
                                                     :remarks nil}))
      (testing "Attempting to create the same relation doesn't fail"
        (db.favorite/new-stakeholder-association db {:stakeholder sth1-id
                                                     :topic "technology"
                                                     :topic_id 1
                                                     :association "user"
                                                     :remarks nil}))
      (testing "Getting relations for a given stakeholder"
        (is (= 2 (count (db.favorite/association-by-stakeholder-topic db
                                                                      {:stakeholder-id sth1-id
                                                                       :resource-col "technology"
                                                                       :table "stakeholder_technology"
                                                                       :resource-id 1}))))
        (is (= 1 (count (db.favorite/association-by-stakeholder-topic db
                                                                      {:stakeholder-id sth2-id
                                                                       :resource-col "technology"
                                                                       :table "stakeholder_technology"
                                                                       :resource-id 1}))))))))

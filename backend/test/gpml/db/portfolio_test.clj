(ns gpml.db.portfolio-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.db.portfolio :as db.portfolio]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.fixtures :as fixtures]
            [gpml.seeder.main :as seeder]
            [gpml.test-util :as test-util]))

(use-fixtures :each fixtures/with-test-system)

(defn- new-stakeholder [db email]
  (db.stakeholder/new-stakeholder db
                                  {:picture "https://picsum.photos/200"
                                   :title "Mr."
                                   :first_name "First name"
                                   :last_name "Last name"
                                   :affiliation nil
                                   :email email
                                   :linked_in nil
                                   :twitter nil
                                   :url nil
                                   :country 58
                                   :representation "test"
                                   :about "Lorem Ipsum"
                                   :geo_coverage_type nil
                                   :role "USER"}))


(deftest new-relation-test
  (let [db (test-util/db-test-conn)]
    (seeder/seed db {:country? true
                     :technology? true})
    (let [sth1-id (-> (new-stakeholder db "email1@un.org") first :id)
          sth2-id (-> (new-stakeholder db "email2@un.org") first :id)]
      (testing "Creating a new relation between a stakeholder and a technolgy item"
        (db.portfolio/new-association db {:stakeholder sth1-id
                                          :topic "technology"
                                          :topic_id 1
                                          :association "user"
                                          :remarks nil})
        (db.portfolio/new-association db {:stakeholder sth1-id
                                          :topic "technology"
                                          :topic_id 1
                                          :association "interested in"
                                          :remarks nil})
        (db.portfolio/new-association db {:stakeholder sth2-id
                                          :topic "technology"
                                          :topic_id 1
                                          :association "interested in"
                                          :remarks nil}))
      (testing "Attempting to create the same relation doesn't fail"
        (db.portfolio/new-association db {:stakeholder sth1-id
                                          :topic "technology"
                                          :topic_id 1
                                          :association "user"
                                          :remarks nil}))
      (testing "Getting relations for a given stakeholder"
        (is (= 2 (count (db.portfolio/relation-by-stakeholder db
                                                              {:stakeholder sth1-id}))))
        (is (= 1 (count (db.portfolio/relation-by-stakeholder db
                                                              {:stakeholder sth2-id}))))))))

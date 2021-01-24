(ns gpml.db.portfolio-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.db.portfolio :as db.portfolio]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.tag :as db.tag]
            [gpml.fixtures :as fixtures]
            [gpml.seeder.main :as seeder]
            [gpml.test-util :as test-util]))

(use-fixtures :each fixtures/with-test-system)

(defn- new-stakeholder [db]
  (db.stakeholder/new-stakeholder db
                                  {:picture "https://picsum.photos/200"
                                   :title "Mr."
                                   :first_name "First name"
                                   :last_name "Last name"
                                   :affiliation nil
                                   :email "email@un.org"
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
    (let [sth-id (-> (new-stakeholder db) first :id)
          cat-id (-> (db.tag/new-tag-category db {:category "technology"}) first :id)
          tag-1 (-> (db.tag/new-tag db {:tag "creator"
                                        :tag_category cat-id}) first :id)
          tag-2 (-> (db.tag/new-tag db {:tag "user"
                                        :tag_category cat-id}) first :id)]
      (testing "Creating a new relation between a stakeholder and a technolgy item"
        (db.portfolio/new-relation db {:stakeholder sth-id
                                       :tag tag-1
                                       :topic_type "technology"
                                       :topic 1})
        (db.portfolio/new-relation db {:stakeholder sth-id
                                       :tag tag-2
                                       :topic_type "technology"
                                       :topic 1}))
      (testing "Attempting to create the same relation doesn't fail"
        (db.portfolio/new-relation db {:stakeholder sth-id
                                       :tag tag-1
                                       :topic_type "technology"
                                       :topic 1}))
      (testing "Getting relations for a given stakeholder"
        (is (= 2 (count (db.portfolio/relation-by-stakeholder db
                                                              {:stakeholder sth-id}))))))))

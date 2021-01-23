(ns gpml.db.browse-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.db.browse :as db.browse]
            [gpml.fixtures :as fixtures]
            [gpml.seeder.main :as seeder]
            [gpml.test-util :as test-util]))

(use-fixtures :each fixtures/with-test-system)

(deftest topic-filtering
  (let [db (test-util/db-test-conn)]
    (seeder/seed db {:country? true
                     :technology? true})
    (testing "Simple text search"
      (is (not-empty (db.browse/filter-topic db {:search-text "plastic"}))))
    (testing "Filtering by geo coverage"
      (is (not-empty (db.browse/filter-topic db {:geo-coverage #{"***" "IND"}}))))
    (testing "Filtering by topic"
      (is (empty? (db.browse/filter-topic db {:topic #{"policy"}}))))
    (testing "Combination of 3 filters"
      (is (not-empty (db.browse/filter-topic db {:search-text "barrier"
                                                 :geo-coverage #{"***" "IND"}
                                                 :topic #{"policy" "technology"}}))))))

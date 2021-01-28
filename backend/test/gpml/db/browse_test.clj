(ns gpml.db.browse-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.db.browse :as db.browse]
            [gpml.db.event :as db.event]
            [gpml.fixtures :as fixtures]
            [gpml.seeder.main :as seeder]
            [gpml.test-util :as test-util]))

(use-fixtures :each fixtures/with-test-system)

(def event-sample {:remarks "Remarks",
                   :description "Description of the event"
                   :title "Event 10"
                   :country 1
                   :city "Timbuktu"
                   :image nil
                   :geo_coverage_type nil
                   :end_date "2021-01-01T12:00:00Z"
                   :approved_at "2021-01-01T12:00:00Z"
                   :start_date "2021-01-01T10:00:00Z"})

(deftest topic-filtering
  (let [db (test-util/db-test-conn)
        _ (seeder/seed db {:country? true
                           :technology? true})
        event-id (first (db.event/new-event db event-sample))]
    (testing "Simple text search"
      (is (not-empty (db.browse/filter-topic db {:search-text "plastic"}))))
    (testing "Filtering by geo coverage"
      (is (not-empty (db.browse/filter-topic db {:geo-coverage #{"***" "IND"}}))))
    (testing "Filtering by topic"
      (is (empty? (db.browse/filter-topic db {:topic #{"policy"}}))))
    (testing "Filtering of unapproved events"
      (is (empty? (db.browse/filter-topic db {:topic #{"event"}}))))
    (testing "Filtering of approved events"
      (is (not-empty (do
                       ;; Approve an event
                       (db.event/approve-event db (merge event-id {:approved_by nil}))
                       (db.browse/filter-topic db {:topic #{"event"}})))))
    (testing "Combination of 3 filters"
      (is (not-empty (db.browse/filter-topic db {:search-text "barrier"
                                                 :geo-coverage #{"***" "IND"}
                                                 :topic #{"policy" "technology"}}))))))

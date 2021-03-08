(ns gpml.db.browse-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.db.browse :as db.browse]
            [gpml.db.event :as db.event]
            [gpml.db.stakeholder :as db.stakeholder]
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
                   :reviewed_at "2021-01-01T12:00:00Z"
                   :start_date "2021-01-01T10:00:00Z"})

(defn make-profile [first-name last-name email]
  {:picture nil
   :cv nil
   :title "mr."
   :first_name first-name
   :last_name last-name
   :affiliation nil
   :email email
   :linked_in nil
   :twitter nil
   :url nil
   :country nil
   :representation "test"
   :about "Lorem Ipsum"
   :geo_coverage_type "global"
   :role "USER"})

(deftest topic-filtering
  (let [db (test-util/db-test-conn)
        _ (seeder/seed db {:country? true
                           :technology? true})
        stakeholder-id (db.stakeholder/new-stakeholder db (make-profile "John" "Doe" "mail@org.com"))
        event-id (db.event/new-event db event-sample)]
    (testing "Simple text search"
      (is (not-empty (db.browse/filter-topic db {:search-text "plastic"}))))
    (testing "Geo coverage values"
      (let [results (db.browse/filter-topic db {:search-text "seabin"})]
        (is (= 1 (count results)))
        (is (= ["AUS" "ESP"] (-> results first :json :geo_coverage_values)))))
    (testing "Filtering by geo coverage"
      (is (not-empty (db.browse/filter-topic db {:geo-coverage #{"IND"}}))))
    (testing "Filtering by topic"
      (is (empty? (db.browse/filter-topic db {:topic #{"policy"}}))))
    (testing "Filtering of unapproved events"
      (is (empty? (db.browse/filter-topic db {:topic #{"event"}}))))
    (testing "Filtering by stakeholders"
      (is (empty? (db.browse/filter-topic db {:topic #{"stakeholder"}}))))
    (testing "Filtering of approved stakeholders"
      (is (not-empty (do
                       ;; Approve an event
                       (db.stakeholder/update-stakeholder-status
                        db
                        (merge stakeholder-id {:review_status "APPROVED"}))
                       (db.browse/filter-topic db {:search-text "Lorem"
                                                   :topic #{"stakeholder"}})))))
    (testing "Filtering of approved events"
      (is (not-empty (do
                       ;; Approve an event
                       (db.event/update-event-status db (merge event-id {:review_status "APPROVED"}))
                       (db.browse/filter-topic db {:topic #{"event"}})))))
    (testing "Combination of 3 filters"
      (is (not-empty (db.browse/filter-topic db {:search-text "barrier"
                                                 :geo-coverage #{"IND"}
                                                 :topic #{"policy" "technology"}}))))))

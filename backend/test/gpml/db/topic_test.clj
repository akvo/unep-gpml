(ns gpml.db.topic-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.db.country :as db.country]
            [gpml.db.country-group :as db.country-group]
            [gpml.db.event :as db.event]
            [gpml.db.topic :as db.topic]
            [gpml.fixtures :as fixtures]
            [gpml.seeder.main :as seeder]
            [gpml.test-util :as test-util]))

(use-fixtures :each fixtures/with-test-system)

(defn event-sample [db]
  {:remarks "Remarks",
   :description "Description of the event"
   :title "Event 10"
   :country (-> (db.country/country-by-code db {:name "IDN"}) :id)
   :city "Timbuktu"
   :image nil
   :geo_coverage_type nil
   :end_date "2021-01-01T12:00:00Z"
   :reviewed_at "2021-01-01T12:00:00Z"
   :start_date "2021-01-01T10:00:00Z"
   :language "en"})

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
   :role "USER"
   :idp_usernames ["auth0|123"]})

(defn get-country-id [db codes]
  (->> {:codes codes}
       (db.country/country-by-codes db)
       (map :id)))

(defn get-country-group-ids [db country-id]
  (db.country-group/get-country-groups-by-countries db {:filters {:countries-ids [country-id]}}))

;; TODO: Extend the tests to include filtering by `featured` flag of resources
(deftest topic-filtering
  (let [db (test-util/db-test-conn)
        _ (seeder/seed db {:country? true
                           :technology? true})
        event-id (db.event/new-event db (event-sample db))]
    (testing "Simple text search"
      (is (not-empty (db.topic/get-topics db {:search-text "plastic"}))))
    (testing "Geo coverage values"
      (let [results (db.topic/get-topics db {:search-text "seabin"})]
        (is (= 1 (count results)))
        (is (= (get-country-id db ["AUS" "ESP"])
               (-> results first :json :geo_coverage_values)))))
    (testing "Search with pagination"
      (let [results (db.topic/get-topics db {:search-text "" :limit 20})
            results1 (db.topic/get-topics db {:search-text "" :limit 20 :offset 10})]
        (is (= 20 (count results)))
        (is (= 20 (count results1)))
        (is (= (nth results1 0) (nth results 10)))))
    (testing "Filtering by geo coverage"
      (let [country-id (get-country-id db ["IND"])
            transnationals (set (map :id (get-country-group-ids db (first country-id))))]
        (is (not-empty (db.topic/get-topics db {:geo-coverage country-id
                                                :transnational transnationals})))))
    (testing "Filtering by topic"
      (is (empty? (db.topic/get-topics db {:topic #{"policy"} :review-status "APPROVED"}))))
    (testing "Filtering of unapproved events"
      (is (empty? (db.topic/get-topics db {:topic #{"event"} :review-status "APPROVED"}))))
    (testing "Filtering of approved events"
      (is (not-empty (do
                       ;; Approve an event
                       (db.event/update-event-status db (merge event-id {:review_status "APPROVED"}))
                       (db.topic/get-topics db {:topic #{"event"} :review-status "APPROVED"})))))
    (testing "Combination of 3 filters"
      (let [country-id (get-country-id db ["IND"])
            transnationals (set (map :id (get-country-group-ids db (first country-id))))]
        (is (not-empty (db.topic/get-topics db {:search-text "barrier"
                                                :geo-coverage country-id
                                                :transnational transnationals
                                                :topic #{"policy" "technology"}})))))))

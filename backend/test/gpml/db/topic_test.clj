(ns gpml.db.topic-test
  (:require [clojure.string :as str]
            [clojure.test :refer [deftest testing is use-fixtures]]
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
   :role "USER"
   :idp_usernames ["auth0|123"]})

(defn get-country-id [db codes]
  (->> {:codes codes}
       (db.country/country-by-codes db)
       (map :id)))

(defn get-country-group-ids [db country-id]
  (db.country-group/get-country-groups-by-country db {:id country-id}))

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
            transnationals (set (map str (get-country-group-ids db (first country-id))))]
        (is (not-empty (db.topic/get-topics db {:geo-coverage country-id
                                                :transnational transnationals})))))
    (testing "Filtering by topic"
      (is (empty? (db.topic/get-topics db {:topic #{"policy"}}))))
    (testing "Filtering of unapproved events"
      (is (empty? (db.topic/get-topics db {:topic #{"event"}}))))
    (testing "Filtering of approved events"
      (is (not-empty (do
                       ;; Approve an event
                       (db.event/update-event-status db (merge event-id {:review_status "APPROVED"}))
                       (db.topic/get-topics db {:topic #{"event"}})))))
    (testing "Combination of 3 filters"
      (let [country-id (get-country-id db ["IND"])
            transnationals (set (map str (get-country-group-ids db (first country-id))))]
        (is (not-empty (db.topic/get-topics db {:search-text "barrier"
                                                :geo-coverage country-id
                                                :transnational transnationals
                                                :topic #{"policy" "technology"}})))))))

(deftest test-generate-filter-topic-snippet
  (testing "Testing filter-topic snippet with no params"
    (let [snippet (str/trim (db.topic/generate-filter-topic-snippet nil))]
      (is (str/starts-with? snippet "SELECT DISTINCT ON"))
      (is (str/includes? snippet "WHERE t.json->>'review_status'='APPROVED'"))
      (is (not (str/includes? snippet "JOIN")))))

  (testing "Testing filter-topic snippet with favorites"
    (let [params {:favorites true :user-id 1 :resource-types []}
          snippet (str/trim (db.topic/generate-filter-topic-snippet params))]
      (is (str/starts-with? snippet "SELECT DISTINCT ON"))
      (is (str/includes? snippet "WHERE t.json->>'review_status'='APPROVED'"))
      (is (str/includes? snippet "JOIN v_stakeholder_association"))))

  (testing "Testing filter-topic snippet with tags"
    (let [params {:tag ["waste management"]}
          snippet (str/trim (db.topic/generate-filter-topic-snippet params))]
      (is (str/starts-with? snippet "SELECT DISTINCT ON"))
      (is (str/includes? snippet "AND t.json->>'tags'"))
      (is (str/includes? snippet "JOIN json_array_elements(t.json->'tags')"))))

  (testing "Testing filter-topic snippet with geo-coverage"
    (let [params {:geo-coverage "global"}
          snippet (str/trim (db.topic/generate-filter-topic-snippet params))]
      (is (str/starts-with? snippet "SELECT DISTINCT ON"))
      (is (str/includes? snippet "AND (t.geo_coverage"))
      (is (not (str/includes? snippet "JOIN")))))

  (testing "Testing filter-topic snippet with search-text"
    (let [params {:search-text "marine litter"}
          snippet (str/trim (db.topic/generate-filter-topic-snippet params))]
      (is (str/starts-with? snippet "SELECT DISTINCT ON"))
      (is (str/includes? snippet "AND t.search_text"))
      (is (not (str/includes? snippet "JOIN"))))))

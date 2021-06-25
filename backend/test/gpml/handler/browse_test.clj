(ns gpml.handler.browse-test
  (:require [clojure.string :as str]
            [clojure.test :refer [deftest testing is are use-fixtures]]
            [gpml.constants :refer [topics]]
            [gpml.handler.browse :as browse]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.favorite :as db.favorite]
            [gpml.fixtures :as fixtures]
            [gpml.test-util :as test-util]
            [gpml.db.browse-test :as db.browse-test]
            [gpml.seeder.main :as seeder]
            [integrant.core :as ig]
            [malli.core :as malli]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(deftest query-params
  (testing "Country query parameter validation"
    (let [valid? #(malli/validate [:re browse/country-re] %)]
      (are [expected value] (= expected (valid? value))
        true "0,107"
        true "170,102"
        true "170,102,73,106,107"
        false ""
        false " "
        false ","
        false ",,"
        false "107,106,"
        false "IDN"
        false "IDN, IND"
        false "esp"
        false "esp,usa")))
  (testing "Topic query parameter validation"
    (let [valid? #(malli/validate [:re browse/topic-re] %)]
      (is (true? (every? valid? topics)))
      (are [expected value] (= expected (valid? value))
        true "technology,project"
        true "financing_resource,event"
        true "stakeholder,event,policy"
        true (str/join "," topics)
        false "resource"
        false "technology,"
        false "technology,event,"
        false ""
        false " "
        false ","
        false ",,"))))

(deftest db-filter-based-on-query-params
  (testing "Everything is empty"
    (is (= (browse/get-db-filter {}) {}))
    (is (= (browse/get-db-filter {:q "" :topic "" :country ""}) {})))
  (testing "Country is not empty"
    (is (= (browse/get-db-filter {:country "73,106,107"})
           {:geo-coverage [107 73 106]})))
  (testing "Topic is not empty"
    (is (= (browse/get-db-filter {:topic "technology"})
           {:topic #{"technology"}})))
  (testing "Search is not empty"
    (is (= (browse/get-db-filter {:q "act"})
           {:search-text "act"})))
  (testing "Search multiple keywords"
    (is (= (browse/get-db-filter {:q "some test"})
           {:search-text "some & test"})))
  (testing "Trailing/leading/double spaces are trimmed"
    (is (= (browse/get-db-filter {:q "  This   is a test  "})
           {:search-text "This & is & a & test"})))
  (testing "Ampersand is removed"
    (is (= (browse/get-db-filter {:q "&&test&&"})
           {:search-text "test"})))
  (testing "None is empty"
    (is (= (browse/get-db-filter {:q "eco"
                                  :country "253"
                                  :topic "project,event"})
           {:search-text "eco"
            :geo-coverage [253]
            :topic #{"project" "event"}}))))

(deftest db-filter-based-on-approved-status
  (testing "Modifying topics for unapproved users"
    (is (= (browse/modify-db-filter-topics
            {:approved false
             :search-text "eco"
             :geo-coverage #{"253"}
             :topic #{"project" "event" "stakeholder"}})

           {:approved false
            :search-text "eco"
            :geo-coverage #{"253"}
            :topic #{"project" "event"}}))

    (is (= (browse/modify-db-filter-topics
            {:approved false
             :search-text "eco"
             :geo-coverage #{"253"}})
           {:approved false
            :search-text "eco"
            :geo-coverage #{"253"}
            :topic #{"project" "event" "technology" "financing_resource"
                     "technical_resource" "action_plan" "policy"}})))

  (testing "Topics for approved users unchanged"
    (is (= (browse/modify-db-filter-topics
            {:approved true
             :search-text "eco"
             :geo-coverage #{"253"}
             :topic #{"project" "event" "stakeholder"}})

           {:approved true
            :search-text "eco"
            :geo-coverage #{"253"}
            :topic #{"project" "event" "stakeholder"}}))))

(deftest browse-view-results
  (let [db (test-util/db-test-conn)
        system (-> fixtures/*system*
                   (ig/init [::browse/get]))
        handler (::browse/get system)
        limit 50 ;; set in browse.sql
        email "mail@org.com"
        profile-data (db.browse-test/make-profile "John" "Doe" email)
        _ (seeder/seed db {:country? true :technology? true})
        ;; Create a stakeholder
        sth (db.stakeholder/new-stakeholder db profile-data)
        ;; Mark stakeholder as APPROVED
        _ (db.stakeholder/update-stakeholder-status db (assoc sth :review_status "APPROVED"))
        ;; Mark a technology as favorite
        _ (db.favorite/new-association db {:stakeholder (:id sth)
                                           :topic "technology"
                                           :topic_id 1
                                           :association "user"
                                           :remarks nil})]

    (testing "Simple query WITHOUT LOGIN"
      (let [resp (handler (mock/request :get "/"))
            body (-> resp :body)
            results (:results body)
            counts (:counts body)
            tech-count (first counts)]
        (is (= limit (count results)))
        (is (= 1 (count counts)))
        (is (= (:topic tech-count) "technology"))
        (is (> (:count tech-count) limit))))

    (testing "Simple query WITH login"
      (let [request (-> (mock/request :get "/")
                        (assoc
                         :approved? true
                         :user sth))
            resp (handler request)
            body(-> resp :body)
            results (:results body)
            counts (:counts body)]
        (is (= limit (count results)))
        (is (= 2 (count counts)))
        (is (= #{"technology" "stakeholder"} (set (map :topic counts))))))

    (testing "Query stakeholders WITHOUT LOGIN"
      (let [request (-> (mock/request :get "/")
                        (assoc
                         :parameters {:query {:topic "stakeholder"}}))
            resp (handler request)
            body (-> resp :body)
            results (:results body)
            counts (:counts body)]
        (is (= 0 (count results)))
        (is (= 1 (count counts)))
        (is (= (-> counts first :topic) "technology"))))

    (testing "Query stakeholders as approved and logged-in user"
      (let [request (-> (mock/request :get "/")
                        (assoc
                         :approved? true
                         :user sth
                         :parameters {:query {:topic "stakeholder"}}))
            resp (handler request)
            body (-> resp :body)
            results (:results body)
            counts (:counts body)]
        (is (= 1 (count results)))
        (is (= (:id sth) (-> results first :id)))
        (is (= 2 (count counts)))
        (is (= #{"technology" "stakeholder"} (set (map :topic counts))))))

    (testing "Query for favorites WITHOUT LOGIN"
      (let [request (-> (mock/request :get "/")
                        (assoc
                         :parameters {:query {:favorites true}}))
            resp (handler request)
            body (-> resp :body)
            results (:results body)
            counts (:counts body)
            tech-count (first counts)]
        ;; results are not filtered, because not logged in user
        (is (= limit (count results)))
        (is (= 1 (count counts)))
        (is (= (:topic tech-count) "technology"))
        (is (> (:count tech-count) limit))))

    (testing "Query for favorites as approved and logged-in user"
      (let [request (-> (mock/request :get "/")
                        (assoc
                         :approved? true
                         :user sth
                         :parameters {:query {:favorites true}}))
            resp (handler request)
            body(-> resp :body)
            results (:results body)
            counts (:counts body)
            tech-count (first counts)]
        ;; Only favorites are shown
        (is (= 1 (count results)))
        ;; only tech returned
        (is (= 1 (count counts)))
        (is (= (:topic tech-count) "technology"))
        (is (= (:count tech-count) 1))))))

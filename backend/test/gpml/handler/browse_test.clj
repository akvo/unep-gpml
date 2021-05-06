(ns gpml.handler.browse-test
  (:require [clojure.string :as str]
            [clojure.test :refer [deftest testing is are]]
            [gpml.constants :refer [topics]]
            [gpml.handler.browse :as browse]
            [malli.core :as malli]))

(deftest query-params
  (testing "Country query parameter validation"
    (let [valid? #(malli/validate [:re browse/country-re] %)]
      (are [expected value] (= expected (valid? value))
        true "NLD"
        true "NLD,HND"
        true "NLD,HND,ESP,IDN,IND"
        false ""
        false " "
        false ","
        false ",,"
        false "ESP,IDN,"
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
    (is (= (browse/get-db-filter {:country "ESP,IND,IDN"})
           {:geo-coverage #{"ESP" "IND" "IDN"}})))
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
                                  :country "USA"
                                  :topic "project,event"})
           {:search-text "eco"
            :geo-coverage #{"USA"}
            :topic #{"project" "event"}}))))

(deftest db-filter-based-on-approved-status
  (testing "Modifying topics for unapproved users"
    (is (= (browse/modify-db-filter-topics
            {:approved false
             :search-text "eco"
             :geo-coverage #{"USA"}
             :topic #{"project" "event" "stakeholder"}})

           {:approved false
            :search-text "eco"
            :geo-coverage #{"USA"}
            :topic #{"project" "event"}}))

    (is (= (browse/modify-db-filter-topics
            {:approved false
             :search-text "eco"
             :geo-coverage #{"USA"}})
           {:approved false
            :search-text "eco"
            :geo-coverage #{"USA"}
            :topic #{"project" "event" "technology" "financing_resource"
                     "technical_resource" "action_plan" "policy"}})))

  (testing "Topics for approved users unchanged"
    (is (= (browse/modify-db-filter-topics
            {:approved true
             :search-text "eco"
             :geo-coverage #{"USA"}
             :topic #{"project" "event" "stakeholder"}})

           {:approved true
            :search-text "eco"
            :geo-coverage #{"USA"}
            :topic #{"project" "event" "stakeholder"}}))))

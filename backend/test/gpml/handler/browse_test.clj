(ns gpml.handler.browse-test
  (:require [clojure.string :as str]
            [clojure.test :refer [deftest testing is are]]
            [gpml.constants :refer [topics]]
            [gpml.handler.browse :as browse]
            [malli.core :as malli]))

(#(malli/validate [:re browse/country-re] %) "0,39")

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

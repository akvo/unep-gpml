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
        true "people,event,policy"
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
  (testing "None is empty"
    (is (= (browse/get-db-filter {:q "eco"
                                  :country "USA"
                                  :topic "project,event"})
           {:search-text "eco"
            :geo-coverage #{"USA"}
            :topic #{"project" "event"}}))))

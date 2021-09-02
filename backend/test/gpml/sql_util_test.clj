(ns gpml.sql-util-test
  (:require [clojure.test :refer [deftest testing is]]
            [clojure.string :as str]
            [gpml.sql-util :as util]))

(deftest test-generate-filter-topic-snippet
  (testing "Testing filter-topic snippet with no params"
    (let [snippet (str/trim (util/generate-filter-topic-snippet nil))]
      (is (str/starts-with? snippet "SELECT DISTINCT ON"))
      (is (str/ends-with? snippet "WHERE 1=1"))
      (is (not (str/includes? snippet "JOIN")))))

  (testing "Testing filter-topic snippet with favorites"
    (let [params {:favorites true :user-id 1 :resource-types []}
          snippet (str/trim (util/generate-filter-topic-snippet params))]
      (is (str/starts-with? snippet "SELECT DISTINCT ON"))
      (is (str/ends-with? snippet "WHERE 1=1"))
      (is (str/includes? snippet "JOIN v_stakeholder_association"))))

  (testing "Testing filter-topic snippet with tags"
    (let [params {:tag ["waste management"]}
          snippet (str/trim (util/generate-filter-topic-snippet params))]
      (is (str/starts-with? snippet "SELECT DISTINCT ON"))
      (is (str/includes? snippet "AND t.json->>'tags'"))
      (is (str/includes? snippet "JOIN json_array_elements(t.json->'tags')"))))

  (testing "Testing filter-topic snippet with geo-coverage"
    (let [params {:geo-coverage "global"}
          snippet (str/trim (util/generate-filter-topic-snippet params))]
      (is (str/starts-with? snippet "SELECT DISTINCT ON"))
      (is (str/includes? snippet "AND t.geo_coverage"))
      (is (not (str/includes? snippet "JOIN")))))

  (testing "Testing filter-topic snippet with search-text"
    (let [params {:search-text "marine litter"}
          snippet (str/trim (util/generate-filter-topic-snippet params))]
      (is (str/starts-with? snippet "SELECT DISTINCT ON"))
      (is (str/includes? snippet "AND t.search_text"))
      (is (not (str/includes? snippet "JOIN"))))))

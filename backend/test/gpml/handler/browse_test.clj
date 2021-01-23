(ns gpml.handler.browse-test
  (:require [clojure.string :as str]
            [clojure.test :refer [deftest testing is are]]
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
      (is (true? (every? valid? browse/topics)))
      (are [expected value] (= expected (valid? value))
        true "technology,project"
        true "resource,event"
        true "people,event,policy"
        true (str/join "," browse/topics)
        false "technology,"
        false "technology,event,"
        false ""
        false " "
        false ","
        false ",,"))))

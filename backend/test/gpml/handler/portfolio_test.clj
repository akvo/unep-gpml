(ns gpml.handler.portfolio-test
  (:require [clojure.test :refer [deftest testing are]]
            [gpml.handler.portfolio :as portfolio]
            [malli.core :as malli]))

(deftest test-post-body
  (testing "Checking post body params"
    (let [valid? #(malli/validate portfolio/post-params %)]
      (are [expected value] (= expected (valid? value))
        true [{:type "technology" :id 1 :tag "creator"}]
        true [{:type "technology" :id 1 :tag "creator"}
              {:type "event" :id 1 :tag "organizer"}]
        false [{}]
        false [{:type "technology"}]
        false [{:type "technology" :id 1}]
        false [{:type "technology" :id 1 :tag ""}]
        false [{:type "random" :id 1 :tag "creator"}]))))

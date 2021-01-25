(ns gpml.handler.portfolio-test
  (:require [clojure.test :refer [deftest testing are]]
            [gpml.handler.portfolio :as portfolio]
            [malli.core :as malli]))

(deftest test-post-body
  (testing "Checking post body params"
    (let [valid? #(malli/validate portfolio/post-params %)]
      (are [expected value] (= expected (valid? value))
        true [{:topic "technology" :id 1 :association "user"}]
        true [{:topic "technology" :id 1 :association "user"}
              {:topic "event" :id 1 :association "organiser"}]
        false [{}]
        false [{:topic "technology"}]
        false [{:topic "technology" :id 1}]
        false [{:topic "technology" :id 1 :association "random"}]
        false [{:topic "random" :id 1 :association "creator"}]))))

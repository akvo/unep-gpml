(ns gpml.handler.util-test
  (:require [clojure.test :refer [deftest is testing]]
            [gpml.handler.util :as util]))

(deftest page-count-test
  (testing "page-count"
    (is (= 5 (util/page-count 10 2)))
    (is (= 50 (util/page-count 100 2)))
    (is (= 100 (util/page-count 100 0)))))

(ns gpml.db.initiative-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.db.initiative :as db.initiative]
            [gpml.fixtures :as fixtures]
            [gpml.seeder.dummy :as dummy]
            [gpml.test-util :as test-util]
            [gpml.util :as util]))

(use-fixtures :each fixtures/with-test-system)

(def initiative-data
  {:q1 1.5
   :q2 "test"
   :q3 1000
   :q4 ["vector-1", "vector-2"]
   :q4_1_1 [nil],
   :q4_1_2 [{:map_1 "data"} {:map_2 "data"}]
   :q4_2_1 {:map_1 "val2"}
   :q4_2_2 1
   :q4_3_1 1
   :q4_3_2 1
   :q4_4_1 1
   :q4_4_2 1
   :q4_4_3 1
   :q4_4_4 1
   :q4_4_5 1
   :q5 1
   :q6 1
   :q7 1
   :q7_1_0 1
   :q7_1_1 1
   :q7_1_2 1
   :q7_2 1
   :q7_3 1
   :q8 1
   :q9 1
   :q10 1
   :q11 1
   :q12 1
   :q13 1
   :q14 1
   :q15 1
   :q16 1
   :q17 1
   :q18 1
   :q19 1
   :q20 1
   :q21 1
   :q26 1
   :q27 1
   :q28 1
   :q29 1
   :q30 1
   :q31 1
   :q32 1
   :q33 1
   :q34 1
   :q35 1
   :q36 1
   :q36_1 1
   :q37 1
   :q37_1 1
   :q38 1
   :q39 1
   :q40 1
   :q41 2
   :q41_1 "test"
   :language "en"
   :geo_coverage_type :global})

(deftest insert-data
  (let [db (test-util/db-test-conn)
        admin (dummy/get-or-create-profile db "test@akvo.org" "John Doe" "ADMIN" "APPROVED")]
    (testing "Insert complete data"
      (let [data (db.initiative/new-initiative
                  db
                  (-> initiative-data
                      (assoc :created_by (:id admin) :version 1)
                      db.initiative/initiative->db-initiative))
            result (db.initiative/initiative-by-id db data)
            parsed-result (-> result
                              (util/update-if-not-nil :geo_coverage_type keyword)
                              (util/update-if-not-nil :review_status keyword))]
        (is (= 10001 (-> data :id)))
        (is (= :SUBMITTED (-> parsed-result :review_status)))
        (is (= 10001 (-> parsed-result :created_by)))
        (doseq [[k v] initiative-data]
          (is (= v (get parsed-result k))))))))

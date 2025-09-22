(ns gpml.db.topic.translation-test
  (:require
   [clojure.test :refer [deftest is testing use-fixtures]]
   [gpml.db.topic.translation :as sut]
   [gpml.fixtures :as fixtures]
   [gpml.test-util :as test-util]))

(use-fixtures :each fixtures/with-test-system)

(deftest upsert-bulk-topic-translations-test
  (let [db (test-util/db-test-conn)]
    (testing "Can upsert bulk topic translations for multiple topics in a single language"
      (let [translations [["event" 1 "en" {:title "Test Event Title" :description "Test Event Description"}]
                         ["policy" 1 "en" {:title "Test Policy Title" :abstract "Test Policy Abstract"}]
                         ["resource" 1 "en" {:title "Test Resource Title" :summary "Test Resource Summary"}]]
            result (sut/upsert-bulk-topic-translations db {:translations translations})]
        (is (= 3 result))))))

(deftest upsert-bulk-topic-translations-update-test
  (let [db (test-util/db-test-conn)]
    (testing "Can update existing bulk topic translations"
      ;; First insert some initial data
      (let [initial-translations [["event" 1 "en" {:title "Original Event Title" :description "Original Event Description"}]
                                 ["policy" 1 "en" {:title "Original Policy Title" :abstract "Original Policy Abstract"}]
                                 ["resource" 1 "en" {:title "Original Resource Title" :summary "Original Resource Summary"}]]
            _ (sut/upsert-bulk-topic-translations db {:translations initial-translations})
            ;; Now update with new content
            updated-translations [["event" 1 "en" {:title "Updated Event Title" :description "Updated Event Description"}]
                                 ["policy" 1 "en" {:title "Updated Policy Title" :abstract "Updated Policy Abstract"}]
                                 ["resource" 1 "en" {:title "Updated Resource Title" :summary "Updated Resource Summary"}]]
            result (sut/upsert-bulk-topic-translations db {:translations updated-translations})]
        (is (= 3 result))
        ;; Verify the content was actually updated
        (let [retrieved (sut/get-bulk-topic-translations db {:topic-filters [["event" 1] ["policy" 1] ["resource" 1]] :language "en"})]
          (is (= "Updated Event Title" (get-in (first (filter #(= "event" (:topic_type %)) retrieved)) [:content :title])))
          (is (= "Updated Policy Title" (get-in (first (filter #(= "policy" (:topic_type %)) retrieved)) [:content :title])))
          (is (= "Updated Resource Title" (get-in (first (filter #(= "resource" (:topic_type %)) retrieved)) [:content :title]))))))))

(deftest upsert-bulk-topic-translations-mixed-test
  (let [db (test-util/db-test-conn)]
    (testing "Can handle mixed insert and update operations in bulk"
      ;; First insert some initial data (only event and policy)
      (let [initial-translations [["event" 1 "en" {:title "Original Event Title" :description "Original Event Description"}]
                                 ["policy" 1 "en" {:title "Original Policy Title" :abstract "Original Policy Abstract"}]]
            _ (sut/upsert-bulk-topic-translations db {:translations initial-translations})
            ;; Now do mixed operation: update event, update policy, insert new resource
            mixed-translations [["event" 1 "en" {:title "Updated Event Title" :description "Updated Event Description"}]
                               ["policy" 1 "en" {:title "Updated Policy Title" :abstract "Updated Policy Abstract"}]
                               ["resource" 1 "en" {:title "New Resource Title" :summary "New Resource Summary"}]]
            result (sut/upsert-bulk-topic-translations db {:translations mixed-translations})]
        (is (= 3 result))
        ;; Verify all records exist with correct content
        (let [retrieved (sut/get-bulk-topic-translations db {:topic-filters [["event" 1] ["policy" 1] ["resource" 1]] :language "en"})]
          (is (= 3 (count retrieved)))
          (is (= "Updated Event Title" (get-in (first (filter #(= "event" (:topic_type %)) retrieved)) [:content :title])))
          (is (= "Updated Policy Title" (get-in (first (filter #(= "policy" (:topic_type %)) retrieved)) [:content :title])))
          (is (= "New Resource Title" (get-in (first (filter #(= "resource" (:topic_type %)) retrieved)) [:content :title]))))))))

(deftest get-bulk-topic-translations-test
  (let [db (test-util/db-test-conn)]
    (testing "Can retrieve bulk topic translations for multiple topics in a single language"
      ;; First insert some test data
      (let [translations [["event" 1 "en" {:title "Test Event Title" :description "Test Event Description"}]
                         ["policy" 1 "en" {:title "Test Policy Title" :abstract "Test Policy Abstract"}]
                         ["resource" 1 "en" {:title "Test Resource Title" :summary "Test Resource Summary"}]]
            _ (sut/upsert-bulk-topic-translations db {:translations translations})
            ;; Now retrieve them
            topic-filters [["event" 1] ["policy" 1] ["resource" 1]]
            result (sut/get-bulk-topic-translations db {:topic-filters topic-filters :language "en"})]
        (is (= 3 (count result)))
        (is (= #{"event" "policy" "resource"} (set (map :topic_type result))))
        (is (every? #(= "en" (:language %)) result))
        (is (every? #(= 1 (:topic_id %)) result))
        (is (every? #(map? (:content %)) result))))))
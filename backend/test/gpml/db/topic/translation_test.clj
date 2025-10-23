(ns gpml.db.topic.translation-test
  (:require
   [clojure.java.jdbc :as jdbc]
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

(deftest delete-bulk-topic-translations-test
  (let [db (test-util/db-test-conn)]
    (testing "Can delete bulk topic translations for multiple topics (all languages)"
      ;; Setup: Add French language for multi-language testing
      (jdbc/execute! db ["INSERT INTO language (english_name, native_name, iso_code) VALUES ('French', 'Français', 'fr') ON CONFLICT (iso_code) DO NOTHING"])

      ;; Setup: Insert translations in English and French
      (let [translations [["event" 1 "en" {:title "Event 1"}]
                          ["event" 1 "fr" {:title "Événement 1"}]
                          ["policy" 1 "en" {:title "Policy 1"}]
                          ["policy" 1 "fr" {:title "Politique 1"}]
                          ["resource" 1 "en" {:title "Resource 1"}]] ; Only in English
            _ (sut/upsert-bulk-topic-translations db {:translations translations})

            ;; Delete event 1 and policy 1 (should remove all languages)
            result (sut/delete-bulk-topic-translations db {:topic-filters [["event" 1] ["policy" 1]]})]

        ;; Should delete 4 records (event 1: 2 langs + policy 1: 2 langs)
        (is (= 4 result))

        ;; Only resource 1 should remain
        (let [remaining (sut/get-bulk-topic-translations db {:topic-filters [["event" 1] ["policy" 1] ["resource" 1]] :language "en"})]
          (is (= 1 (count remaining)))
          (is (= "resource" (:topic_type (first remaining)))))))))

;; Source data fetching tests

(deftest get-bulk-source-data-policy-test
  (let [db (test-util/db-test-conn)]
    (testing "Can fetch source data for policies"
      ;; Setup: Insert test policy
      (jdbc/execute! db ["INSERT INTO policy (id, language, title, abstract, remarks, info_docs) VALUES (99001, 'en', 'Test Policy', 'Test Abstract', 'Test Remarks', 'Test Info') ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, abstract = EXCLUDED.abstract, remarks = EXCLUDED.remarks, info_docs = EXCLUDED.info_docs"])

      (let [result (sut/get-bulk-source-data db [["policy" 99001]])]
        (is (= 1 (count result)))
        (is (= "policy" (:topic_type (first result))))
        (is (= 99001 (:topic_id (first result))))
        (is (= "Test Policy" (:title (first result))))
        (is (= "Test Abstract" (:abstract (first result))))
        (is (= "Test Remarks" (:remarks (first result))))
        (is (= "Test Info" (:info_docs (first result))))))))

(deftest get-bulk-source-data-event-test
  (let [db (test-util/db-test-conn)]
    (testing "Can fetch source data for events"
      ;; Setup: Insert test event
      (jdbc/execute! db ["INSERT INTO event (id, language, title, description, remarks, info_docs) VALUES (99001, 'en', 'Test Event', 'Test Description', 'Test Remarks', 'Test Info') ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, remarks = EXCLUDED.remarks, info_docs = EXCLUDED.info_docs"])

      (let [result (sut/get-bulk-source-data db [["event" 99001]])]
        (is (= 1 (count result)))
        (is (= "event" (:topic_type (first result))))
        (is (= 99001 (:topic_id (first result))))
        (is (= "Test Event" (:title (first result))))
        (is (= "Test Description" (:description (first result))))
        (is (= "Test Remarks" (:remarks (first result))))
        (is (= "Test Info" (:info_docs (first result))))))))

(deftest get-bulk-source-data-resource-test
  (let [db (test-util/db-test-conn)]
    (testing "Can fetch source data for resources"
      ;; Setup: Insert test resource
      (jdbc/execute! db ["INSERT INTO resource (id, language, title, summary, remarks, value_remarks, info_docs) VALUES (99001, 'en', 'Test Resource', 'Test Summary', 'Test Remarks', 'Test Value Remarks', 'Test Info') ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, remarks = EXCLUDED.remarks, value_remarks = EXCLUDED.value_remarks, info_docs = EXCLUDED.info_docs"])

      (let [result (sut/get-bulk-source-data db [["resource" 99001]])]
        (is (= 1 (count result)))
        (is (= "resource" (:topic_type (first result))))
        (is (= 99001 (:topic_id (first result))))
        (is (= "Test Resource" (:title (first result))))
        (is (= "Test Summary" (:summary (first result))))
        (is (= "Test Remarks" (:remarks (first result))))
        (is (= "Test Value Remarks" (:value_remarks (first result))))
        (is (= "Test Info" (:info_docs (first result))))))))

(deftest get-bulk-source-data-resource-subtype-test
  (let [db (test-util/db-test-conn)]
    (testing "Can fetch source data for resource sub-types"
      ;; Setup: Insert test resource (same resource table for sub-types)
      (jdbc/execute! db ["INSERT INTO resource (id, language, title, summary, remarks, value_remarks, info_docs) VALUES (99002, 'en', 'Test Financing Resource', 'Test Summary', 'Test Remarks', 'Test Value', 'Test Info') ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, remarks = EXCLUDED.remarks, value_remarks = EXCLUDED.value_remarks, info_docs = EXCLUDED.info_docs"])

      (let [result (sut/get-bulk-source-data db [["financing_resource" 99002]])]
        (is (= 1 (count result)))
        (is (= "financing_resource" (:topic_type (first result))))
        (is (= 99002 (:topic_id (first result))))
        (is (= "Test Financing Resource" (:title (first result))))))))

(deftest get-bulk-source-data-technology-test
  (let [db (test-util/db-test-conn)]
    (testing "Can fetch source data for technologies (uses 'name' not 'title')"
      ;; Setup: Insert test technology
      (jdbc/execute! db ["INSERT INTO technology (id, language, name, remarks, info_docs) VALUES (99001, 'en', 'Test Technology', 'Test Remarks', 'Test Info') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, remarks = EXCLUDED.remarks, info_docs = EXCLUDED.info_docs"])

      (let [result (sut/get-bulk-source-data db [["technology" 99001]])]
        (is (= 1 (count result)))
        (is (= "technology" (:topic_type (first result))))
        (is (= 99001 (:topic_id (first result))))
        (is (= "Test Technology" (:name (first result))))
        (is (nil? (:title (first result)))) ; Should not have :title
        (is (= "Test Remarks" (:remarks (first result))))
        (is (= "Test Info" (:info_docs (first result))))))))

(deftest get-bulk-source-data-mixed-types-test
  (let [db (test-util/db-test-conn)]
    (testing "Can fetch source data for mixed topic types in one call"
      ;; Setup: Insert multiple test records
      (jdbc/execute! db ["INSERT INTO policy (id, language, title, abstract) VALUES (99003, 'en', 'Policy Title', 'Policy Abstract') ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, abstract = EXCLUDED.abstract"])
      (jdbc/execute! db ["INSERT INTO event (id, language, title, description) VALUES (99003, 'en', 'Event Title', 'Event Description') ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description"])
      (jdbc/execute! db ["INSERT INTO resource (id, language, title, summary) VALUES (99003, 'en', 'Resource Title', 'Resource Summary') ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary"])

      (let [result (sut/get-bulk-source-data db [["policy" 99003]
                                                  ["event" 99003]
                                                  ["resource" 99003]])]
        (is (= 3 (count result)))
        (is (= #{"policy" "event" "resource"} (set (map :topic_type result))))
        ;; Verify each has correct fields
        (let [policy (first (filter #(= "policy" (:topic_type %)) result))
              event (first (filter #(= "event" (:topic_type %)) result))
              resource (first (filter #(= "resource" (:topic_type %)) result))]
          (is (= "Policy Title" (:title policy)))
          (is (= "Policy Abstract" (:abstract policy)))
          (is (= "Event Title" (:title event)))
          (is (= "Event Description" (:description event)))
          (is (= "Resource Title" (:title resource)))
          (is (= "Resource Summary" (:summary resource))))))))

(deftest get-bulk-source-data-empty-input-test
  (let [db (test-util/db-test-conn)]
    (testing "Returns empty vector for empty input"
      (let [result (sut/get-bulk-source-data db [])]
        (is (= [] result))))))

(deftest get-bulk-source-data-missing-records-test
  (let [db (test-util/db-test-conn)]
    (testing "Gracefully handles missing records"
      (let [result (sut/get-bulk-source-data db [["policy" 999999]])]
        (is (= [] result))))))

(deftest get-bulk-source-data-grouping-test
  (let [db (test-util/db-test-conn)]
    (testing "Efficiently groups requests by topic type"
      ;; Setup: Insert multiple policies
      (jdbc/execute! db ["INSERT INTO policy (id, language, title) VALUES (99004, 'en', 'Policy 1') ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title"])
      (jdbc/execute! db ["INSERT INTO policy (id, language, title) VALUES (99005, 'en', 'Policy 2') ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title"])
      (jdbc/execute! db ["INSERT INTO event (id, language, title) VALUES (99004, 'en', 'Event 1') ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title"])

      ;; Request in mixed order: policy, event, policy
      (let [result (sut/get-bulk-source-data db [["policy" 99004]
                                                  ["event" 99004]
                                                  ["policy" 99005]])]
        ;; Should get all 3 results (grouping is internal optimization)
        (is (= 3 (count result)))
        (is (= 2 (count (filter #(= "policy" (:topic_type %)) result))))
        (is (= 1 (count (filter #(= "event" (:topic_type %)) result))))))))

(deftest get-bulk-source-data-null-fields-test
  (let [db (test-util/db-test-conn)]
    (testing "Handles null fields gracefully"
      ;; Setup: Insert policy with some null fields
      (jdbc/execute! db ["INSERT INTO policy (id, language, title, abstract, remarks, info_docs) VALUES (99006, 'en', 'Policy Title', NULL, NULL, NULL) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, abstract = NULL, remarks = NULL, info_docs = NULL"])

      (let [result (sut/get-bulk-source-data db [["policy" 99006]])]
        (is (= 1 (count result)))
        (is (= "Policy Title" (:title (first result))))
        (is (nil? (:abstract (first result))))
        (is (nil? (:remarks (first result))))
        (is (nil? (:info_docs (first result))))))))
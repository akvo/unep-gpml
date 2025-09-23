(ns gpml.service.topic.translation-test
  (:require
   [clojure.java.jdbc :as jdbc]
   [clojure.test :refer [deftest is testing use-fixtures]]
   [gpml.fixtures :as fixtures]
   [gpml.service.topic.translation :as svc.topic.translation]
   [gpml.test-util :as test-util]
   [integrant.core :as ig]))

(use-fixtures :each fixtures/with-test-system)

(deftest upsert-bulk-topic-translations-test
  (let [system (ig/init fixtures/*system* [:duct.database.sql/hikaricp :duct/const])
        config (get system [:duct/const :gpml.config/common])
        conn (test-util/db-test-conn)]
    ;; Ensure we have required languages in test database
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English'), ('es', 'Spanish', 'Español') ON CONFLICT (iso_code) DO NOTHING"])

    (testing "upsert new topic translations"
      (let [translations-data [{:topic-type "policy" :topic-id 1 :language "en" :content {:title "Policy Title" :summary "Policy Summary"}}
                               {:topic-type "event" :topic-id 2 :language "es" :content {:title "Título del Evento" :description "Descripción"}}]
            result (svc.topic.translation/upsert-bulk-topic-translations config translations-data)]
        (is (:success? result))
        (is (= 2 (:upserted-count result)))))))

(deftest get-bulk-topic-translations-test
  (let [system (ig/init fixtures/*system* [:duct.database.sql/hikaricp :duct/const])
        config (get system [:duct/const :gpml.config/common])
        conn (test-util/db-test-conn)]
    ;; Ensure we have required languages in test database
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English'), ('es', 'Spanish', 'Español') ON CONFLICT (iso_code) DO NOTHING"])

    (testing "get bulk topic translations"
      ;; First insert some test data with both English and Spanish translations
      (let [translations-data [{:topic-type "policy" :topic-id 1 :language "en" :content {:title "Policy Title" :summary "Policy Summary"}}
                               {:topic-type "policy" :topic-id 1 :language "es" :content {:title "Título de Política" :summary "Resumen de Política"}}
                               {:topic-type "event" :topic-id 2 :language "en" :content {:title "Event Title" :description "Event Description"}}]
            _ (svc.topic.translation/upsert-bulk-topic-translations config translations-data)
            topic-filters [{:topic-type "policy" :topic-id 1} {:topic-type "event" :topic-id 2}]
            result (svc.topic.translation/get-bulk-topic-translations config topic-filters "en")]
        (is (:success? result))
        (is (= 2 (count (:translations result))))
        (is (every? #(= "en" (:language %)) (:translations result)))
        (is (= #{"policy" "event"} (set (map :topic_type (:translations result)))))))))

(deftest delete-bulk-topic-translations-test
  (let [system (ig/init fixtures/*system* [:duct.database.sql/hikaricp :duct/const])
        config (get system [:duct/const :gpml.config/common])
        conn (test-util/db-test-conn)]
    ;; Ensure we have required languages in test database
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English'), ('es', 'Spanish', 'Español') ON CONFLICT (iso_code) DO NOTHING"])

    (testing "delete bulk topic translations"
      ;; First insert some test data with multiple languages
      (let [translations-data [{:topic-type "policy" :topic-id 1 :language "en" :content {:title "Policy Title" :summary "Policy Summary"}}
                               {:topic-type "policy" :topic-id 1 :language "es" :content {:title "Título de Política" :summary "Resumen de Política"}}
                               {:topic-type "event" :topic-id 2 :language "en" :content {:title "Event Title" :description "Event Description"}}
                               {:topic-type "event" :topic-id 2 :language "es" :content {:title "Título del Evento" :description "Descripción"}}
                               {:topic-type "resource" :topic-id 3 :language "en" :content {:title "Resource Title" :summary "Resource Summary"}}]
            _ (svc.topic.translation/upsert-bulk-topic-translations config translations-data)
            topic-filters [{:topic-type "policy" :topic-id 1} {:topic-type "event" :topic-id 2}]
            result (svc.topic.translation/delete-bulk-topic-translations config topic-filters)]
        (is (:success? result))
        (is (= 4 (:deleted-count result))) ; Should delete 4 records (policy: 2 languages + event: 2 languages)
        ;; Verify that only resource 3 remains
        (let [remaining (svc.topic.translation/get-bulk-topic-translations config [{:topic-type "resource" :topic-id 3}] "en")]
          (is (= 1 (count (:translations remaining))))
          (is (= "resource" (:topic_type (first (:translations remaining))))))))))
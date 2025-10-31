(ns gpml.service.topic.translation-test
  (:require
   [clojure.java.jdbc :as jdbc]
   [clojure.string]
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
            result (svc.topic.translation/get-bulk-topic-translations config topic-filters "en" nil)]
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
        (let [remaining (svc.topic.translation/get-bulk-topic-translations config [{:topic-type "resource" :topic-id 3}] "en" nil)]
          (is (= 1 (count (:translations remaining))))
          (is (= "resource" (:topic_type (first (:translations remaining))))))))))

;; Auto-translation tests

(deftest delete-topic-translations-test
  (let [system (ig/init fixtures/*system* [:duct.database.sql/hikaricp :duct/const])
        config (get system [:duct/const :gpml.config/common])
        conn (test-util/db-test-conn)]
    ;; Ensure we have required languages in test database
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English'), ('es', 'Spanish', 'Español'), ('fr', 'French', 'Français') ON CONFLICT (iso_code) DO NOTHING"])

    (testing "delete single topic translations (all languages)"
      ;; Insert translations for multiple topics in multiple languages
      (let [translations-data [{:topic-type "policy" :topic-id 1 :language "en" :content {:title "Policy 1"}}
                               {:topic-type "policy" :topic-id 1 :language "es" :content {:title "Política 1"}}
                               {:topic-type "policy" :topic-id 1 :language "fr" :content {:title "Politique 1"}}
                               {:topic-type "event" :topic-id 2 :language "en" :content {:title "Event 2"}}
                               {:topic-type "event" :topic-id 2 :language "es" :content {:title "Evento 2"}}]
            _ (svc.topic.translation/upsert-bulk-topic-translations config translations-data)
            ;; Delete all translations for policy:1
            result (svc.topic.translation/delete-topic-translations config "policy" 1)]
        (is (:success? result))
        (is (= 3 (:deleted-count result))) ; Should delete 3 records (all languages)
        ;; Verify policy:1 translations are gone
        (let [remaining-policy (svc.topic.translation/get-bulk-topic-translations config [{:topic-type "policy" :topic-id 1}] "en" nil)]
          (is (= 0 (count (:translations remaining-policy)))))
        ;; Verify event:2 translations still exist
        (let [remaining-event (svc.topic.translation/get-bulk-topic-translations config [{:topic-type "event" :topic-id 2}] "en" nil)]
          (is (= 1 (count (:translations remaining-event)))))))))

(deftest get-bulk-translations-with-auto-translate-all-exist-test
  (let [system (ig/init fixtures/*system* [:duct.database.sql/hikaricp :duct/const])
        config (get system [:duct/const :gpml.config/common])
        conn (test-util/db-test-conn)]
    ;; Ensure we have required languages
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English'), ('es', 'Spanish', 'Español') ON CONFLICT (iso_code) DO NOTHING"])

    (testing "all translations exist - no auto-translate needed"
      ;; Insert existing translations
      (let [translations-data [{:topic-type "policy" :topic-id 1 :language "es" :content {:title "Política Existente"}}]
            _ (svc.topic.translation/upsert-bulk-topic-translations config translations-data)
            topic-filters [{:topic-type "policy" :topic-id 1}]
            result (svc.topic.translation/get-bulk-translations-with-auto-translate config topic-filters "es" nil)]
        (is (:success? result))
        (is (= 1 (count (:translations result))))
        (is (= "Política Existente" (get-in (first (:translations result)) [:content :title])))))))

(deftest get-bulk-translations-with-auto-translate-no-adapter-test
  (let [system (ig/init fixtures/*system* [:duct.database.sql/hikaricp :duct/const])
        config (dissoc (get system [:duct/const :gpml.config/common]) :translate-adapter) ; No adapter
        conn (test-util/db-test-conn)]
    ;; Ensure we have required languages
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English'), ('es', 'Spanish', 'Español') ON CONFLICT (iso_code) DO NOTHING"])

    (testing "missing translations but no adapter - returns empty"
      ;; Setup: Insert test policy (source data)
      (jdbc/execute! conn ["INSERT INTO policy (id, language, title, abstract) VALUES (99901, 'en', 'Test Policy', 'Test Abstract') ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, abstract = EXCLUDED.abstract"])

      (let [topic-filters [{:topic-type "policy" :topic-id 99901}]
            result (svc.topic.translation/get-bulk-translations-with-auto-translate config topic-filters "es" nil)]
        (is (:success? result))
        (is (= 0 (count (:translations result)))))))) ; No translations, no adapter

(deftest get-bulk-translations-with-auto-translate-success-test
  (let [system (ig/init fixtures/*system* [:duct.database.sql/hikaricp :duct/const])
        ;; Use mock translate adapter from test config
        config (get system [:duct/const :gpml.config/common])
        conn (test-util/db-test-conn)]
    ;; Ensure we have required languages
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English'), ('es', 'Spanish', 'Español') ON CONFLICT (iso_code) DO NOTHING"])

    (testing "auto-translate missing translations successfully"
      ;; Setup: Insert test policy (source data)
      (jdbc/execute! conn ["INSERT INTO policy (id, language, title, abstract, remarks, info_docs) VALUES (99902, 'en', 'Climate Policy', 'Reduce emissions', 'Important policy', 'See website') ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, abstract = EXCLUDED.abstract, remarks = EXCLUDED.remarks, info_docs = EXCLUDED.info_docs"])

      (let [topic-filters [{:topic-type "policy" :topic-id 99902}]
            result (svc.topic.translation/get-bulk-translations-with-auto-translate config topic-filters "es" nil)]
        (is (:success? result))
        (is (= 1 (count (:translations result))))
        (let [translation (first (:translations result))]
          (is (= "policy" (:topic_type translation)))
          (is (= 99902 (:topic_id translation)))
          (is (= "es" (:language translation)))
          ;; Mock adapter adds [ES] prefix
          (is (clojure.string/starts-with? (get-in translation [:content :title]) "[ES]"))
          (is (clojure.string/starts-with? (get-in translation [:content :summary]) "[ES]"))  ; Normalized from :abstract
          (is (clojure.string/starts-with? (get-in translation [:content :remarks]) "[ES]"))
          (is (clojure.string/starts-with? (get-in translation [:content :info_docs]) "[ES]")))

        ;; Verify translations were saved to DB
        (let [db-result (svc.topic.translation/get-bulk-topic-translations config topic-filters "es" nil)]
          (is (:success? db-result))
          (is (= 1 (count (:translations db-result)))))))))

(deftest get-bulk-translations-with-auto-translate-fields-filter-test
  (let [system (ig/init fixtures/*system* [:duct.database.sql/hikaricp :duct/const])
        config (get system [:duct/const :gpml.config/common])
        conn (test-util/db-test-conn)]
    ;; Ensure we have required languages
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English'), ('es', 'Spanish', 'Español') ON CONFLICT (iso_code) DO NOTHING"])

    (testing "fields parameter filters response but all fields are translated and saved"
      ;; Setup: Insert test policy (source data)
      (jdbc/execute! conn ["INSERT INTO policy (id, language, title, abstract, remarks, info_docs) VALUES (99903, 'en', 'Test Policy', 'Test Abstract', 'Test Remarks', 'Test Info') ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, abstract = EXCLUDED.abstract, remarks = EXCLUDED.remarks, info_docs = EXCLUDED.info_docs"])

      (let [topic-filters [{:topic-type "policy" :topic-id 99903}]
            ;; Request only title field
            result (svc.topic.translation/get-bulk-translations-with-auto-translate config topic-filters "es" ["title"])]
        (is (:success? result))
        (is (= 1 (count (:translations result))))
        (let [translation (first (:translations result))]
          ;; Response should only have title
          (is (contains? (:content translation) :title))
          (is (= 1 (count (:content translation)))))

        ;; But DB should have ALL fields translated
        (let [db-result (svc.topic.translation/get-bulk-topic-translations config topic-filters "es" nil)]
          (is (:success? db-result))
          (is (= 1 (count (:translations db-result))))
          (let [db-translation (first (:translations db-result))]
            ;; All fields should be in DB
            (is (contains? (:content db-translation) :title))
            (is (contains? (:content db-translation) :summary))  ; Normalized from :abstract
            (is (contains? (:content db-translation) :remarks))
            (is (contains? (:content db-translation) :info_docs))
            (is (= 4 (count (:content db-translation))))))))))

(deftest get-bulk-translations-with-auto-translate-mixed-existing-new-test
  (let [system (ig/init fixtures/*system* [:duct.database.sql/hikaricp :duct/const])
        config (get system [:duct/const :gpml.config/common])
        conn (test-util/db-test-conn)]
    ;; Ensure we have required languages
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English'), ('es', 'Spanish', 'Español') ON CONFLICT (iso_code) DO NOTHING"])

    (testing "mixed scenario - some exist, some need translation"
      ;; Setup: Insert test data
      (jdbc/execute! conn ["INSERT INTO policy (id, language, title, abstract) VALUES (99904, 'en', 'Policy 1', 'Abstract 1') ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, abstract = EXCLUDED.abstract"])
      (jdbc/execute! conn ["INSERT INTO event (id, language, title, description) VALUES (99904, 'en', 'Event 1', 'Description 1') ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description"])

      ;; Insert existing translation for policy only
      (let [_ (svc.topic.translation/upsert-bulk-topic-translations
               config
               [{:topic-type "policy" :topic-id 99904 :language "es" :content {:title "Política 1" :abstract "Resumen 1"}}])

            topic-filters [{:topic-type "policy" :topic-id 99904}
                           {:topic-type "event" :topic-id 99904}]
            result (svc.topic.translation/get-bulk-translations-with-auto-translate config topic-filters "es" nil)]
        (is (:success? result))
        (is (= 2 (count (:translations result))))

        ;; Policy should return existing translation
        (let [policy-translation (first (filter #(= "policy" (:topic_type %)) (:translations result)))]
          (is (= "Política 1" (get-in policy-translation [:content :title])))
          (is (= "Resumen 1" (get-in policy-translation [:content :abstract]))))

        ;; Event should be auto-translated
        (let [event-translation (first (filter #(= "event" (:topic_type %)) (:translations result)))]
          (is (clojure.string/starts-with? (get-in event-translation [:content :title]) "[ES]")))))))

(deftest get-bulk-translations-with-auto-translate-empty-source-test
  (let [system (ig/init fixtures/*system* [:duct.database.sql/hikaricp :duct/const])
        config (get system [:duct/const :gpml.config/common])
        conn (test-util/db-test-conn)]
    ;; Ensure we have required languages
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English'), ('es', 'Spanish', 'Español') ON CONFLICT (iso_code) DO NOTHING"])

    (testing "source data has no translatable text - returns empty gracefully"
      ;; Setup: Insert policy with NULL translatable fields
      (jdbc/execute! conn ["INSERT INTO policy (id, language, title, abstract, remarks, info_docs) VALUES (99905, 'en', NULL, NULL, NULL, NULL) ON CONFLICT (id) DO UPDATE SET title = NULL, abstract = NULL, remarks = NULL, info_docs = NULL"])

      (let [topic-filters [{:topic-type "policy" :topic-id 99905}]
            result (svc.topic.translation/get-bulk-translations-with-auto-translate config topic-filters "es" nil)]
        (is (:success? result))
        (is (= 0 (count (:translations result))))))))

;; Source language detection tests

(deftest get-bulk-translations-with-auto-translate-same-language-skip-test
  (let [system (ig/init fixtures/*system* [:duct.database.sql/hikaricp :duct/const])
        config (get system [:duct/const :gpml.config/common])
        conn (test-util/db-test-conn)]
    ;; Setup: Insert test data
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English'), ('es', 'Spanish', 'Español') ON CONFLICT (iso_code) DO NOTHING"])
    (jdbc/execute! conn ["INSERT INTO policy (id, language, title, abstract, remarks, info_docs) VALUES (99920, 'es', 'Política de Plástico', 'Reducir emisiones', 'Política importante', 'Ver sitio web') ON CONFLICT (id) DO UPDATE SET language = EXCLUDED.language, title = EXCLUDED.title, abstract = EXCLUDED.abstract, remarks = EXCLUDED.remarks, info_docs = EXCLUDED.info_docs"])

    (testing "Requesting Spanish translation for Spanish source should skip translation"
      (let [topic-filters [{:topic-type "policy" :topic-id 99920}]
            result (svc.topic.translation/get-bulk-translations-with-auto-translate config topic-filters "es" nil)]
        (is (:success? result))
        (is (= 1 (count (:translations result))))
        (let [translation (first (:translations result))]
          (is (= "policy" (:topic_type translation)))
          (is (= 99920 (:topic_id translation)))
          (is (= "es" (:language translation)))
          ;; Content should match source exactly (not translated, copied)
          (is (= "Política de Plástico" (get-in translation [:content :title])))
          (is (= "Reducir emisiones" (get-in translation [:content :summary])))  ; Normalized from :abstract
          ;; Mock adapter would have added [ES] prefix if translated
          (is (not (clojure.string/starts-with? (get-in translation [:content :title]) "[ES]"))))))))

(deftest get-bulk-translations-with-auto-translate-multi-language-sources-test
  (let [system (ig/init fixtures/*system* [:duct.database.sql/hikaricp :duct/const])
        config (get system [:duct/const :gpml.config/common])
        conn (test-util/db-test-conn)]
    ;; Setup: Insert test data with different source languages
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English'), ('es', 'Spanish', 'Español'), ('fr', 'French', 'Français') ON CONFLICT (iso_code) DO NOTHING"])
    (jdbc/execute! conn ["INSERT INTO policy (id, language, title, abstract) VALUES (99921, 'en', 'Climate Policy', 'Reduce emissions'), (99922, 'fr', 'Politique Climatique', 'Réduire les émissions'), (99923, 'es', 'Política Climática', 'Reducir emisiones') ON CONFLICT (id) DO UPDATE SET language = EXCLUDED.language, title = EXCLUDED.title, abstract = EXCLUDED.abstract"])

    (testing "Requesting Spanish translation for mixed sources (en, fr, es)"
      (let [topic-filters [{:topic-type "policy" :topic-id 99921}  ; English source
                           {:topic-type "policy" :topic-id 99922}  ; French source
                           {:topic-type "policy" :topic-id 99923}] ; Spanish source (same as target)
            result (svc.topic.translation/get-bulk-translations-with-auto-translate config topic-filters "es" nil)]
        (is (:success? result))
        (is (= 3 (count (:translations result))))

        ;; Find each translation
        (let [translations-by-id (group-by :topic_id (:translations result))
              policy-99921 (first (get translations-by-id 99921))
              policy-99922 (first (get translations-by-id 99922))
              policy-99923 (first (get translations-by-id 99923))]

          ;; English → Spanish: should be translated (mock adds [ES] prefix)
          (is (clojure.string/starts-with? (get-in policy-99921 [:content :title]) "[ES]"))

          ;; French → Spanish: should be translated (mock adds [ES] prefix)
          (is (clojure.string/starts-with? (get-in policy-99922 [:content :title]) "[ES]"))

          ;; Spanish → Spanish: should be copied without translation
          (is (= "Política Climática" (get-in policy-99923 [:content :title])))
          (is (not (clojure.string/starts-with? (get-in policy-99923 [:content :title]) "[ES]"))))))))

(deftest get-bulk-translations-with-auto-translate-correct-source-language-test
  (let [system (ig/init fixtures/*system* [:duct.database.sql/hikaricp :duct/const])
        config (get system [:duct/const :gpml.config/common])
        conn (test-util/db-test-conn)]
    ;; Setup: Insert French source data
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English'), ('es', 'Spanish', 'Español'), ('fr', 'French', 'Français') ON CONFLICT (iso_code) DO NOTHING"])
    (jdbc/execute! conn ["INSERT INTO event (id, language, title, description) VALUES (99924, 'fr', 'Nettoyage de Plage', 'Événement annuel de nettoyage') ON CONFLICT (id) DO UPDATE SET language = EXCLUDED.language, title = EXCLUDED.title, description = EXCLUDED.description"])

    (testing "French source should pass 'fr' as source language"
      (let [topic-filters [{:topic-type "event" :topic-id 99924}]
            result (svc.topic.translation/get-bulk-translations-with-auto-translate config topic-filters "es" nil)]
        (is (:success? result))
        (is (= 1 (count (:translations result))))
        (let [translation (first (:translations result))]
          ;; Mock adapter adds [ES] prefix when translating to Spanish
          (is (clojure.string/starts-with? (get-in translation [:content :title]) "[ES]"))
          ;; Verify translation was created (not skipped)
          (is (= "es" (:language translation))))))))
;; JSONB Array Translation Tests

(deftest get-bulk-translations-with-auto-translate-project-outcomes-array-test
  (let [system (ig/init fixtures/*system* [:duct.database.sql/hikaricp :duct/const])
        config (get system [:duct/const :gpml.config/common])
        conn (test-util/db-test-conn)]
    ;; Setup: Insert project with outcomes array (simple string array)
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English'), ('es', 'Spanish', 'Español') ON CONFLICT (iso_code) DO NOTHING"])
    (jdbc/execute! conn ["INSERT INTO project (id, language, title, summary, outcomes)
                         VALUES (99930, 'en', 'Climate Project', 'Climate initiative',
                                 '[\"10,000 tons plastic removed\", \"50 communities engaged\", \"3 recycling centers\"]'::jsonb)
                         ON CONFLICT (id) DO UPDATE SET language = EXCLUDED.language, title = EXCLUDED.title,
                                                        summary = EXCLUDED.summary, outcomes = EXCLUDED.outcomes"])

    (testing "Project outcomes array should be translated"
      (let [topic-filters [{:topic-type "project" :topic-id 99930}]
            result (svc.topic.translation/get-bulk-translations-with-auto-translate config topic-filters "es" nil)]
        (is (:success? result))
        (is (= 1 (count (:translations result))))
        (let [translation (first (:translations result))
              outcomes (get-in translation [:content :outcomes])]
          ;; Verify outcomes is an array
          (is (sequential? outcomes))
          ;; Verify all 3 items were translated
          (is (= 3 (count outcomes)))
          ;; Mock adapter adds [ES] prefix to each translated string
          (is (every? #(clojure.string/starts-with? % "[ES]") outcomes)))))))

(deftest get-bulk-translations-with-auto-translate-project-highlights-object-array-test
  (let [system (ig/init fixtures/*system* [:duct.database.sql/hikaricp :duct/const])
        config (get system [:duct/const :gpml.config/common])
        conn (test-util/db-test-conn)]
    ;; Setup: Insert project with highlights array (array of objects with url + text)
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English'), ('es', 'Spanish', 'Español') ON CONFLICT (iso_code) DO NOTHING"])
    (jdbc/execute! conn ["INSERT INTO project (id, language, title, summary, highlights)
                         VALUES (99931, 'en', 'Ocean Project', 'Ocean conservation',
                                 '[{\"url\": \"https://example.com/report\", \"text\": \"Annual impact report published\"},
                                   {\"url\": \"\", \"text\": \"Award-winning innovation\"},
                                   {\"url\": \"https://news.com/article\", \"text\": \"Featured in media\"}]'::jsonb)
                         ON CONFLICT (id) DO UPDATE SET language = EXCLUDED.language, title = EXCLUDED.title,
                                                        summary = EXCLUDED.summary, highlights = EXCLUDED.highlights"])

    (testing "Project highlights object array should translate text property and preserve url"
      (let [topic-filters [{:topic-type "project" :topic-id 99931}]
            result (svc.topic.translation/get-bulk-translations-with-auto-translate config topic-filters "es" nil)]
        (is (:success? result))
        (is (= 1 (count (:translations result))))
        (let [translation (first (:translations result))
              highlights (get-in translation [:content :highlights])]
          ;; Verify highlights is an array
          (is (sequential? highlights))
          ;; Verify all 3 items exist
          (is (= 3 (count highlights)))
          ;; Verify each item is a map with :url and :text properties
          (is (every? map? highlights))
          (is (every? #(contains? % :url) highlights))
          (is (every? #(contains? % :text) highlights))
          ;; Verify URLs are preserved exactly (not translated)
          (is (= "https://example.com/report" (:url (nth highlights 0))))
          (is (= "" (:url (nth highlights 1))))
          (is (= "https://news.com/article" (:url (nth highlights 2))))
          ;; Verify text properties were translated (mock adapter adds [ES] prefix)
          (is (every? #(clojure.string/starts-with? (:text %) "[ES]") highlights)))))))

(deftest get-bulk-translations-with-auto-translate-project-both-arrays-test
  (let [system (ig/init fixtures/*system* [:duct.database.sql/hikaricp :duct/const])
        config (get system [:duct/const :gpml.config/common])
        conn (test-util/db-test-conn)]
    ;; Setup: Insert project with both outcomes and highlights arrays
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English'), ('es', 'Spanish', 'Español') ON CONFLICT (iso_code) DO NOTHING"])
    (jdbc/execute! conn ["INSERT INTO project (id, language, title, summary, outcomes, highlights)
                         VALUES (99932, 'en', 'Full Project', 'Complete project',
                                 '[\"Outcome 1\", \"Outcome 2\"]'::jsonb,
                                 '[{\"url\": \"http://test.com\", \"text\": \"Highlight 1\"}, {\"url\": \"\", \"text\": \"Highlight 2\"}]'::jsonb)
                         ON CONFLICT (id) DO UPDATE SET language = EXCLUDED.language, title = EXCLUDED.title,
                                                        summary = EXCLUDED.summary, outcomes = EXCLUDED.outcomes,
                                                        highlights = EXCLUDED.highlights"])

    (testing "Project with both outcomes and highlights arrays"
      (let [topic-filters [{:topic-type "project" :topic-id 99932}]
            result (svc.topic.translation/get-bulk-translations-with-auto-translate config topic-filters "es" nil)]
        (is (:success? result))
        (is (= 1 (count (:translations result))))
        (let [translation (first (:translations result))
              outcomes (get-in translation [:content :outcomes])
              highlights (get-in translation [:content :highlights])]
          ;; Verify both arrays exist and are correct type
          (is (sequential? outcomes))
          (is (sequential? highlights))
          ;; Verify outcomes array structure (simple strings)
          (is (= 2 (count outcomes)))
          (is (every? string? outcomes))
          (is (every? #(clojure.string/starts-with? % "[ES]") outcomes))
          ;; Verify highlights array structure (objects with url + text)
          (is (= 2 (count highlights)))
          (is (every? map? highlights))
          (is (= "http://test.com" (:url (first highlights))))
          (is (every? #(clojure.string/starts-with? (:text %) "[ES]") highlights)))))))

(deftest get-bulk-translations-with-auto-translate-project-empty-arrays-test
  (let [system (ig/init fixtures/*system* [:duct.database.sql/hikaricp :duct/const])
        config (get system [:duct/const :gpml.config/common])
        conn (test-util/db-test-conn)]
    ;; Setup: Insert project with empty arrays
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English'), ('es', 'Spanish', 'Español') ON CONFLICT (iso_code) DO NOTHING"])
    (jdbc/execute! conn ["INSERT INTO project (id, language, title, summary, outcomes, highlights)
                         VALUES (99933, 'en', 'Empty Arrays Project', 'Project with empty arrays',
                                 '[]'::jsonb, '[]'::jsonb)
                         ON CONFLICT (id) DO UPDATE SET language = EXCLUDED.language, title = EXCLUDED.title,
                                                        summary = EXCLUDED.summary, outcomes = EXCLUDED.outcomes,
                                                        highlights = EXCLUDED.highlights"])

    (testing "Project with empty arrays should handle gracefully"
      (let [topic-filters [{:topic-type "project" :topic-id 99933}]
            result (svc.topic.translation/get-bulk-translations-with-auto-translate config topic-filters "es" nil)]
        (is (:success? result))
        (is (= 1 (count (:translations result))))
        (let [translation (first (:translations result))]
          ;; Empty arrays are not included in translation (no translatable content)
          ;; This is correct behavior - we only translate fields with content
          (is (nil? (get-in translation [:content :outcomes])))
          (is (nil? (get-in translation [:content :highlights])))
          ;; Verify other fields were still translated
          (is (clojure.string/starts-with? (get-in translation [:content :title]) "[ES]")))))))

(deftest get-bulk-translations-with-auto-translate-project-null-arrays-test
  (let [system (ig/init fixtures/*system* [:duct.database.sql/hikaricp :duct/const])
        config (get system [:duct/const :gpml.config/common])
        conn (test-util/db-test-conn)]
    ;; Setup: Insert project with null arrays
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English'), ('es', 'Spanish', 'Español') ON CONFLICT (iso_code) DO NOTHING"])
    (jdbc/execute! conn ["INSERT INTO project (id, language, title, summary, outcomes, highlights)
                         VALUES (99934, 'en', 'Null Arrays Project', 'Project with null arrays',
                                 NULL, NULL)
                         ON CONFLICT (id) DO UPDATE SET language = EXCLUDED.language, title = EXCLUDED.title,
                                                        summary = EXCLUDED.summary, outcomes = EXCLUDED.outcomes,
                                                        highlights = EXCLUDED.highlights"])

    (testing "Project with null arrays should handle gracefully"
      (let [topic-filters [{:topic-type "project" :topic-id 99934}]
            result (svc.topic.translation/get-bulk-translations-with-auto-translate config topic-filters "es" nil)]
        (is (:success? result))
        (is (= 1 (count (:translations result))))
        (let [translation (first (:translations result))]
          ;; Verify null fields are not included in translation
          (is (nil? (get-in translation [:content :outcomes])))
          (is (nil? (get-in translation [:content :highlights])))
          ;; Verify other fields were still translated
          (is (clojure.string/starts-with? (get-in translation [:content :title]) "[ES]")))))))

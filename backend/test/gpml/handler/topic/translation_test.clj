(ns gpml.handler.topic.translation-test
  (:require
   [clojure.java.jdbc :as jdbc]
   [clojure.test :refer [deftest is testing use-fixtures]]
   [gpml.fixtures :as fixtures]
   [gpml.handler.topic.translation :as sut]
   [gpml.test-util :as test-util]
   [integrant.core :as ig]
   [malli.core :as m]
   [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(deftest upsert-bulk-topic-translations-test
  (let [system (ig/init fixtures/*system* [::sut/upsert])
        config (get system [:duct/const :gpml.config/common])
        conn (test-util/db-test-conn)
        handler (::sut/upsert system)
        ;; Create a test user
        user-id (test-util/create-test-stakeholder config "translator@test.com" "APPROVED" "USER")]
    ;; Ensure we have required languages in test database
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English'), ('es', 'Spanish', 'Español') ON CONFLICT (iso_code) DO NOTHING"])

    (testing "upsert bulk topic translations with multiple languages"
      (let [translations-data [{:topic-type "policy" :topic-id 1 :language "en" :content {:title "Policy Title" :summary "Policy Summary"}}
                               {:topic-type "policy" :topic-id 1 :language "es" :content {:title "Título de Política" :summary "Resumen de Política"}}
                               {:topic-type "event" :topic-id 2 :language "en" :content {:title "Event Title" :description "Event Description"}}
                               {:topic-type "event" :topic-id 2 :language "es" :content {:title "Título del Evento" :description "Descripción del Evento"}}]
            request (-> (mock/request :put "/bulk-translations")
                        (assoc :parameters {:body translations-data}
                               :user {:id user-id}))
            response (handler request)]
        (is (= 200 (:status response)))
        (is (:success? (:body response)))
        (is (= 4 (:upserted-count (:body response))))))

    (testing "unauthenticated request should return 403"
      (let [translations-data [{:topic-type "policy" :topic-id 1 :language "en" :content {:title "Policy Title"}}]
            request (-> (mock/request :put "/bulk-translations")
                        (assoc :parameters {:body translations-data}))
            response (handler request)]
        (is (= 403 (:status response)))
        (is (= "Authentication required" (get-in response [:body :message])))))

    (testing "empty request body should return success with zero count"
      (let [translations-data []
            request (-> (mock/request :put "/bulk-translations")
                        (assoc :parameters {:body translations-data}
                               :user {:id user-id}))
            response (handler request)]
        (is (= 200 (:status response)))
        (is (:success? (:body response)))
        (is (= 0 (:upserted-count (:body response))))))

    (testing "invalid language code should return bad request"
      (let [translations-data [{:topic-type "policy" :topic-id 1 :language "xyz" :content {:title "Policy Title"}}]
            request (-> (mock/request :put "/bulk-translations")
                        (assoc :parameters {:body translations-data}
                               :user {:id user-id}))
            response (handler request)]
        (is (= 400 (:status response)))
        (is (not (:success? (:body response))))
        (is (= :foreign-key-constraint-violation (get-in response [:body :reason])))))

    (testing "missing required fields should return server error (handler unit test)"
      (let [translations-data [{:topic-type "policy" :content {:title "Policy Title"}}] ; missing topic-id and language
            request (-> (mock/request :put "/bulk-translations")
                        (assoc :parameters {:body translations-data}
                               :user {:id user-id}))
            response (handler request)]
        (is (= 500 (:status response)))
        (is (not (:success? (:body response)))))))) ; Note: Full validation will be tested at route level

(deftest get-bulk-topic-translations-test
  (let [system (ig/init fixtures/*system* [::sut/get [:duct/const :gpml.config/common]])
        conn (test-util/db-test-conn)
        handler (::sut/get system)]
    ;; Ensure we have required languages in test database
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English'), ('es', 'Spanish', 'Español') ON CONFLICT (iso_code) DO NOTHING"])

    ;; Set up test data
    (jdbc/execute! conn ["INSERT INTO topic_translation (topic_type, topic_id, language, content) VALUES ('policy', 1, 'en', '{\"title\": \"Policy Title\", \"summary\": \"Policy Summary\"}'), ('policy', 1, 'es', '{\"title\": \"Título de Política\", \"summary\": \"Resumen de Política\"}'), ('event', 2, 'en', '{\"title\": \"Event Title\", \"description\": \"Event Description\"}') ON CONFLICT (topic_type, topic_id, language) DO UPDATE SET content = EXCLUDED.content"])

    (testing "get bulk translations for multiple topics in single language"
      (let [query-params {:topics [{:topic-type "policy" :topic-id 1}
                                   {:topic-type "event" :topic-id 2}]
                          :language "en"}
            request (-> (mock/request :get "/bulk-translations")
                        (assoc :parameters {:query query-params}))
            response (handler request)
            translations (:translations (:body response))
            first-trans (first translations)
            second-trans (second translations)]
        (is (= 200 (:status response)))
        (is (:success? (:body response)))
        (is (= 2 (count translations)))
          ;; Results are ordered by topic_type, topic_id - so "event" comes before "policy"
        (is (= "Event Title" (:title (:content first-trans))))
        (is (= "Policy Title" (:title (:content second-trans))))))

    (testing "empty topics should return empty results"
      (let [query-params {:topics [] :language "en"}
            request (-> (mock/request :get "/bulk-translations")
                        (assoc :parameters {:query query-params}))
            response (handler request)]
        (is (= 200 (:status response)))
        (is (:success? (:body response)))
        (is (= 0 (count (:translations (:body response)))))))))

(deftest get-bulk-topic-translations-with-fields-test
  (let [system (ig/init fixtures/*system* [::sut/get [:duct/const :gpml.config/common]])
        conn (test-util/db-test-conn)
        handler (::sut/get system)]
    ;; Ensure we have required languages in test database
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English') ON CONFLICT (iso_code) DO NOTHING"])

    ;; Set up test data with multiple content fields
    (jdbc/execute! conn ["INSERT INTO topic_translation (topic_type, topic_id, language, content) VALUES ('policy', 1, 'en', '{\"title\": \"Policy Title\", \"summary\": \"Policy Summary\", \"description\": \"Full Description\"}'), ('event', 2, 'en', '{\"title\": \"Event Title\", \"description\": \"Event Description\", \"location\": \"Event Location\"}') ON CONFLICT (topic_type, topic_id, language) DO UPDATE SET content = EXCLUDED.content"])

    (testing "fields parameter filters content when all requested fields exist"
      (let [query-params {:topics [{:topic-type "policy" :topic-id 1}
                                   {:topic-type "event" :topic-id 2}]
                          :language "en"
                          :fields ["title" "description"]}
            request (-> (mock/request :get "/bulk-translations")
                        (assoc :parameters {:query query-params}))
            response (handler request)
            translations (:translations (:body response))
            event-trans (first translations)  ; event comes first alphabetically
            policy-trans (second translations)]
        (is (= 200 (:status response)))
        (is (:success? (:body response)))
        (is (= 2 (count translations)))
        ;; Event translation should only have title and description (filtered)
        (is (= "Event Title" (:title (:content event-trans))))
        (is (= "Event Description" (:description (:content event-trans))))
        (is (nil? (:location (:content event-trans))))  ; location should be filtered out
        ;; Policy translation should only have title and description (filtered)
        (is (= "Policy Title" (:title (:content policy-trans))))
        (is (= "Full Description" (:description (:content policy-trans))))
        (is (nil? (:summary (:content policy-trans))))))  ; summary should be filtered out

    (testing "fields parameter applies filtering per translation item individually"
      (let [query-params {:topics [{:topic-type "policy" :topic-id 1}
                                   {:topic-type "event" :topic-id 2}]
                          :language "en"
                          :fields ["summary"]}  ; policy has "summary", event doesn't
            request (-> (mock/request :get "/bulk-translations")
                        (assoc :parameters {:query query-params}))
            response (handler request)
            translations (:translations (:body response))
            event-trans (first translations)  ; event comes first alphabetically
            policy-trans (second translations)]
        (is (= 200 (:status response)))
        (is (:success? (:body response)))
        (is (= 2 (count translations)))
        ;; Policy has "summary" field → should return only "summary"
        (is (= "Policy Summary" (:summary (:content policy-trans))))
        (is (nil? (:title (:content policy-trans))))      ; title should be filtered out
        (is (nil? (:description (:content policy-trans)))) ; description should be filtered out
        ;; Event does NOT have "summary" field → should return ALL fields (fallback)
        (is (= "Event Title" (:title (:content event-trans))))
        (is (= "Event Description" (:description (:content event-trans))))
        (is (= "Event Location" (:location (:content event-trans))))))

    (testing "fields parameter with multiple fields filters available fields per item"
      (let [query-params {:topics [{:topic-type "policy" :topic-id 1}
                                   {:topic-type "event" :topic-id 2}]
                          :language "en"
                          :fields ["summary" "location"]}  ; policy has "summary", event has "location"
            request (-> (mock/request :get "/bulk-translations")
                        (assoc :parameters {:query query-params}))
            response (handler request)
            translations (:translations (:body response))
            event-trans (first translations)  ; event comes first alphabetically
            policy-trans (second translations)]
        (is (= 200 (:status response)))
        (is (:success? (:body response)))
        (is (= 2 (count translations)))
        ;; Policy has "summary" but not "location" → should return only "summary"
        (is (= "Policy Summary" (:summary (:content policy-trans))))
        (is (nil? (:title (:content policy-trans))))      ; should be filtered out
        (is (nil? (:description (:content policy-trans)))) ; should be filtered out
        (is (nil? (:location (:content policy-trans))))   ; doesn't exist anyway
        ;; Event has "location" but not "summary" → should return only "location"
        (is (= "Event Location" (:location (:content event-trans))))
        (is (nil? (:title (:content event-trans))))       ; should be filtered out
        (is (nil? (:description (:content event-trans)))) ; should be filtered out
        (is (nil? (:summary (:content event-trans))))))   ; doesn't exist anyway

    (testing "empty fields parameter returns all content"
      (let [query-params {:topics [{:topic-type "policy" :topic-id 1}
                                   {:topic-type "event" :topic-id 2}]
                          :language "en"
                          :fields []}  ; empty fields array
            request (-> (mock/request :get "/bulk-translations")
                        (assoc :parameters {:query query-params}))
            response (handler request)
            translations (:translations (:body response))
            event-trans (first translations)  ; event comes first alphabetically
            policy-trans (second translations)]
        (is (= 200 (:status response)))
        (is (:success? (:body response)))
        (is (= 2 (count translations)))
        ;; Policy should have ALL its fields (no filtering when fields is empty)
        (is (= "Policy Title" (:title (:content policy-trans))))
        (is (= "Policy Summary" (:summary (:content policy-trans))))
        (is (= "Full Description" (:description (:content policy-trans))))
        ;; Event should have ALL its fields (no filtering when fields is empty)
        (is (= "Event Title" (:title (:content event-trans))))
        (is (= "Event Description" (:description (:content event-trans))))
        (is (= "Event Location" (:location (:content event-trans))))))))

(deftest validation-schema-test
  (let [system (ig/init fixtures/*system* [::sut/upsert-params])
        schema (::sut/upsert-params system)]

    (testing "valid input passes validation"
      (let [valid-data [{:topic-type "policy" :topic-id 1 :language "en" :content {:title "Title"}}
                        {:topic-type "event" :topic-id 2 :language "es" :content {:description "Desc"}}]]
        (is (m/validate schema valid-data))))

    (testing "missing topic-id fails validation"
      (let [invalid-data [{:topic-type "policy" :language "en" :content {:title "Title"}}]]
        (is (not (m/validate schema invalid-data)))))

    (testing "missing language fails validation"
      (let [invalid-data [{:topic-type "policy" :topic-id 1 :content {:title "Title"}}]]
        (is (not (m/validate schema invalid-data)))))

    (testing "invalid language length fails validation"
      (let [invalid-data [{:topic-type "policy" :topic-id 1 :language "x" :content {:title "Title"}}]]
        (is (not (m/validate schema invalid-data)))))

    (testing "empty array fails validation"
      (let [invalid-data []]
        (is (not (m/validate schema invalid-data)))))))

(deftest get-with-auto-translate-feature-flag-test
  (let [system (ig/init fixtures/*system* [::sut/get [:duct/const :gpml.config/common]])
        conn (test-util/db-test-conn)
        handler (::sut/get system)]
    ;; Ensure we have required languages in test database
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English'), ('es', 'Spanish', 'Español'), ('fr', 'French', 'Français') ON CONFLICT (iso_code) DO NOTHING"])

    ;; Set up test data - only English exists in DB
    (jdbc/execute! conn ["INSERT INTO topic_translation (topic_type, topic_id, language, content) VALUES ('policy', 1, 'en', '{\"title\": \"Policy Title\", \"summary\": \"Policy Summary\"}') ON CONFLICT (topic_type, topic_id, language) DO UPDATE SET content = EXCLUDED.content"])

    (testing "when auto-translate is disabled, returns only existing translations"
      ;; Note: The system config has auto-translate disabled by default (or via env var)
      ;; Since we can't easily modify the config in this test, we verify the current behavior
      (let [query-params {:topics [{:topic-type "policy" :topic-id 1}]
                          :language "fr"}  ; French translation doesn't exist in DB
            request (-> (mock/request :get "/bulk-translations")
                        (assoc :parameters {:query query-params}))
            response (handler request)]
        (is (= 200 (:status response)))
        (is (:success? (:body response)))
        ;; Should return empty results since French translation doesn't exist and auto-translate is disabled
        (is (= 0 (count (:translations (:body response)))))))

    (testing "when language matches existing translation, returns it regardless of flag"
      (let [query-params {:topics [{:topic-type "policy" :topic-id 1}]
                          :language "en"}  ; English translation exists in DB
            request (-> (mock/request :get "/bulk-translations")
                        (assoc :parameters {:query query-params}))
            response (handler request)]
        (is (= 200 (:status response)))
        (is (:success? (:body response)))
        ;; Should return existing English translation
        (is (= 1 (count (:translations (:body response)))))
        (is (= "Policy Title" (get-in (first (:translations (:body response))) [:content :title])))))))

(deftest delete-bulk-topic-translations-test
  (let [system (ig/init fixtures/*system* [::sut/delete])
        config (get system [:duct/const :gpml.config/common])
        conn (test-util/db-test-conn)
        handler (::sut/delete system)
        ;; Create test admin user
        admin-id (test-util/create-test-stakeholder config "admin@test.com" "APPROVED" "ADMIN")]
    ;; Ensure languages exist
    (jdbc/execute! conn ["INSERT INTO language (iso_code, english_name, native_name) VALUES ('en', 'English', 'English'), ('es', 'Spanish', 'Español'), ('fr', 'French', 'Français') ON CONFLICT (iso_code) DO NOTHING"])

    (testing "delete specific topics (no confirmation needed) with breakdown"
      ;; Insert test translations
      (jdbc/execute! conn ["INSERT INTO topic_translation (topic_type, topic_id, language, content) VALUES
                            ('policy', 99001, 'en', '{\"title\": \"Policy 1\"}'::jsonb),
                            ('policy', 99001, 'es', '{\"title\": \"Política 1\"}'::jsonb),
                            ('event', 99002, 'en', '{\"title\": \"Event 2\"}'::jsonb),
                            ('event', 99002, 'es', '{\"title\": \"Evento 2\"}'::jsonb),
                            ('initiative', 99003, 'fr', '{\"title\": \"Initiative 3\"}'::jsonb)
                            ON CONFLICT (topic_type, topic_id, language) DO NOTHING"])

      (let [query-params {:topics [{:topic-type "policy" :topic-id 99001}
                                   {:topic-type "event" :topic-id 99002}]}
            request (-> (mock/request :delete "/bulk-translations")
                        (assoc :parameters {:query query-params}
                               :user {:id admin-id}))
            response (handler request)]
        (is (= 200 (:status response)))
        (is (:success? (:body response)))
        (is (= 4 (:deleted-count (:body response))))
        (is (= {"policy" 1 "event" 1} (:by-type (:body response))))

        ;; Verify deletion in DB
        (let [remaining (jdbc/query conn ["SELECT COUNT(*) as count FROM topic_translation WHERE (topic_type, topic_id) IN (('policy', 99001), ('event', 99002))"])]
          (is (= 0 (:count (first remaining)))))

        ;; Verify other translations still exist
        (let [remaining (jdbc/query conn ["SELECT COUNT(*) as count FROM topic_translation WHERE topic_type = 'initiative' AND topic_id = 99003"])]
          (is (= 1 (:count (first remaining)))))))

    (testing "delete by topic-type WITH confirmation"
      ;; Insert test translations
      (jdbc/execute! conn ["INSERT INTO topic_translation (topic_type, topic_id, language, content) VALUES
                            ('policy', 99010, 'en', '{\"title\": \"Policy 10\"}'::jsonb),
                            ('policy', 99011, 'es', '{\"title\": \"Política 11\"}'::jsonb),
                            ('policy', 99012, 'fr', '{\"title\": \"Politique 12\"}'::jsonb),
                            ('event', 99013, 'en', '{\"title\": \"Event 13\"}'::jsonb)
                            ON CONFLICT (topic_type, topic_id, language) DO NOTHING"])

      (let [query-params {:topic-type "policy" :confirm true}
            request (-> (mock/request :delete "/bulk-translations")
                        (assoc :parameters {:query query-params}
                               :user {:id admin-id}))
            response (handler request)]
        (is (= 200 (:status response)))
        (is (:success? (:body response)))
        (is (>= (:deleted-count (:body response)) 3))
        (is (map? (:by-type (:body response))))

        ;; Verify all policy translations deleted
        (let [remaining (jdbc/query conn ["SELECT COUNT(*) as count FROM topic_translation WHERE topic_type = 'policy' AND topic_id IN (99010, 99011, 99012)"])]
          (is (= 0 (:count (first remaining)))))

        ;; Verify event translations still exist
        (let [remaining (jdbc/query conn ["SELECT COUNT(*) as count FROM topic_translation WHERE topic_type = 'event' AND topic_id = 99013"])]
          (is (= 1 (:count (first remaining)))))))

    (testing "delete by topic-type WITHOUT confirmation returns 400"
      (let [query-params {:topic-type "event"}
            request (-> (mock/request :delete "/bulk-translations")
                        (assoc :parameters {:query query-params}
                               :user {:id admin-id}))
            response (handler request)]
        (is (= 400 (:status response)))
        (is (not (:success? (:body response))))
        (is (= :confirmation-required (:reason (:body response))))
        (is (= "Deleting all translations of a type requires confirm=true parameter" (:message (:body response))))))

    (testing "delete all translations WITH confirmation"
      ;; Insert fresh test translations
      (jdbc/execute! conn ["INSERT INTO topic_translation (topic_type, topic_id, language, content) VALUES
                            ('policy', 99020, 'en', '{\"title\": \"Policy 20\"}'::jsonb),
                            ('event', 99021, 'es', '{\"title\": \"Evento 21\"}'::jsonb)
                            ON CONFLICT (topic_type, topic_id, language) DO NOTHING"])

      (let [query-params {:confirm true}
            request (-> (mock/request :delete "/bulk-translations")
                        (assoc :parameters {:query query-params}
                               :user {:id admin-id}))
            response (handler request)]
        (is (= 200 (:status response)))
        (is (:success? (:body response)))
        (is (>= (:deleted-count (:body response)) 0))
        (is (map? (:by-type (:body response))))))

    (testing "delete all translations WITHOUT confirmation returns 400"
      (let [query-params {}
            request (-> (mock/request :delete "/bulk-translations")
                        (assoc :parameters {:query query-params}
                               :user {:id admin-id}))
            response (handler request)]
        (is (= 400 (:status response)))
        (is (not (:success? (:body response))))
        (is (= :confirmation-required (:reason (:body response))))
        (is (= "Deleting all translations requires confirm=true parameter" (:message (:body response))))))

    (testing "unauthenticated delete request returns 403"
      (let [query-params {:topics [{:topic-type "policy" :topic-id 1}]}
            request (-> (mock/request :delete "/bulk-translations")
                        (assoc :parameters {:query query-params}))
            response (handler request)]
        (is (= 403 (:status response)))
        (is (= "Authentication required" (get-in response [:body :message])))))))

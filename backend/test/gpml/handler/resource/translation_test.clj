(ns gpml.handler.resource.translation-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.db.event :as db.event]
            [gpml.fixtures :as fixtures]
            [gpml.handler.resource.translation :as res-translation]
            [gpml.seeder.main :as seeder]
            [gpml.service.permissions :as srv.permissions]
            [gpml.test-util :as test-util]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(defonce ^:private default-lang-iso-code "en")

(use-fixtures :each fixtures/with-test-system)

(def event-data
  {:title "Event Data"
   :description "Event Description"
   :start_date "2021-04-01"
   :end_date "2021-04-01"
   :city "Amsterdam"
   :country nil
   :geo_coverage_type "global"
   :remarks nil
   :document_preview false
   :review_status nil
   :image nil
   :tags nil
   :language default-lang-iso-code})

(def translations-event-data
  {:topic-type "event"
   :translations [{:language "es"
                   :translatable_field "title"
                   :value "Título en castellano evento 37"}
                  {:language "fr"
                   :translatable_field "title"
                   :value "Título en francés falso, evento 37"}]})

;; NOTE: We are just using Event resource type as example for tests since the rest are the same.
(deftest handler-put-test
  (let [system (ig/init fixtures/*system* [::res-translation/put])
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        logger (get config :logger)
        handler (::res-translation/put system)
        admin-id (test-util/create-test-stakeholder config
                                                    "john.doe@mail.invalid"
                                                    "APPROVED"
                                                    "ADMIN")
        sth-id (test-util/create-test-stakeholder config
                                                  "john.doe2@mail.invalid"
                                                  "APPROVED"
                                                  "USER")
        event (db.event/new-event conn event-data)
        _ (srv.permissions/create-resource-context {:conn conn
                                                    :logger logger}
                                                   {:context-type :event
                                                    :resource-id (:id event)})
        _ (srv.permissions/assign-roles-to-users {:conn conn
                                                  :logger (:logger config)}
                                                 [{:role-name :resource-owner
                                                   :context-type :event
                                                   :resource-id (:id event)
                                                   :user-id sth-id}])]
    (seeder/seed-languages conn)
    (testing "Creating translations for an event"
      (let [translations (assoc translations-event-data :topic-id (:id event))
            resp (handler (-> (mock/request :put "/")
                              (assoc :jwt-claims {:email "john@org"}
                                     :user {:id admin-id}
                                     :parameters
                                     {:path {:topic-type "event" :topic-id (:id event)}
                                      :body translations})))]
        (is (= 200 (:status resp)))))
    (testing "Creating translations for an event with normal user with enough permissions"
      (let [translations (assoc translations-event-data :topic-id (:id event))
            resp (handler (-> (mock/request :put "/")
                              (assoc :user {:id sth-id}
                                     :parameters
                                     {:path {:topic-type "event" :topic-id (:id event)}
                                      :body translations})))]
        (is (= 200 (:status resp)))))
    (testing "Creating translations for an event with user without enough permissions"
      (let [sth-id (test-util/create-test-stakeholder config
                                                      "john.doe3@mail.invalid"
                                                      "APPROVED"
                                                      "USER")
            translations (assoc translations-event-data :topic-id (:id event))
            resp (handler (-> (mock/request :put "/")
                              (assoc :user {:id sth-id}
                                     :parameters
                                     {:path {:topic-type "event" :topic-id (:id event)}
                                      :body translations})))]
        (is (= 403 (:status resp)))))
    (testing "Updating translations for an event"
      (let [translations (-> translations-event-data
                             (assoc :topic-id (:id event))
                             (update-in [:translations 0 :value] #(str % " edited")))
            resp (handler (-> (mock/request :put "/")
                              (assoc :jwt-claims {:email "john@org"}
                                     :user {:id admin-id}
                                     :parameters
                                     {:path {:topic-type "event" :topic-id (:id event)}
                                      :body translations})))]
        (is (= 200 (:status resp)))))
    (testing "Creating translations fails if not authorized user"
      (let [translations (assoc translations-event-data :topic-id (:id event))
            resp (handler (-> (mock/request :put "/")
                              (assoc :jwt-claims {:email "john@org"}
                                     :parameters
                                     {:path {:topic-type "event" :topic-id (:id event)}
                                      :body translations})))]
        (is (= 403 (:status resp)))))
    (testing "Updating translations with original language fails"
      (let [translations (-> translations-event-data
                             (assoc :topic-id (:id event))
                             (assoc-in [:translations 0 :language] (:language event-data)))
            resp (handler (-> (mock/request :put "/")
                              (assoc :jwt-claims {:email "john@org"}
                                     :user {:id admin-id}
                                     :parameters
                                     {:path {:topic-type "event" :topic-id (:id event)}
                                      :body translations})))]
        (is (= 400 (:status resp)))))
    (testing "Updating translations for non-valid resource type fails"
      (let [translations (-> translations-event-data
                             (assoc :topic-id (:id event))
                             (assoc :topic-type "stakeholder"))
            resp (handler (-> (mock/request :put "/")
                              (assoc :jwt-claims {:email "john@org"}
                                     :user {:id admin-id}
                                     :parameters
                                     {:path {:topic-type "stakeholder" :topic-id (:id event)}
                                      :body translations})))]
        (is (= 403 (:status resp)))))))

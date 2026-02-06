(ns gpml.handler.detail-delete-test
  (:require
   [clojure.java.jdbc :as jdbc]
   [clojure.test :refer [deftest is testing use-fixtures]]
   [gpml.db.country :as db.country]
   [gpml.db.event :as db.event]
   [gpml.db.plastic-strategy :as db.plastic-strategy]
   [gpml.db.resource :as db.resource]
   [gpml.fixtures :as fixtures]
   [gpml.handler.detail :as detail]
   [gpml.service.permissions :as srv.permissions]
   [gpml.test-util :as test-util]
   [integrant.core :as ig]
   [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(def ^:private resource-data
  {:title "Test Resource"
   :type "Financing Resource"
   :publish_year 2021
   :summary "Test Summary"
   :valid_from "2021-01-01"
   :valid_to "2021-12-31"
   :geo_coverage_type "global"
   :language "en"
   :document_preview false})

(def ^:private event-data
  {:title "Test Event"
   :description "Test Event Description"
   :start_date "2021-04-01"
   :end_date "2021-04-01"
   :city "Amsterdam"
   :country nil
   :geo_coverage_type "global"
   :remarks nil
   :document_preview false
   :review_status nil
   :tags nil
   :language "en"})

(deftest delete-resource-with-plastic-strategy-bookmark-test
  (let [system (ig/init fixtures/*system* [::detail/delete])
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        handler (::detail/delete system)
        admin-id (test-util/create-test-stakeholder config
                                                    "admin@mail.invalid"
                                                    "APPROVED"
                                                    "ADMIN")]

    (testing "Deleting a resource with plastic strategy bookmarks succeeds"
      (let [country (db.country/new-country conn {:name "Test Country"
                                                  :iso_code_a3 "TST"
                                                  :description "Test Country"})
            ps-result (db.plastic-strategy/create-plastic-strategy conn {:country-id (:id country)})
            ps-id (:id ps-result)
            resource (db.resource/new-resource conn resource-data)
            resource-id (:id resource)
            _ (srv.permissions/create-resource-context {:conn conn
                                                        :logger (:logger config)}
                                                       {:context-type :resource
                                                        :resource-id resource-id})
            _ (jdbc/insert! conn :plastic_strategy_resource_bookmark
                            {:plastic_strategy_id ps-id
                             :resource_id resource-id
                             :section_key "test-section"})
            resp (handler (-> (mock/request :delete "/")
                              (assoc :user {:id admin-id}
                                     :parameters
                                     {:path {:topic-type "resource"
                                             :topic-id resource-id}})))]
        (is (= 200 (:status resp)))
        (is (empty? (jdbc/query conn
                                ["SELECT * FROM resource WHERE id = ?" resource-id])))
        (is (empty? (jdbc/query conn
                                ["SELECT * FROM plastic_strategy_resource_bookmark WHERE resource_id = ?" resource-id])))))

    (testing "Deleting an event with plastic strategy bookmarks succeeds"
      (let [country (db.country/new-country conn {:name "Test Country 2"
                                                  :iso_code_a3 "TS2"
                                                  :description "Test Country 2"})
            ps-result (db.plastic-strategy/create-plastic-strategy conn {:country-id (:id country)})
            ps-id (:id ps-result)
            event (db.event/new-event conn event-data)
            event-id (:id event)
            _ (srv.permissions/create-resource-context {:conn conn
                                                        :logger (:logger config)}
                                                       {:context-type :event
                                                        :resource-id event-id})
            _ (jdbc/insert! conn :plastic_strategy_event_bookmark
                            {:plastic_strategy_id ps-id
                             :event_id event-id
                             :section_key "test-section"})
            resp (handler (-> (mock/request :delete "/")
                              (assoc :user {:id admin-id}
                                     :parameters
                                     {:path {:topic-type "event"
                                             :topic-id event-id}})))]
        (is (= 200 (:status resp)))
        (is (empty? (jdbc/query conn
                                ["SELECT * FROM event WHERE id = ?" event-id])))
        (is (empty? (jdbc/query conn
                                ["SELECT * FROM plastic_strategy_event_bookmark WHERE event_id = ?" event-id])))))

    (testing "Unauthorized user cannot delete resource"
      (let [user-id (test-util/create-test-stakeholder config
                                                       "user@mail.invalid"
                                                       "APPROVED"
                                                       "USER")
            resource (db.resource/new-resource conn (assoc resource-data :title "Another Resource"))
            resource-id (:id resource)
            _ (srv.permissions/create-resource-context {:conn conn
                                                        :logger (:logger config)}
                                                       {:context-type :resource
                                                        :resource-id resource-id})
            resp (handler (-> (mock/request :delete "/")
                              (assoc :user {:id user-id}
                                     :parameters
                                     {:path {:topic-type "resource"
                                             :topic-id resource-id}})))]
        (is (= 403 (:status resp)))))))

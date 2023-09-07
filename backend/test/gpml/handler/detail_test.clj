(ns gpml.handler.detail-test
  (:require [clojure.java.io :as io]
            [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.db.country :as db.country]
            [gpml.db.event :as db.event]
            [gpml.db.initiative :as db.initiative]
            [gpml.db.policy :as db.policy]
            [gpml.db.technology :as db.technology]
            [gpml.fixtures :as fixtures]
            [gpml.handler.detail :as detail]
            [gpml.seeder.main :as seeder]
            [gpml.service.permissions :as srv.permissions]
            [gpml.test-util :as test-util]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(defonce ^:private default-lang-iso-code "en")

(use-fixtures :each fixtures/with-test-system)

(def policy-data
  {:title "Policy Title"
   :original_title "Policy Original Title"
   :data_source "Testing Data Source"
   :country nil
   :abstract "Test Description"
   :record_number "342543DD"
   :type_of_law "Regulation"
   :implementing_mea nil
   :first_publication_date "2021-04-01"
   :latest_amendment_date "2021-04-01"
   :status "Repealed"
   :geo_coverage_type "global"
   :url "https://akvo.org"
   :attachments nil
   :remarks nil
   :review_status nil
   :document_preview false
   :language default-lang-iso-code})

(def technology-data
  {:name "technology Title"
   :development_stage "Scale up"
   :organisation_type "Established Company"
   :specifications_provided false
   :country nil
   :geo_coverage_type "global"
   :url "https://akvo.org"
   :attachments nil
   :remarks nil
   :email "john@akvo.org"
   :year_founded 2021
   :review_status nil
   :document_preview false
   :tags nil
   :language default-lang-iso-code})

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
   :tags nil
   :language default-lang-iso-code})

(deftest handler-put-test
  (let [system (ig/init fixtures/*system* [::detail/put])
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        handler (::detail/put system)
        admin-id (test-util/create-test-stakeholder config
                                                    "john.doe.admin@mail.invalid"
                                                    "APPROVED"
                                                    "ADMIN")]

    (testing "Check editing allowed only if user has the rights"
      (let [data (seeder/parse-data
                  (slurp (io/resource "examples/initiative-national.json"))
                  {:keywords? true
                   :add-default-lang? true})
            initiative (db.initiative/new-initiative conn data)
            _ (srv.permissions/create-resource-context {:conn conn
                                                        :logger (:logger config)}
                                                       {:context-type :initiative
                                                        :resource-id (:id initiative)})
            edited-data (merge data {:q2 "New Title"})
            resp (handler (-> (mock/request :put "/")
                              (assoc :parameters
                                     {:path {:topic-type "initiative" :topic-id (:id initiative)}
                                      :body edited-data}
                                     :user {:id 999})))
            _ (db.initiative/initiative-by-id conn initiative)]
        (is (= 403 (:status resp)))))

    (testing "Initiative editing"
      (let [country (db.country/new-country
                     conn
                     {:name "Indonesia"
                      :iso_code_a3 "IND"
                      :description "Member State"
                      :territory "IND"})
            data (-> (seeder/parse-data
                      (slurp (io/resource "examples/initiative-national.json"))
                      {:keywords? true
                       :add-default-lang? true})
                     (assoc :q24_2 [{(keyword (str (:id country))) "Indonesia"}]))
            initiative (db.initiative/new-initiative conn data)
            _ (srv.permissions/create-resource-context {:conn conn
                                                        :logger (:logger config)}
                                                       {:context-type :initiative
                                                        :resource-id (:id initiative)})
            edited-data (merge data {:q2 "New Title"})
            resp (handler (-> (mock/request :put "/")
                              (assoc :user {:id admin-id}
                                     :parameters
                                     {:path {:topic-type "initiative" :topic-id (:id initiative)}
                                      :body edited-data})))
            edited-initiative (db.initiative/initiative-by-id conn initiative)]
        (is (= 200 (:status resp)))
        (is (= (:q2 edited-data) (:q2 edited-initiative)))))

    (testing "Policy editing"
      (let [policy (db.policy/new-policy conn policy-data)
            _ (srv.permissions/create-resource-context {:conn conn
                                                        :logger (:logger config)}
                                                       {:context-type :policy
                                                        :resource-id (:id policy)})
            edited-data (merge policy-data {:title "New Policy Title"})
            resp (handler (-> (mock/request :put "/")
                              (assoc :user {:id admin-id}
                                     :parameters
                                     {:path {:topic-type "policy" :topic-id (:id policy)}
                                      :body edited-data})))
            edited-policy (db.policy/policy-by-id conn policy)]
        (is (= 200 (:status resp)))
        (is (= (:title edited-data) (:title edited-policy)))))

    (testing "Technology editing"
      (let [technology (db.technology/new-technology conn technology-data)
            _ (srv.permissions/create-resource-context {:conn conn
                                                        :logger (:logger config)}
                                                       {:context-type :technology
                                                        :resource-id (:id technology)})
            edited-data (merge technology-data {:name "New Technology Name"})
            resp (handler (-> (mock/request :put "/")
                              (assoc :user {:id admin-id}
                                     :parameters
                                     {:path {:topic-type "technology" :topic-id (:id technology)}
                                      :body edited-data})))
            edited-technology (db.technology/technology-by-id conn technology)]
        (is (= 200 (:status resp)))
        (is (= (:title edited-data) (:title edited-technology)))))

    (testing "Event editing"
      (let [event (db.event/new-event conn event-data)
            _ (srv.permissions/create-resource-context {:conn conn
                                                        :logger (:logger config)}
                                                       {:context-type :event
                                                        :resource-id (:id event)})
            edited-data (merge event-data {:title "New Event Title"})
            resp (handler (-> (mock/request :put "/")
                              (assoc :user {:id admin-id}
                                     :parameters
                                     {:path {:topic-type "event" :topic-id (:id event)}
                                      :body edited-data})))
            edited-event (db.event/event-by-id conn event)]
        (is (= 200 (:status resp)))
        (is (= (:title edited-data) (:title edited-event)))))

    (testing "Trying to edit a resource without the required permissions outputs unauthorized"
      (let [sth-id (test-util/create-test-stakeholder config
                                                      "john.doe@mail.invalid"
                                                      "APPROVED"
                                                      "USER")
            event (db.event/new-event conn event-data)
            _ (srv.permissions/create-resource-context {:conn conn
                                                        :logger (:logger config)}
                                                       {:context-type :event
                                                        :resource-id (:id event)})
            edited-data (merge event-data {:title "New Event Title"})
            resp (handler (-> (mock/request :put "/")
                              (assoc :user {:id sth-id}
                                     :parameters
                                     {:path {:topic-type "event" :topic-id (:id event)}
                                      :body edited-data})))]
        (is (= 403 (:status resp)))))

    (testing "User can edit resource with the right permissions"
      (let [sth-id (test-util/create-test-stakeholder config
                                                      "john.doe2@mail.invalid"
                                                      "APPROVED"
                                                      "USER")
            event (db.event/new-event conn event-data)
            _ (srv.permissions/create-resource-context {:conn conn
                                                        :logger (:logger config)}
                                                       {:context-type :event
                                                        :resource-id (:id event)})
            _ (srv.permissions/assign-roles-to-users {:conn conn
                                                      :logger (:logger config)}
                                                     [{:role-name :resource-owner
                                                       :context-type :event
                                                       :resource-id (:id event)
                                                       :user-id sth-id}])
            edited-data (merge event-data {:title "New Event Title"})
            resp (handler (-> (mock/request :put "/")
                              (assoc :user {:id sth-id}
                                     :parameters
                                     {:path {:topic-type "event" :topic-id (:id event)}
                                      :body edited-data})))
            edited-event (db.event/event-by-id conn event)]
        (is (= 200 (:status resp)))
        (is (= (:title edited-data) (:title edited-event)))))))

(deftest handler-get-test
  (let [system (ig/init fixtures/*system* [::detail/get])
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        handler (::detail/get system)
        data (seeder/parse-data
              (slurp (io/resource "examples/initiative-national.json"))
              {:keywords? true
               :add-default-lang? true})
        creator-id (test-util/create-test-stakeholder config
                                                      "john.doe@mail.invalid"
                                                      "APPROVED"
                                                      "USER")
        initiative (db.initiative/new-initiative conn (assoc data :created_by creator-id))
        _ (srv.permissions/create-resource-context {:conn conn
                                                    :logger (:logger config)}
                                                   {:context-type :initiative
                                                    :resource-id (:id initiative)})
        _ (srv.permissions/assign-roles-to-users {:conn conn
                                                  :logger (:logger config)}
                                                 [{:role-name :resource-owner
                                                   :context-type :initiative
                                                   :resource-id (:id initiative)
                                                   :user-id creator-id}])]

    (testing "Fetching detail of unapproved resource unauthenticated"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc :parameters
                                     {:path {:topic-type "initiative" :topic-id (:id initiative)}})))]
        (is (= 403 (:status resp)))))

    (testing "Fetching detail of unapproved resource as authenticated user"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc
                               :user {:id 999}
                               :parameters
                               {:path {:topic-type "initiative" :topic-id (:id initiative)}})))]
        (is (= 403 (:status resp)))))

    (testing "Fetching detail of unapproved resource as different ADMIN"
      (let [admin-id (test-util/create-test-stakeholder config
                                                        "john.doe.admin@mail.invalid"
                                                        "APPROVED"
                                                        "ADMIN")
            resp (handler (-> (mock/request :get "/")
                              (assoc
                               :user {:id admin-id}
                               :parameters
                               {:path {:topic-type "initiative" :topic-id (:id initiative)}
                                :query {:review-status "SUBMITTED"}})))]
        (is (= 200 (:status resp)))
        (is (= "Initiative Title." (-> resp :body :title)))))

    (testing "Fetching detail of unapproved resource as creator"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc
                               :user {:id creator-id}
                               :parameters
                               {:path {:topic-type "initiative" :topic-id (:id initiative)}
                                :query {:review-status "SUBMITTED"}})))]
        (is (= 200 (:status resp)))
        (is (= "Initiative Title." (-> resp :body :title)))))))

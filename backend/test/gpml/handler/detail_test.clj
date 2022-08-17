(ns gpml.handler.detail-test
  (:require [clojure.java.io :as io]
            [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.db.country :as db.country]
            [gpml.db.event :as db.event]
            [gpml.db.initiative :as db.initiative]
            [gpml.db.policy :as db.policy]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.technology :as db.technology]
            [gpml.fixtures :as fixtures]
            [gpml.handler.detail :as detail]
            [gpml.seeder.main :as seeder]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(defn- new-stakeholder [db email first_name last_name role review_status]
  (let [info {:picture "https://picsum.photos/200"
              :affiliation nil
              :country nil
              :representation ""
              :public_email false
              :public_database false
              :geo_coverage_type nil
              :title "Mr."
              :first_name first_name
              :last_name last_name
              :email email
              :idp_usernames ["auth0|123"]}
        sth (db.stakeholder/new-stakeholder db info)]
    (db.stakeholder/update-stakeholder-status db (assoc sth :review_status review_status))
    (db.stakeholder/update-stakeholder-role db (assoc sth :role role))
    sth))

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
   :image nil
   :language "en"})

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
   :image nil
   :logo nil
   :tags nil})

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
   :tags nil})

(deftest handler-put-test
  (let [system (ig/init fixtures/*system* [::detail/put])
        handler (::detail/put system)
        db (-> system :duct.database.sql/hikaricp :spec)
        admin {:id 0 :role "ADMIN"}]

    (testing "Check editing allowed only if user has the rights"
      (let [data (seeder/parse-data
                  (slurp (io/resource "examples/initiative-national.json"))
                  {:keywords? true})
            initiative (db.initiative/new-initiative db data)
            edited-data (merge data {:q2 "New Title"})
            resp (handler (-> (mock/request :put "/")
                              (assoc :jwt-claims {:email "john@org"}
                                     :parameters
                                     {:path {:topic-type "project" :topic-id (:id initiative)}
                                      :body edited-data})))
            _ (db.initiative/initiative-by-id db initiative)]
        (is (= 403 (:status resp)))))

    (testing "Initiative editing"
      (let [country (db.country/new-country
                     db {:name "Indonesia" :iso_code "IND" :description "Member State" :territory "IND"})
            data (-> (seeder/parse-data
                      (slurp (io/resource "examples/initiative-national.json"))
                      {:keywords? true})
                     (assoc :q24_2 [{(keyword (str (:id country))) "Indonesia"}]))
            initiative (db.initiative/new-initiative db data)
            edited-data (merge data {:q2 "New Title"})
            resp (handler (-> (mock/request :put "/")
                              (assoc :jwt-claims {:email "john@org"}
                                     :user admin
                                     :parameters
                                     {:path {:topic-type "project" :topic-id (:id initiative)}
                                      :body edited-data})))
            edited-initiative (db.initiative/initiative-by-id db initiative)]
        (is (= 200 (:status resp)))
        (is (= (:q2 edited-data) (:q2 edited-initiative)))))

    (testing "Policy editing"
      (let [policy (db.policy/new-policy db policy-data)
            edited-data (merge policy-data {:title "New Policy Title"})
            resp (handler (-> (mock/request :put "/")
                              (assoc :jwt-claims {:email "john@org"}
                                     :user admin
                                     :parameters
                                     {:path {:topic-type "policy" :topic-id (:id policy)}
                                      :body edited-data})))
            edited-policy (db.policy/policy-by-id db policy)]
        (is (= 200 (:status resp)))
        (is (= (:title edited-data) (:title edited-policy)))))

    (testing "Technology editing"
      (let [technology (db.technology/new-technology db technology-data)
            edited-data (merge technology-data {:name "New Technology Name"})
            resp (handler (-> (mock/request :put "/")
                              (assoc :jwt-claims {:email "john@org"}
                                     :user admin
                                     :parameters
                                     {:path {:topic-type "technology" :topic-id (:id technology)}
                                      :body edited-data})))
            edited-technology (db.technology/technology-by-id db technology)]
        (is (= 200 (:status resp)))
        (is (= (:title edited-data) (:title edited-technology)))))

    (testing "Event editing"
      (let [event (db.event/new-event db event-data)
            edited-data (merge event-data {:title "New Event Title"})
            resp (handler (-> (mock/request :put "/")
                              (assoc :jwt-claims {:email "john@org"}
                                     :user admin
                                     :parameters
                                     {:path {:topic-type "event" :topic-id (:id event)}
                                      :body edited-data})))
            edited-event (db.event/event-by-id db event)]
        (is (= 200 (:status resp)))
        (is (= (:title edited-data) (:title edited-event)))))))

(deftest handler-get-test
  (let [system (ig/init fixtures/*system* [::detail/get])
        handler (::detail/get system)
        db (-> system :duct.database.sql/hikaricp :spec)
        creator (new-stakeholder db "user-approved@org.com" "U" "A" "USER" "APPROVED")
        data (seeder/parse-data
              (slurp (io/resource "examples/initiative-national.json"))
              {:keywords? true})
        initiative (db.initiative/new-initiative db (assoc data :created_by (:id creator)))]

    (testing "Fetching detail of unapproved resource unauthenticated"
      (let [resp (handler (-> (mock/request :put "/")
                              (assoc :parameters
                                     {:path {:topic-type "project" :topic-id (:id initiative)}})))]
        (is (= 403 (:status resp)))))

    (testing "Fetching detail of unapproved resource as authenticated user"
      (let [resp (handler (-> (mock/request :put "/")
                              (assoc
                               :user {:id 0 :role "USER"}
                               :parameters
                               {:path {:topic-type "project" :topic-id (:id initiative)}})))]
        (is (= 403 (:status resp)))))

    (testing "Fetching detail of unapproved resource as different ADMIN"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc
                               :user {:id 0 :role "ADMIN"}
                               :parameters
                               {:path {:topic-type "project" :topic-id (:id initiative)}
                                :query {:review-status "SUBMITTED"}})))]
        (is (= 200 (:status resp)))
        (is (= "Initiative Title." (-> resp :body :title)))))

    (testing "Fetching detail of unapproved resource as creator"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc
                               :user creator
                               :parameters
                               {:path {:topic-type "project" :topic-id (:id initiative)}
                                :query {:review-status "SUBMITTED"}})))]
        (is (= 200 (:status resp)))
        (is (= "Initiative Title." (-> resp :body :title)))))))

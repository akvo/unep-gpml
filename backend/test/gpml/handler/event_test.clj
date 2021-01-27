(ns gpml.handler.event-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.fixtures :as fixtures]
            [gpml.db.event :as db.event]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.handler.event :as event]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(defn sample-data [db]
  (let [sth (db.stakeholder/new-stakeholder db
                                            {:picture "https://picsum.photos/200"
                                             :title "Mr."
                                             :first_name "First name"
                                             :last_name "Last name"
                                             :affiliation nil
                                             :email "admin@akvo.org"
                                             :linked_in nil
                                             :twitter nil
                                             :url nil
                                             :country nil
                                             :representation "test"
                                             :about "Lorem Ipsum"
                                             :geo_coverage_type nil})]
    (db.stakeholder/approve-stakeholder db {:id (-> sth first :id)})
    (db.stakeholder/update-stakeholder-role db {:id (-> sth first :id)
                                                :role "ADMIN"})
    (db.event/new-event db {:title "Title"
                            :start_date "2021-02-03T09:00:00Z"
                            :end_date "2021-02-03T10:00:00Z"
                            :description "desc"
                            :remarks "some remarks"
                            :country nil
                            :city nil
                            :image nil
                            :geo_coverage_type "global"})))

(defn- mock-post []
  (-> (mock/request :post "/")
      (assoc :admin {:id 1})
      (assoc :body-params {:id 1})))

(deftest approve-event
  (testing "Approving an event by an admin"
    (let [system (-> fixtures/*system*
                     (ig/init [::event/approve]))
          db (-> system :duct.database.sql/hikaricp :spec)
          handler (::event/approve system)
          _ (sample-data db)
          resp (handler (mock-post))]
      (is (= 200 (:status resp))))))

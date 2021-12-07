(ns gpml.handler.event-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.fixtures :as fixtures]
            [gpml.handler.image :as image]
            [gpml.handler.event :as event]
            [gpml.handler.profile-test :as profile-test]
            [gpml.db.tag :as db.tag]
            [gpml.db.language :as db.language]
            [gpml.db.event :as db.event]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.topic-stakeholder-auth :as db.ts-auth]
            [integrant.core :as ig]
            [ring.mock.request :as mock]
            [clojure.string :as s])
  (:import [java.time Instant]
           [java.sql Timestamp]))

(use-fixtures :each fixtures/with-test-system)

(defn time* []
  (java.sql.Timestamp. (.toEpochMilli (Instant/now))))

(defn new-event [data]
  {:title "title" :start_date (time*) :end_date (time*)
   :description "desc"
   :remarks ""
   :geo_coverage_type "global"
   :country (get-in data [:countries 0 :id])
   :city "string"
   :image "image" :url "url"})

(deftest handler-post-test
  (testing "New event is created"
    (let [system (ig/init fixtures/*system* [::event/post])
          handler (::event/post system)
          db (-> system :duct.database.sql/hikaricp :spec)
          data (profile-test/seed-important-database db)
          ;; create new user name John
          user (db.stakeholder/new-stakeholder db (profile-test/new-profile 1))
          payload (new-event (merge data {:owners [(:id user)]}))
          _ (db.stakeholder/update-stakeholder-status db (assoc user :review_status "APPROVED"))
          resp-one (handler (-> (mock/request :post "/")
                              (assoc :jwt-claims {:email "john@org"})
                              (assoc :body-params payload)))
          event-one (db.event/event-by-id db (:body resp-one))]
      (is (= 201 (:status resp-one)))
      (is (= (:url event-one) (:url payload))))))

(ns gpml.handler.comment-test
  (:require
   [clojure.test :refer [deftest is testing use-fixtures]]
   [gpml.db.comment :as db.comment]
   [gpml.db.stakeholder :as db.stakeholder]
   [gpml.fixtures :as fixtures]
   [gpml.handler.comment :as sut]
   [gpml.seeder.main :as seeder]
   [gpml.test-util :as test-util]
   [gpml.util :as util]
   [integrant.core :as ig]
   [java-time :as time]
   [java-time.pre-java8 :as time-pre-j8]
   [malli.core :as m]
   [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(defn- random-comment-data [author-id resource-id resource-type]
  {:author_id author-id
   :resource_id resource-id
   :resource_type resource-type
   :title "Dummy title"
   :content "Dummy content"})

(defn- make-profile [first-name last-name email]
  {:picture nil
   :cv nil
   :title "mr."
   :first_name first-name
   :last_name last-name
   :affiliation nil
   :email email
   :linked_in nil
   :twitter nil
   :url nil
   :country nil
   :representation "test"
   :about "Lorem Ipsum"
   :geo_coverage_type "global"
   :role "USER"
   :idp_usernames ["auth0|123"]})

(deftest create-comment-test
  (let [db (test-util/db-test-conn)
        system (-> fixtures/*system*
                   (ig/init [::sut/post]))
        handler (::sut/post system)
        profile (make-profile "John" "Doe" "mail@org.com")
        _ (seeder/seed db {:country? true :event? true})
        sth-id (:id (db.stakeholder/new-stakeholder db profile))]
    (testing "Happy path"
      (let [comment-payload (random-comment-data sth-id 1 "event")
            request (-> (mock/request :post "/")
                        (assoc :parameters {:body comment-payload}))
            {:keys [status body]} (handler request)]
        (is (= 200 status))
        (is (seq (:comment body)))
        (is (= (get-in body [:comment :author_id]) sth-id))))
    (testing "Fails validation due to missing required parameters"
      (let [comment-payload (dissoc (random-comment-data sth-id 1 "event") :author_id)]
        (is (not (m/validate sut/create-comment-params comment-payload)))
        (is (some #{::m/missing-key} (map :type (:errors (m/explain sut/create-comment-params comment-payload)))))))
    (testing "Fails validation due to invalid parameter schema"
      (let [comment-payload (assoc (random-comment-data sth-id 1 "event") :author_id "1")]
        (is (not (m/validate sut/create-comment-params comment-payload)))))))

(deftest get-comment-test
  (let [db (test-util/db-test-conn)
        system (-> fixtures/*system*
                   (ig/init [::sut/get]))
        handler (::sut/get system)
        profile (make-profile "John" "Doe" "mail@org.com")
        _ (seeder/seed db {:country? true :event? true})
        sth-id (:id (db.stakeholder/new-stakeholder db profile))]
    (db.comment/create-comment db (-> (assoc (random-comment-data sth-id 1 "event")
                                             :id (util/uuid)
                                             :updated-at (time-pre-j8/sql-timestamp (time/instant) "UTC"))
                                      (util/replace-in-keys #"_" "-")))
    (testing "Happy path"
      (let [request (-> (mock/request :gett "/")
                        (assoc :parameters {:query {:resource_id "1" :resource_type "event"}}))
            {:keys [status body]} (handler request)]
        (is (= 200 status))
        (is (seq (:comments body)))))
    (testing "Fails Validation due to missing required parameters"
      (let [parameters {:resource_type "event"}]
        (is (not (m/validate sut/get-resource-comments-params parameters)))
        (is (some #{::m/missing-key} (map :type (:errors (m/explain sut/get-resource-comments-params parameters)))))))
    (testing "Validation fails due to invalid parameter schema"
      (let [parameters {:resource_type "event" :resource_id :a}]
        (is (not (m/validate sut/get-resource-comments-params parameters)))))))

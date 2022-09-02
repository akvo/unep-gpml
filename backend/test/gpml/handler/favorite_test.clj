(ns gpml.handler.favorite-test
  (:require [clojure.test :refer [are deftest is testing use-fixtures]]
            [gpml.db.country :as db.country]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.fixtures :as fixtures]
            [gpml.handler.favorite :as favorite]
            [gpml.seeder.main :as seeder]
            [integrant.core :as ig]
            [malli.core :as malli]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(deftest test-post-body
  (testing "Checking post body params"
    (let [valid? #(malli/validate favorite/post-params %)]
      (are [expected value] (= expected (valid? value))
        true {:topic "technology" :topic_id 1 :association ["user"]}
        true {:topic "technology" :topic_id 1 :association ["user"]}
        false {:topic "technology" :topic_id 1 :association ["sponsor"]}
        false {}
        false {:topic "technology"}
        false {:topic "technology" :topic_id 1}
        false {:topic "technology" :topic_id 1 :association ["random"]}
        false {:topic "random" :topic_id 1 :association ["creator"]})))

  (testing "nil topic does not validate associations"
    (let [errors (-> (malli/explain favorite/post-params
                                    {:topic nil :topic_id 1 :association ["creator"]})
                     :errors)]
      (is (= 1 (count errors)))
      (is (= [:topic] (-> errors first :in))))))

(defn- new-stakeholder [db email]
  (let [country-id (-> (db.country/country-by-code db {:name "IDN"}) :id)
        sth (db.stakeholder/new-stakeholder db
                                            {:picture "https://picsum.photos/200"
                                             :cv nil
                                             :title "Mr."
                                             :first_name "First name"
                                             :last_name "Last name"
                                             :affiliation nil
                                             :email email
                                             :linked_in nil
                                             :twitter nil
                                             :url nil
                                             :country country-id
                                             :representation "test"
                                             :about "Lorem Ipsum"
                                             :geo_coverage_type nil
                                             :role "USER"
                                             :idp_usernames ["auth0|123"]})]
    (db.stakeholder/update-stakeholder-status db (assoc sth :review_status "APPROVED"))
    sth))

(defn- mock-post [sth-id]
  (-> (mock/request :post "/")
      (assoc :user {:id sth-id})
      (assoc :body-params {:topic_id 1
                           :topic "technology"
                           :association ["user" "interested in"]})))

(deftest test-post-new-association
  (testing "Creating new association via POST"
    (let [system (-> fixtures/*system*
                     (ig/init [::favorite/post]))
          db (-> system :duct.database.sql/hikaricp :spec)
          handler (::favorite/post system)
          _ (seeder/seed db {:country? true
                             :technology? true})
          sth-id (:id (new-stakeholder db "email@un.org"))
          resp (handler (mock-post sth-id))]
      (is (= 200 (:status resp))))))

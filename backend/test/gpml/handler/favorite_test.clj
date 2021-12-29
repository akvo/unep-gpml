(ns gpml.handler.favorite-test
  (:require [clojure.test :refer [deftest testing are is use-fixtures]]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.fixtures :as fixtures]
            [gpml.handler.favorite :as favorite]
            [gpml.seeder.main :as seeder]
            [gpml.db.country :as db.country]
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
    (db.stakeholder/update-stakeholder-status db (assoc sth :review_status "APPROVED"))))

(defn- mock-post [email]
  (-> (mock/request :post "/")
      (assoc :jwt-claims {:email email})
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
          _ (new-stakeholder db "email@un.org")
          resp (handler (mock-post "email@un.org"))]
      (is (= 200 (:status resp))))))

(ns gpml.handler.profile-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.fixtures :as fixtures]
            [gpml.handler.profile :as profile]
            [gpml.db.country :as db.country]
            [gpml.db.stakeholder :as db.stakeholder]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(defn new-profile [country]
  {:email "mail@org"
   :first_name "first_name"
   :last_name "first_name"
   :linkedin "johndoe"
   :twitter "johndoe"
   :url "https://akvo.org"
   :representation "test"
   :affiliation nil
   :title "mr."
   :summary "Lorem Ipsum"
   :country country
   :picture "https://akvo.org"
   :geo_coverage_type nil})

(defn get-country [conn country-name]
  (:id (db.country/country-by-name conn {:name country-name})))

(deftest handler-post-test
  (testing "New profile is created"
    (let [system (ig/init fixtures/*system* [::profile/post])
          handler (::profile/post system)
          db (-> system :duct.database.sql/hikaricp :spec)
          _ (db.country/new-country db {:name "Indonesia" :iso_code "IND"})
          resp (handler (-> (mock/request :post "/")
                        (assoc :jwt-claims {:email "mail@org",:picture "test.jpg"})
                        (assoc :body-params (new-profile "Indonesia"))))]
      (is (= 201 (:status resp))))))

(deftest handler-get-test
  (testing "Profile endpoint returns non empty response"
    (let [system (ig/init fixtures/*system* [::profile/get])
          handler (::profile/get system)
          db (-> system :duct.database.sql/hikaricp :spec)
          _ (db.country/new-country db {:name "Indonesia" :iso_code "IND"})
          _ (db.stakeholder/new-stakeholder db  (new-profile (get-country db "Indonesia")))
          resp (handler (-> (mock/request :get "/")
                        (assoc :jwt-claims {:email "mail@org"})))]
      (is (= 200 (:status resp)))
      (is (not-empty (:body resp))))))

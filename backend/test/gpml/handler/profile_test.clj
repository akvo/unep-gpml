(ns gpml.handler.profile-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.fixtures :as fixtures]
            [gpml.handler.profile :as profile]
            [gpml.db.country :as db.country]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.organisation :as db.organisation]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(defn get-country [conn country-code]
  (:id (db.country/country-by-code conn {:name country-code})))

(defn get-organisation [conn org-name]
  (:id (db.organisation/organisation-by-name conn {:name org-name})))

(defn new-profile [country org]
  {:email "john@org"
   :first_name "John"
   :last_name "Doe"
   :linked_in "johndoe"
   :twitter "johndoe"
   :url "https://akvo.org"
   :representation "test"
   :affiliation org
   :title "Mr."
   :about "Lorem Ipsum"
   :country country
   :picture "https://akvo.org"
   :geo_coverage_type nil})

(defn org-params [org-name org-url] {:name org-name :url org-url})

(defn new-admin [country org]
  (assoc (new-profile country org) :email "jane@org" :first_name "Jane"))

(defn get-user [conn email]
  (:id (db.stakeholder/stakeholder-by-email conn {:email email})))

(deftest handler-post-test
  (testing "New profile is created"
    (let [system (ig/init fixtures/*system* [::profile/post])
          handler (::profile/post system)
          db (-> system :duct.database.sql/hikaricp :spec)
          _ (db.country/new-country db {:name "Indonesia" :iso_code "IND"})
          resp (handler (-> (mock/request :post "/")
                        (assoc :jwt-claims {:email "john@org" :picture "test.jpg"})
                        (assoc :body-params
                               (assoc (new-profile "IND" nil)
                                      :org {:name "Akvo" :url "https://www.akvo.org"}))))]
      (is (= 201 (:status resp))))))

(deftest handler-get-test-has-profile
  (testing "Profile endpoint returns non empty response"
    (let [system (ig/init fixtures/*system* [::profile/get])
          handler (::profile/get system)
          db (-> system :duct.database.sql/hikaricp :spec)
          org (db.organisation/new-organisation db {:name "Akvo"})
          country (db.country/new-country db {:name "Indonesia" :iso_code "IND"})
          _ (db.stakeholder/new-stakeholder db  (new-profile (:id country) (:id org)))
          resp (handler (-> (mock/request :get "/")
                        (assoc :jwt-claims {:email "john@org"})))]
      (is (= 200 (:status resp)))
      (is (not-empty (:body resp))))))

(deftest handler-get-test-no-profile
  (testing "Profile endpoint returns empty response"
    (let [system (ig/init fixtures/*system* [::profile/get])
          handler (::profile/get system)
          resp (handler (-> (mock/request :get "/")
                        (assoc :jwt-claims {:email "john@org"})))]
      (is (= 200 (:status resp)))
      (is (empty (:body resp))))))

#_(deftest handler-approval-test
  (testing "Profile is approved by admin"
    (let [system (ig/init fixtures/*system* [::profile/approve])
          handler (::profile/approve system)
          db (-> system :duct.database.sql/hikaricp :spec)
          _ (db.country/new-country db {:name "Indonesia" :iso_code "IND"})
          admin (db.stakeholder/new-stakeholder db (new-admin (get-country db "IND")))
          _ (db.stakeholder/new-stakeholder db (new-profile (get-country db "IND")))
          _ (db.stakeholder/stakeholder-set-role db {:role "ADMIN" :id (:id (first admin))})
          resp (handler (-> (mock/request :put "/")
                            (assoc :jwt-claims {:email "jane@org"})
                            (assoc :body-params {:id (get-user db "john@org")})))]
      (is (= 200 (:status resp)))
      (is (not-empty (:body resp))))))

(comment
  (require 'dev)
  (def db (dev/db-conn))
  (def admin (db.stakeholder/stakeholder-by-email db {:email "jane@org"}))
  (def john (db.stakeholder/stakeholder-by-email db {:email "john@org"}))
  admin
  john
  (db.stakeholder/stakeholder-set-role db {:role "USER" :id (:id john)})
  ,)

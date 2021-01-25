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

(def ^:private picture "data:image/png;base64,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")

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
   :picture "picture"
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
          ;; create new country
          _ (db.country/new-country db {:name "Indonesia" :iso_code "IND"})
          ;; John trying to sign up with new organisation
          resp (handler (-> (mock/request :post "/")
                        (assoc :jwt-claims {:email "john@org" :picture "test.jpg"})
                        (assoc :body-params
                               (assoc (new-profile "IND" nil)
                                      :org {:name "Akvo" :url "https://www.akvo.org"}
                                      :photo picture))))]
      (is (= 201 (:status resp)))
      (is (= "John" (->(:body resp) :first_name)))
      (is (= "Doe" (->(:body resp) :last_name)))
      (is (= {:country "IND"
              :first_name "John"
              :last_name "Doe"
              :email "john@org"
              :picture "/image/profile/1"
              :twitter "johndoe"
              :linked_in "johndoe"
              :org_name "Akvo"
              :org_url "https://www.akvo.org"
              :representation "test"
              :approved_at nil
              } (:body resp)))
      (is ('clojure.string/includes? "/image/profile" (->(:body resp) :picture))))))

(deftest handler-get-test-has-profile
  (testing "Profile endpoint returns non empty response"
    (let [system (ig/init fixtures/*system* [::profile/get])
          handler (::profile/get system)
          db (-> system :duct.database.sql/hikaricp :spec)
          ;; create new organisation
          org (db.organisation/new-organisation db {:name "Akvo"})
          ;; create new country
          _ (db.country/new-country db {:name "Netherland" :iso_code "NDL"})
          country (db.country/new-country db {:name "Indonesia" :iso_code "IND"})
          ;; create new stakeholder name John
          _ (db.stakeholder/new-stakeholder db  (new-profile (:id (first country)) (:id (first org))))
          ;; dashboard check if this guy has profile
          resp (handler (-> (mock/request :get "/")
                        (assoc :jwt-claims {:email "john@org"})))]
      (is (= 200 (:status resp)))
      (is (= "John" (-> (:body resp) :first_name)))
      (is (= "Doe" (-> (:body resp) :last_name)))
      (is (= (:id (first org)) (-> (:body resp) :affiliation)))
      (is (= (:id (first country)) (-> (:body resp) :country))))))

(deftest handler-get-test-no-profile
  (testing "Profile endpoint returns empty response"
    (let [system (ig/init fixtures/*system* [::profile/get])
          handler (::profile/get system)
          ;; dashboard check if this guy has profile
          resp (handler (-> (mock/request :get "/")
                        (assoc :jwt-claims {:email "john@org"})))]
      (is (= 200 (:status resp)))
      (is (empty (:body resp))))))

(deftest handler-approval-test
  (testing "Profile is approved by admin"
    (let [system (ig/init fixtures/*system* [::profile/approve])
          handler (::profile/approve system)
          db (-> system :duct.database.sql/hikaricp :spec)
          ;; create new organisation
          org (db.organisation/new-organisation db {:name "Akvo"})
          ;; create new country
          country (db.country/new-country db {:name "Indonesia" :iso_code "IND"})
          ;; create new user name Jane
          admin (new-profile (:id (first country)) (:id (first org)))
          admin (db.stakeholder/new-stakeholder db  (assoc admin :email "jane@org" :first_name "Jane"))
          ;; create new user name John
          _ (db.stakeholder/new-stakeholder db  (new-profile (:id (first country)) (:id (first org))))
          ;; Jane become an admin
          _ (db.stakeholder/update-stakeholder-role db (assoc (first admin) :role "ADMIN"))
          ;; Jane trying to approve this guy John
          resp (handler (-> (mock/request :put "/")
                            (assoc :jwt-claims {:email "jane@org"})
                            (assoc :body-params {:id (get-user db "john@org")})))]
      (is (= 204 (:status resp)))
      (is (= "John" (-> resp :body :data :first_name)))
      (is (inst? (-> resp :body :data :approved_at))))))

(deftest handler-rejected-approval-test
  (testing "Profile cannot approved by random admin"
    (let [system (ig/init fixtures/*system* [::profile/approve])
          handler (::profile/approve system)
          db (-> system :duct.database.sql/hikaricp :spec)
          ;; create new organisation
          org (db.organisation/new-organisation db {:name "Akvo"})
          ;; create new country
          country (db.country/new-country db {:name "Indonesia" :iso_code "IND"})
          ;; create new user name Jane
          admin (new-profile (:id (first country)) (:id (first org)))
          _ (db.stakeholder/new-stakeholder db  (assoc admin :email "jane@org" :first_name "Jane"))
          ;; create new user name John
          _ (db.stakeholder/new-stakeholder db  (new-profile (:id (first country)) (:id (first org))))
          ;; Jane trying to approve this guy John
          resp (handler (-> (mock/request :put "/")
                            (assoc :jwt-claims {:email "jane@org"})
                            (assoc :body-params {:id (get-user db "john@org")})))]
      (is (= 401 (:status resp)))
      (is (= "Unauthorized" (-> resp :body :message))))))

(comment
    #_(def dbtest (dev/db-conn))
    #_(db.stakeholder/update-stakeholder-role dbtest {:id 1 :role "ADMIN"})
  ,)

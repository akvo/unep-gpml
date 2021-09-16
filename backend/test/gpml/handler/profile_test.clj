(ns gpml.handler.profile-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.db.country :as db.country]
            [gpml.test-util :refer [picture]]
            [gpml.db.tag :as db.tag]
            [gpml.db.country-group :as db.country-group]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.fixtures :as fixtures]
            [gpml.handler.stakeholder :as stakeholder]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(defn get-country [conn country-code]
  (:id (db.country/country-by-code conn {:name country-code})))

(defn get-organisation [conn org-name]
  (:id (db.organisation/organisation-by-name conn {:name org-name})))

(defn new-profile [org]
  {:email "john@org"
   :first_name "John"
   :last_name "Doe"
   :linked_in "johndoe"
   :twitter "johndoe"
   :representation ""
   :org {:id org}
   :affiliation org
   :title "Mr"
   :about "Lorem Ipsum"
   :picture picture
   :country 1
   :public_email false
   :public_database false
   :cv picture})

(defn get-user [conn email]
  (:id (db.stakeholder/stakeholder-by-email conn {:email email})))

(defn seed-important-database [db]
    (let [tag-category (db.tag/new-tag-category db {:category "general"})]
      {:tags (db.tag/new-tags db {:tags (map #(vector % (:id tag-category)) ["Tag 1" "Tag 2" "Tag 3"])})
       :org (db.organisation/new-organisation
              db {:id 1
                  :name "Akvo"
                  :url "https://akvo.org"
                  :geo_coverage_type "regional"
                  :type "Academia and Research"
                  :program "Test Program"
                  :contribution "Test Contribution"
                  :expertise "Test Expertise"
                  :review_status "APPROVED"})
       :countries [(db.country/new-country
                     db {:name "Indonesia" :iso_code "IND" :description "Member State" :territory "IND"})
                   (db.country/new-country
                     db {:name "Spain" :iso_code "SPA" :description "Member State" :territory "SPA"})
                   (db.country/new-country
                     db {:name "Canary Island" :iso_code "SPA" :description "territory" :territory "SPA"})]
       :country_groups (mapv (fn [x] (db.country-group/new-country-group
                                       db {:type "region" :name x})) ["Asia" "Africa" "Europe"])}))

(deftest handler-post-with-existing-organisation-test
  (testing "New profile is created with existing organisation"
    (let [system (ig/init fixtures/*system* [::stakeholder/post])
          handler (::stakeholder/post system)
          db (-> system :duct.database.sql/hikaricp :spec)
          data (seed-important-database db)
          ;; John trying to sign up with new organisation
          body-params (assoc (new-profile 1)
                             :org (:org data)
                             :country (-> (:countries data) first :id)
                             :photo picture)
          resp (handler (-> (mock/request :post "/")
                            (assoc :jwt-claims {:email "john@org" :picture "test.jpg"})
                            (assoc :body-params body-params)))]
      (is (= 201 (:status resp)))
      (is (= "John" (->(:body resp) :first_name)))
      (is (= "Doe" (->(:body resp) :last_name)))
      (is (= "SUBMITTED" (->(:body resp) :review_status)))
      (is (= {:id 10001
              :email "john@org"
              :about "Lorem Ipsum"
              :country 1
              :first_name "John"
              :last_name "Doe"
              :linked_in "johndoe"
              :photo "/image/profile/1"
              :cv "/cv/profile/1"
              :representation ""
              :title "Mr"
              :role "USER"
              :org (db.organisation/organisation-by-id db {:id 1})
              :twitter "johndoe"
              :company_name nil
              :reviewed_at nil
              :reviewed_by nil
              :review_status "SUBMITTED"
              :public_email false
              :public_database false}
             (:body resp)))
      (is (= "/image/profile/1" (-> resp :body :photo))))))

(deftest handler-post-with-new-organisation-test
  (testing "New profile is created with new organisation"
    (let [system (ig/init fixtures/*system* [::stakeholder/post])
          handler (::stakeholder/post system)
          db (-> system :duct.database.sql/hikaricp :spec)
          data (seed-important-database db)
          ;; John trying to sign up with new organisation
          body-params (assoc (new-profile 1)
                             :org {:name "My own company"
                                   :geo_coverage_type "regional"
                                   :country (-> (:countries data) second :id)
                                   :geo_coverage_value (mapv :id (:country_groups data))
                                   :type "Company"
                                   :url "mycompany.org"}
                             :country (-> (:countries data) first :id)
                             :photo picture)
          resp (handler (-> (mock/request :post "/")
                            (assoc :jwt-claims {:email "john@org" :picture "test.jpg"})
                            (assoc :body-params body-params)))]
      (is (= 201 (:status resp)))
      (is (= "John" (->(:body resp) :first_name)))
      (is (= "Doe" (->(:body resp) :last_name)))
      (is (= "SUBMITTED" (->(:body resp) :review_status)))
      (is (= {:id 10001
              :email "john@org"
              :about "Lorem Ipsum"
              :country 1
              :first_name "John"
              :last_name "Doe"
              :linked_in "johndoe"
              :photo "/image/profile/1"
              :cv "/cv/profile/1"
              :representation ""
              :title "Mr"
              :role "USER"
              :org (db.organisation/organisation-by-id db {:id 10001})
              :twitter "johndoe"
              :reviewed_at nil
              :company_name nil
              :reviewed_by nil
              :review_status "SUBMITTED"
              :public_email false
              :public_database false}
             (:body resp)))
      (is (= "/image/profile/1" (-> resp :body :photo))))))

(deftest handler-post-test-as-citizen
  (testing "New profile without organisation and some other non-required detail is created"
    (let [system (ig/init fixtures/*system* [::stakeholder/post])
          handler (::stakeholder/post system)
          db (-> system :duct.database.sql/hikaricp :spec)
          data (seed-important-database db)
          body-params (assoc (new-profile 1)
                             :org nil
                             :country (-> (:countries data) first :id))
          ;; John trying to sign up without any organisation and leave photo, twitter, and linkedin blank
          resp (handler (-> (mock/request :post "/")
                            (assoc :jwt-claims {:email "john@org"})
                            (assoc :body-params (dissoc body-params :twitter :linkedin :photo))))]
      (is (= 201 (:status resp)))
      (is (= "John" (->(:body resp) :first_name)))
      (is (= "Doe" (->(:body resp) :last_name)))
      (is (= "SUBMITTED" (->(:body resp) :review_status)))
      (testing "New incomplete profile is created"
        (is (= nil (->(:body resp) :photo)))
        (is (= nil (->(:body resp) :linkedin)))
        (is (= nil (->(:body resp) :photo)))
        (is (= nil (->(:body resp) :org)))))))

(deftest handler-put-test
  (testing "Update profile once its signed up")
    (let [system (ig/init fixtures/*system* [::stakeholder/put])
          handler (::stakeholder/put system)
          db (-> system :duct.database.sql/hikaricp :spec)
          data (seed-important-database db)
          ;; John created account with country value Spain and organisation Akvo
          _ (db.stakeholder/new-stakeholder-cv db {:cv picture})
          _ (db.stakeholder/new-stakeholder-image db {:picture picture})
          _ (db.stakeholder/new-stakeholder db  (assoc (new-profile 1)
                                                       :picture "/image/profile/1"
                                                       :affiliation (-> data :org :id)
                                                       :cv "/cv/profile/1"))
          ;; John trying to edit their profile with newly organisation
          ;; Also john want to change his cv and profile picture
          resp (handler (-> (mock/request :put "/")
                            (assoc :jwt-claims {:email "john@org"})
                            (assoc :body-params
                                     (assoc (new-profile nil)
                                             :id 10001
                                             :about "Dolor sit Amet"
                                             :country (-> (:countries data) second :id)
                                             :first_name "Mark"
                                             :org {:id 1 :name "Akvo" :url "https://akvo.org"}
                                             :photo picture
                                             :cv picture
                                             :picture nil
                                             :public_email true))))
          profile (db.stakeholder/stakeholder-by-id db {:id 10001})
          old-images (db.stakeholder/stakeholder-image-by-id db {:id 10001})
          old-cv (db.stakeholder/stakeholder-cv-by-id db {:id 10001})]
      ;; Old images should be deleted
      (is (= nil old-images))
      ;; Old cv sould be deleted
      (is (= nil old-cv))
      (is (= 204 (:status resp)))
      (is (= {:id 10001,
              :email "john@org"
              :title "Mr"
              :first_name "Mark"
              :last_name "Doe"
              :country (-> (:countries data) second :id)
              :linked_in "johndoe"
              :twitter "johndoe"
              :photo "/image/profile/2"
              :cv "/cv/profile/2"
              :representation ""
              :role "USER"
              :about "Dolor sit Amet"
              :affiliation 1
              :reviewed_at nil
              :company_name nil
              :reviewed_by nil
              :review_status "SUBMITTED"
              :public_email true
              :public_database false}
             profile))))

(deftest handler-put-test-but-the-pic-is-from-outside
  (testing "Update profile once its signed up")
    (let [system (ig/init fixtures/*system* [::stakeholder/put])
          handler (::stakeholder/put system)
          db (-> system :duct.database.sql/hikaricp :spec)
          data (seed-important-database db)
          ;; John created account with country value Indonesia and organisation Akvo
          _ (db.stakeholder/new-stakeholder db  (assoc (new-profile 1)
                                                       :picture "https://lh3.googleusercontent.com"
                                                       :cv nil))
          ;; John trying to edit their profile
          resp (handler (-> (mock/request :put "/")
                            (assoc :jwt-claims {:email "john@org"})
                            (assoc :body-params
                                     (assoc (new-profile 1)
                                             :id 10001
                                             :about "Dolor sit Amet"
                                             :country (-> (:countries data) second :id)
                                             :first_name "Mark"
                                             :org {:id 1 :name "Akvo" :url "https://akvo.org"}
                                             :photo "https://lh3.googleusercontent.com"
                                             :cv nil
                                             :picture nil))))
          profile (db.stakeholder/stakeholder-by-id db {:id 10001})
          old-images (db.stakeholder/stakeholder-image-by-id db {:id 1})]
      (is (= nil old-images))
      (is (= 204 (:status resp)))
      (is (= {:id 10001,
              :email "john@org"
              :title "Mr"
              :first_name "Mark"
              :last_name "Doe"
              :country (-> (:countries data) second :id)
              :linked_in "johndoe"
              :twitter "johndoe"
              :photo "https://lh3.googleusercontent.com"
              :representation ""
              :role "USER"
              :about "Dolor sit Amet"
              :affiliation 1
              :company_name nil
              :reviewed_at nil
              :reviewed_by nil
              :cv nil
              :review_status "SUBMITTED"
              :public_email false
              :public_database false}
             profile))))

(deftest handler-get-test-has-profile
  (testing "Profile endpoint returns non empty response"
    (let [system (ig/init fixtures/*system* [::stakeholder/profile])
          handler (::stakeholder/profile system)
          db (-> system :duct.database.sql/hikaricp :spec)
          _ (seed-important-database db)
          tags (->> (db.tag/all-tags db)
                    (take 2)
                    (map :id))
          _ (db.stakeholder/new-stakeholder db (new-profile 1))
          _ (db.stakeholder/add-stakeholder-tags db {:tags (map #(vector 10001 %) tags)})
          geo (db.stakeholder/add-stakeholder-geo db {:geo [[10001 nil 1] [10001 nil 2]]})
          ;; dashboard check if this guy has profile
          req (handler (-> (mock/request :get "/")
                           (assoc :jwt-claims {:email "john@org"})))
          resp (:body req)]
      (is (= geo [{:id 1 :country 1 :country_group nil :stakeholder 10001}
                  {:id 2 :country 2 :country_group nil :stakeholder 10001}]))
      (is (= 200 (:status req)))
      (is (= "John" (-> resp :first_name)))
      (is (= "Doe" (-> resp :last_name)))
      (is (= "SUBMITTED" (-> resp :review_status)))
      (is (= (db.organisation/organisation-by-id db {:id 1}) (-> resp :org)))
      (is (= tags (-> resp :tags)))
      (is (= 1 (-> resp :country))))))

(deftest handler-get-test-no-profile
  (testing "Profile endpoint returns empty response"
    (let [system (ig/init fixtures/*system* [::stakeholder/profile])
          handler (::stakeholder/profile system)
          ;; dashboard check if this guy has profile
          resp (handler (-> (mock/request :get "/")
                            (assoc :jwt-claims {:email "john@org"})))]
      (is (= 200 (:status resp)))
      (is (empty (:body resp))))))

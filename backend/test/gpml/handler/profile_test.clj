(ns gpml.handler.profile-test
  (:require
   [clojure.test :refer [deftest is testing use-fixtures]]
   [gpml.db.country :as db.country]
   [gpml.db.country-group :as db.country-group]
   [gpml.db.organisation :as db.organisation]
   [gpml.db.resource.tag :as db.resource.tag]
   [gpml.db.stakeholder :as db.stakeholder]
   [gpml.db.tag :as db.tag]
   [gpml.fixtures :as fixtures]
   [gpml.handler.stakeholder :as stakeholder]
   [gpml.util.sql :as sql-util]
   [integrant.core :as ig]
   [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(def ^:private picture "data:image/png;base64,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")

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
   :org {:id org}
   :affiliation org
   :job_title "Developer"
   :title "Mr"
   :about "Lorem Ipsum"
   :picture picture
   :country 1
   :public_email false
   :public_database false
   :cv picture
   :idp_usernames ["auth0|123"]})

(defn get-user [conn email]
  (:id (db.stakeholder/stakeholder-by-email conn {:email email})))

(defn seed-important-database [db]
  (let [tag-category (db.tag/new-tag-category db {:category "general"})
        tags [{:tag "Tag 1"
               :tag_category (:id tag-category)}
              {:tag "Tag 2"
               :tag_category (:id tag-category)}
              {:tag "Tag 3"
               :tag_category (:id tag-category)}]
        tag-entity-columns (sql-util/get-insert-columns-from-entity-col tags)]
    {:tags (db.tag/new-tags db {:tags (sql-util/entity-col->persistence-entity-col tags)
                                :insert-cols tag-entity-columns})
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
                            (assoc :jwt-claims {:email "john@org" :picture "test.jpg" :sub "auth0|123"})
                            (assoc :body-params body-params)))]
      (is (= 201 (:status resp)))
      (is (= "John" (-> (:body resp) :first_name)))
      (is (= "Doe" (-> (:body resp) :last_name)))
      (is (= "SUBMITTED" (-> (:body resp) :review_status)))
      (is (= {:id 10001
              :email "john@org"
              :about "Lorem Ipsum"
              :country 1
              :first_name "John"
              :last_name "Doe"
              :linked_in "johndoe"
              :photo "/image/profile/1"
              :cv "/cv/profile/1"
              :title "Mr"
              :job_title "Developer"
              :role "USER"
              :org (db.organisation/organisation-by-id db {:id 1})
              :twitter "johndoe"
              :reviewed_at nil
              :reviewed_by nil
              :review_status "SUBMITTED"
              :public_email false
              :public_database false
              :idp_usernames ["auth0|123"]}
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
                            (assoc :jwt-claims {:email "john@org" :picture "test.jpg" :sub "auth0|123"})
                            (assoc :body-params body-params)))]
      (is (= 201 (:status resp)))
      (is (= "John" (-> (:body resp) :first_name)))
      (is (= "Doe" (-> (:body resp) :last_name)))
      (is (= "SUBMITTED" (-> (:body resp) :review_status)))
      (is (= {:id 10001
              :email "john@org"
              :about "Lorem Ipsum"
              :country 1
              :first_name "John"
              :last_name "Doe"
              :linked_in "johndoe"
              :photo "/image/profile/1"
              :cv "/cv/profile/1"
              :title "Mr"
              :job_title "Developer"
              :role "USER"
              :org (db.organisation/organisation-by-id db {:id 10001})
              :twitter "johndoe"
              :reviewed_at nil
              :reviewed_by nil
              :review_status "SUBMITTED"
              :public_email false
              :public_database false
              :idp_usernames ["auth0|123"]}
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
      (is (= "John" (-> (:body resp) :first_name)))
      (is (= "Doe" (-> (:body resp) :last_name)))
      (is (= "SUBMITTED" (-> (:body resp) :review_status)))
      (testing "New incomplete profile is created"
        (is (= nil (-> (:body resp) :linkedin)))
        (is (= nil (-> (:body resp) :org)))))))

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
                                        :job_title "Developer"
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
            :role "USER"
            :job_title "Developer"
            :about "Dolor sit Amet"
            :affiliation 1
            :reviewed_at nil
            :reviewed_by nil
            :review_status "SUBMITTED"
            :public_email true
            :public_database false
            :idp_usernames ["auth0|123"]}
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
                                        :job_title "Developer"
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
            :role "USER"
            :job_title "Developer"
            :about "Dolor sit Amet"
            :affiliation 1
            :reviewed_at nil
            :reviewed_by nil
            :cv nil
            :review_status "SUBMITTED"
            :public_email false
            :public_database false
            :idp_usernames ["auth0|123"]}
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
          sth-id (:id (db.stakeholder/new-stakeholder db (new-profile 1)))
          _ (db.resource.tag/create-resource-tags db {:table "stakeholder_tag"
                                                      :resource-col "stakeholder"
                                                      :tags (map #(vector 10001 % "seeking") tags)})
          created-resource-tags (db.resource.tag/get-resource-tags db {:table "stakeholder_tag"
                                                                       :resource-col "stakeholder"
                                                                       :resource-id sth-id})
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
      (is (= created-resource-tags (-> resp :tags)))
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

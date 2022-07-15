(ns gpml.handler.policy-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.db.language :as db.language]
            [gpml.db.policy :as db.policy]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.tag :as db.tag]
            [gpml.fixtures :as fixtures]
            [gpml.handler.policy :as policy]
            [gpml.handler.profile-test :as profile-test]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(defn new-policy [data]
  {:title "Policy Title"
   :original_title "Policy Original Title"
   :abstract "Test Description"
   :data_source "Testing Data Source"
   :record_number "342543DD"
   :implementing_mea 1
   :type_of_law "Regulation"
   :status "Repealed"
   :first_publication_date "2021-04-01"
   :latest_amendment_date "2021-04-01"
   :geo_coverage_type "regional"
   :geo_coverage_value (mapv :id (:country_groups data))
   :url "https://akvo.org"
   :attachments nil
   :remarks nil
   :document_preview false
   :country (-> (:countries data) first :id)
   :tags (:tags data)})

(deftest handler-post-test
  (testing "New policy is created"
    (let [system (ig/init fixtures/*system* [::policy/post])
          handler (::policy/post system)
          db (-> system :duct.database.sql/hikaricp :spec)
          ;; create new country [IDN SPA]
          ;; create new country group [Africa Asia Europe]
          ;; create new organisation [Akvo]
          ;; create new general 3 tags
          data (profile-test/seed-important-database db)
          ;; create new policy category tag
          _ (do (db.tag/new-tag-category db {:category "financing mechanism"})
                (db.tag/new-tag db {:tag "RT 1" :tag_category 2})
                (db.tag/new-tag db {:tag "RT 2" :tag_category 2}))
          ;; create new language
          _ (db.language/new-language db {:iso_code "id"
                                          :english_name "Indonesian"
                                          :native_name "Bahasa Indonesia"})
          ;; create new user name John
          user (db.stakeholder/new-stakeholder db (profile-test/new-profile 1))
          _ (db.stakeholder/update-stakeholder-status db (assoc user :review_status "APPROVED"))
          ;; create John create new policy with available organisation
          resp-one (handler (-> (mock/request :post "/")
                                (assoc :jwt-claims {:email "john@org"})
                                (assoc :body-params (new-policy data))))
          ;; create John create new policy with new organisation
          resp-two (handler (-> (mock/request :post "/")
                                (assoc :jwt-claims {:email "john@org"})
                                (assoc :body-params (assoc (new-policy data) :org
                                                           {:id -1
                                                            :name "New Era"
                                                            :geo_coverage_type "regional"
                                                            :geo_coverage_value (mapv :id (:country_groups data))
                                                            :country (-> (:countries data) second :id)}))))
          policy-one (db.policy/policy-by-id db (:body resp-one))
          policy-two (db.policy/policy-by-id db (:body resp-two))]
      (is (= 201 (:status resp-one)))
      (is (= (assoc (new-policy data)
                    :id 10001
                    :image nil
                    :tags (map #(:id %) (:tags data))
                    :created_by 10001) policy-one))
      (is (= (assoc (new-policy data)
                    :id 10002
                    :image nil
                    :tags (map #(:id %) (:tags data))
                    :created_by 10001) policy-two)))))

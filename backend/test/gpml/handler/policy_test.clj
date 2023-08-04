(ns gpml.handler.policy-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.db.language :as db.language]
            [gpml.db.policy :as db.policy]
            [gpml.db.tag :as db.tag]
            [gpml.domain.types :as dom.types]
            [gpml.fixtures :as fixtures]
            [gpml.handler.policy :as policy]
            [gpml.handler.profile-test :as profile-test]
            [gpml.test-util :as test-util]
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
   :geo_coverage_type "global"
   :geo_coverage_value nil
   :url "https://akvo.org"
   :attachments nil
   :remarks nil
   :document_preview false
   :country (-> (:countries data) first :id)
   :tags (:tags data)
   :language "id"})

(deftest handler-post-test
  (let [system (ig/init fixtures/*system* [::policy/post])
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        handler (::policy/post system)
        data (profile-test/seed-important-database conn)
        _ (do (db.tag/new-tag-category conn {:category "financing mechanism"})
              (db.tag/new-tag conn {:tag "RT 1" :tag_category 2})
              (db.tag/new-tag conn {:tag "RT 2" :tag_category 2}))
        ;; create new language
        _ (db.language/new-language conn {:iso_code "id"
                                          :english_name "Indonesian"
                                          :native_name "Bahasa Indonesia"})]
    (testing "New policy is created"
      (let [;; create new user name John
            sth-id (test-util/create-test-stakeholder config
                                                      "john.doe@mail.invalid"
                                                      "APPROVED"
                                                      "USER")
            ;; create John create new policy with available organisation
            resp-one (handler (-> (mock/request :post "/")
                                  (assoc :user {:id sth-id}
                                         :body-params (new-policy data)
                                         :parameters {:body {:source dom.types/default-resource-source}})))
            ;; create John create new policy with new organisation
            resp-two (handler (-> (mock/request :post "/")
                                  (assoc :user {:id sth-id}
                                         :body-params (assoc (new-policy data) :org
                                                             {:id -1
                                                              :name "New Era"
                                                              :geo_coverage_type "global"
                                                              :country (-> (:countries data) second :id)})
                                         :parameters {:body {:source dom.types/default-resource-source}})))
            policy-one (db.policy/policy-by-id conn (:body resp-one))
            policy-two (db.policy/policy-by-id conn (:body resp-two))]
        (is (= 201 (:status resp-one)))
        (is (= (assoc (new-policy data)
                      :id 10001
                      :image nil
                      :tags (map :id (:tags data))
                      :created_by 10001) policy-one))
        (is (= (assoc (new-policy data)
                      :id 10002
                      :image nil
                      :tags (map :id (:tags data))
                      :created_by 10001) policy-two))))
    (testing "Unapproved user shouldn't be able to create policy"
      (let [sth-id (test-util/create-test-stakeholder config
                                                      "john.doe2@mail.invalid"
                                                      "SUBMITTED"
                                                      "USER")
            resp (handler (-> (mock/request :post "/")
                              (assoc :user {:id sth-id}
                                     :body-params (new-policy data)
                                     :parameters {:body {:source dom.types/default-resource-source}})))]
        (is (= 403 (:status resp)))))))

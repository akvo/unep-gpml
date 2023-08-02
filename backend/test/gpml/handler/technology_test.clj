(ns gpml.handler.technology-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.db.language :as db.language]
            [gpml.db.rbac-util :as db.rbac-util]
            [gpml.db.tag :as db.tag]
            [gpml.db.technology :as db.technology]
            [gpml.domain.types :as dom.types]
            [gpml.fixtures :as fixtures]
            [gpml.handler.profile-test :as profile-test]
            [gpml.handler.technology :as technology]
            [gpml.test-util :as test-util]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(defn new-technology [data]
  {:name "technology Title"
   :development_stage "Scale up"
   :organisation_type "Established Company"
   :specifications_provided false
   :geo_coverage_type "global"
   :geo_coverage_value nil
   :urls [{:lang "id" :url "https://www.test.org"}]
   :url "https://akvo.org"
   :attachments nil
   :remarks nil
   :country (-> (:countries data) first :id)
   :email "john@akvo.org"
   :document_preview false
   :year_founded 2021
   :tags (:tags data)
   :owners (or (:owners data) [])
   :language "en"})

(deftest handler-post-test
  (let [system (ig/init fixtures/*system* [::technology/post])
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        handler (::technology/post system)
        data (profile-test/seed-important-database conn)]
    (testing "New technology is created"
      (let [;; create new technology category tag
            _ (do (db.tag/new-tag-category conn {:category "technology"})
                  (db.tag/new-tag conn {:tag "RT 1" :tag_category 2})
                  (db.tag/new-tag conn {:tag "RT 2" :tag_category 2}))
            ;; create new language
            _ (db.language/new-language conn {:iso_code "id"
                                              :english_name "Indonesian"
                                              :native_name "Bahasa Indonesia"})
            ;; create new user name John
            sth-id (test-util/create-test-stakeholder config
                                                      "john.doe@mail.invalid"
                                                      "APPROVED"
                                                      "USER")
            ;; create John create new technology with available organisation
            resp-one (handler (-> (mock/request :post "/")
                                  (assoc :user {:id sth-id}
                                         :body-params (new-technology data)
                                         :parameters {:body {:source dom.types/default-resource-source}})))
            ;; create John create new technology with new organisation
            resp-two (handler (-> (mock/request :post "/")
                                  (assoc :user {:id sth-id}
                                         :body-params (assoc (new-technology data)
                                                             :owners [sth-id]
                                                             :org
                                                             {:id -1
                                                              :name "New Era"
                                                              :geo_coverage_type "global"
                                                              :country (-> (:countries data) second :id)})
                                         :parameters {:body {:source dom.types/default-resource-source}})))
            technology-one (db.technology/technology-by-id conn (:body resp-one))
            technology-two (db.technology/technology-by-id conn (:body resp-two))
            owners-tech-one (db.rbac-util/get-users-with-granted-permission-on-resource conn {:context-type-name "technology"
                                                                                              :resource-id (get-in resp-one [:body :id])
                                                                                              :permission-name "technology/delete"})
            owners-tech-two (db.rbac-util/get-users-with-granted-permission-on-resource conn {:context-type-name "technology"
                                                                                              :resource-id (get-in resp-two [:body :id])
                                                                                              :permission-name "technology/delete"})]
        (is (= 201 (:status resp-one)))
        (is (get (set (map :user_id owners-tech-one)) sth-id))
        (is (get (set (map :user_id owners-tech-two)) sth-id))
        (is (= (assoc (new-technology data)
                      :id 10001
                      :image nil
                      :logo nil
                      :headquarter nil
                      :info_docs nil
                      :sub_content_type nil
                      :subnational_city nil
                      :tags (map :id (:tags data))
                      :owners [sth-id]
                      :created_by 10001)
               technology-one))
        (is (= (assoc (new-technology data)
                      :id 10002
                      :image nil
                      :logo nil
                      :headquarter nil
                      :info_docs nil
                      :sub_content_type nil
                      :subnational_city nil
                      :tags (map :id (:tags data))
                      :owners [sth-id]
                      :created_by 10001)
               technology-two))))
    (testing "Unapproved users doesn't have enough permissions to create a new technology"
      (let [sth-id (test-util/create-test-stakeholder config
                                                      "john.doe2@mail.invalid"
                                                      "SUBMITTED"
                                                      "USER")
            resp (handler (-> (mock/request :post "/")
                              (assoc :user {:id sth-id}
                                     :body-params (new-technology data)
                                     :parameters {:body {:source dom.types/default-resource-source}})))]
        (is (= 403 (:status resp)))))))

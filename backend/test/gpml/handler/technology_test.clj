(ns gpml.handler.technology-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.fixtures :as fixtures]
            [gpml.handler.technology :as technology]
            [gpml.handler.profile-test :as profile-test]
            [gpml.db.tag :as db.tag]
            [gpml.db.language :as db.language]
            [gpml.db.technology :as db.technology]
            [gpml.db.stakeholder :as db.stakeholder]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(defn new-technology [data]
  {:name "technology Title"
   :development_stage "Scale up"
   :organisation_type "Established Company"
   :specifications_provided false
   :geo_coverage_type "regional"
   :geo_coverage_value (mapv :id (:country_groups data))
   :urls [{:lang "id" :url "https://www.test.org"}]
   :url "https://akvo.org"
   :attachments nil
   :remarks nil
   :country (-> (:countries data) first :id)
   :email "john@akvo.org"
   :document_preview false
   :year_founded 2021
   :tags (:tags data)
   :owners (or (:owners data) [])})

(deftest handler-post-test
  (testing "New technology is created"
    (let [system (ig/init fixtures/*system* [::technology/post])
          handler (::technology/post system)
          db (-> system :duct.database.sql/hikaricp :spec)
          ;; create new country [IDN SPA]
          ;; create new country group [Africa Asia Europe]
          ;; create new organisation [Akvo]
          ;; create new general 3 tags
          data (profile-test/seed-important-database db)
          ;; create new technology category tag
          _ (do (db.tag/new-tag-category db {:category "technology"})
                (db.tag/new-tag db {:tag "RT 1" :tag_category 2})
                (db.tag/new-tag db {:tag "RT 2" :tag_category 2}))
          ;; create new language
          _ (db.language/new-language db {:iso_code "id"
                                          :english_name "Indonesian"
                                          :native_name "Bahasa Indonesia"})
          ;; create new user name John
          user (db.stakeholder/new-stakeholder db (profile-test/new-profile 1))
          _ (db.stakeholder/update-stakeholder-status db (assoc user :review_status "APPROVED"))
          ;; create John create new technology with available organisation
          resp-one (handler (-> (mock/request :post "/")
                                (assoc :jwt-claims {:email "john@org"})
                                (assoc :body-params (new-technology data))))
          ;; create John create new technology with new organisation
          resp-two (handler (-> (mock/request :post "/")
                                (assoc :jwt-claims {:email "john@org"})
                                (assoc :body-params (assoc (new-technology data)
                                                           :owners [(:id user)]
                                                           :org
                                                           {:id -1
                                                            :name "New Era"
                                                            :geo_coverage_type "regional"
                                                            :geo_coverage_value (mapv :id (:country_groups data))
                                                            :country (-> (:countries data) second :id)}))))
          technology-one (db.technology/technology-by-id db (:body resp-one))
          technology-two (db.technology/technology-by-id db (:body resp-two))]
      (is (= 201 (:status resp-one)))
      (is (= (assoc (new-technology data)
                    :id 10001
                    :image nil
                    :logo nil
                    :headquarter nil
                    :info_docs nil
                    :sub_content_type nil
                    :related_content []
                    :subnational_city nil
                    :tags (map #(:id %) (:tags data))
                    :owners [(:id user)]
                    :created_by 10001)
             technology-one))
      (is (= (assoc (new-technology data)
                    :id 10002
                    :image nil
                    :logo nil
                    :headquarter nil
                    :info_docs nil
                    :sub_content_type nil
                    :related_content []
                    :subnational_city nil
                    :tags (map #(:id %) (:tags data))
                    :owners [(:id user)]
                    :created_by 10001)
             technology-two)))))

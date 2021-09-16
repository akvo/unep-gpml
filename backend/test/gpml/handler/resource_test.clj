(ns gpml.handler.resource-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.fixtures :as fixtures]
            [gpml.handler.image :as image]
            [gpml.handler.resource :as resource]
            [gpml.test-util :refer [picture]]
            [gpml.handler.profile-test :as profile-test]
            [gpml.db.tag :as db.tag]
            [gpml.db.language :as db.language]
            [gpml.db.resource :as db.resource]
            [gpml.db.stakeholder :as db.stakeholder]
            [integrant.core :as ig]
            [ring.mock.request :as mock]
            [clojure.string :as s]))

(use-fixtures :each fixtures/with-test-system)


(defn new-resource [data]
  {:resource_type "Financing Resource"
   :title "Financing Resource Title"
   :org {:id 1}
   :publish_year 2021
   :summary "Financing Resource Summary"
   :value 2000
   :value_currency "USD"
   :value_remarks "Value Remarks"
   :valid_from "2018"
   :valid_to "Ongoing"
   :geo_coverage_type "regional"
   :geo_coverage_value (mapv :id (:country_groups data))
   :image picture
   :remarks nil
   :urls [{:lang "id" :url "https://www.test.org"}]
   :country (-> (:countries data) first :id)
   :tags [4 5]})


(defn fake-upload-blob [_ _ _ content-type]
  (is (= content-type "image/png")))

(deftest handler-post-test
  (testing "New resource is created"
    (let [system (ig/init fixtures/*system* [::resource/post])
          handler (::resource/post system)
          db (-> system :duct.database.sql/hikaricp :spec)
          ;; create new country [IDN SPA]
          ;; create new country group [Africa Asia Europe]
          ;; create new organisation [Akvo]
          ;; create new general 3 tags
          data (profile-test/seed-important-database db)
          ;; create new resource category tag
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
          ;; create John create new resource with available organisation
          resp-one (with-redefs [image/upload-blob fake-upload-blob]
                     (handler (-> (mock/request :post "/")
                                  (assoc :jwt-claims {:email "john@org"})
                                  (assoc :body-params (new-resource data)))))
          ;; create John create new resource with new organisation
          resp-two (with-redefs [image/upload-blob fake-upload-blob]
                     (handler (-> (mock/request :post "/")
                                  (assoc :jwt-claims {:email "john@org"})
                                  (assoc :body-params
                                         (assoc (new-resource data)
                                                :org {:id -1
                                                      :name "New Era"
                                                      :geo_coverage_type "regional"
                                                      :geo_coverage_value (mapv :id (:country_groups data))
                                                      :country (-> (:countries data) second :id)})))))
          resource-one (db.resource/resource-by-id db (:body resp-one))
          resource-two (db.resource/resource-by-id db (:body resp-two))]
      (is (= 201 (:status resp-one)))
      (let [image-one (:image resource-one)]
        (is (s/includes? image-one "images/resource-"))
        (is (s/ends-with? image-one "uploaded.png"))
        (is (s/starts-with? image-one "https://storage.googleapis.com/")))
      (is (s/ends-with? (:image resource-one) "uploaded.png"))
      (is (= (dissoc (assoc (new-resource data)
                            :id 10001
                            :org {:id 1 :name "Akvo"}
                            :value "2000"
                            :created_by 10001) :image)
             (dissoc resource-one :image)))
      (is (= (dissoc (assoc (new-resource data)
                            :id 10002
                            :org {:id 10001 :name "New Era"}
                            :image "/image/resource/2"
                            :value "2000"
                            :created_by 10001) :image)
             (dissoc resource-two :image))))))

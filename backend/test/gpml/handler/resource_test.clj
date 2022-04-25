(ns gpml.handler.resource-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.fixtures :as fixtures]
            [gpml.handler.image :as image]
            [gpml.handler.resource :as resource]
            [gpml.handler.profile-test :as profile-test]
            [gpml.db.tag :as db.tag]
            [gpml.db.language :as db.language]
            [gpml.db.resource :as db.resource]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.topic-stakeholder-auth :as db.ts-auth]
            [integrant.core :as ig]
            [ring.mock.request :as mock]
            [clojure.string :as s]))

(use-fixtures :each fixtures/with-test-system)

(def ^:private image "data:image/png;base64,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")

(defn new-resource [data]
  {:resource_type "Financing Resource"
   :title "Financing Resource Title"
   :publish_year 2021
   :summary "Financing Resource Summary"
   :value 2000
   :value_currency "USD"
   :value_remarks "Value Remarks"
   :valid_from "2018"
   :valid_to "Ongoing"
   :geo_coverage_type "regional"
   :geo_coverage_value (mapv :id (:country_groups data))
   :image image
   :remarks nil
   :document_preview false
   :urls [{:lang "id" :url "https://www.test.org"}]
   :country (-> (:countries data) first :id)
   :tags (:tags data)
   :url "resource url"
   :owners (:owners data)})


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
          payload (new-resource data)
          resp-one (with-redefs [image/upload-blob fake-upload-blob]
                     (handler (-> (mock/request :post "/")
                                  (assoc :jwt-claims {:email "john@org"})
                                  (assoc :body-params payload))))
          ;; create John create new resource with new organisation
          resp-two (with-redefs [image/upload-blob fake-upload-blob]
                     (handler (-> (mock/request :post "/")
                                  (assoc :jwt-claims {:email "john@org"})
                                  (assoc :body-params
                                         (assoc (new-resource (merge data {:owners [(:id user)]}))
                                                :org {:id -1
                                                      :name "New Era"
                                                      :geo_coverage_type "regional"
                                                      :geo_coverage_value (mapv :id (:country_groups data))
                                                      :country (-> (:countries data) second :id)})))))
          resource-one (db.resource/resource-by-id db (:body resp-one))
          resource-two (db.resource/resource-by-id db (:body resp-two))]
      (is (not-empty (db.ts-auth/get-auth-by-topic db {:topic-id (:id resource-one) :topic-type "resource"})))
      (is (= (:id user) (:stakeholder (first (db.ts-auth/get-auth-by-topic db {:topic-id (:id resource-two) :topic-type "resource"})))))
      (is (= 201 (:status resp-one)))
      (let [image-one (:image resource-one)]
        (is (s/includes? image-one "images/resource-"))
        (is (s/ends-with? image-one "uploaded.png"))
        (is (s/starts-with? image-one "https://storage.googleapis.com/")))
      (is (s/ends-with? (:image resource-one) "uploaded.png"))
      (is (= (dissoc (assoc (new-resource data)
                            :id 10001
                            :value "2000"
                            :tags (map #(:id %) (:tags data))
                            :created_by 10001) :image :owners)
             (dissoc resource-one :image :owners)))
      (is (= (dissoc (assoc (new-resource data)
                            :id 10002
                            :image "/image/resource/2"
                            :value "2000"
                            :tags (map #(:id %) (:tags data))
                            :created_by 10001) :image :owners)
             (dissoc resource-two :image)))
      (is (= (:url payload) (:url resource-one))))))

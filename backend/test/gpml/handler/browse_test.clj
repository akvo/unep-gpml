(ns gpml.handler.browse-test
  (:require [clojure.string :as str]
            [clojure.test :refer [are deftest is testing use-fixtures]]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.topic-test :as db.topic-test]
            [gpml.domain.types :as dom.types]
            [gpml.fixtures :as fixtures]
            [gpml.handler.browse :as browse]
            [gpml.seeder.main :as seeder]
            [gpml.test-util :as test-util]
            [gpml.util.regular-expressions :as util.regex]
            [integrant.core :as ig]
            [malli.core :as malli]
            [malli.transform :as mt]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(deftest query-params
  (testing "Country query parameter validation"
    (let [valid? #(malli/validate [:re util.regex/comma-separated-numbers-re] %)]
      (are [expected value] (= expected (valid? value))
        true "0,107"
        true "170,102"
        true "170,102,73,106,107"
        false ""
        false " "
        false ","
        false ",,"
        false "107,106,"
        false "IDN"
        false "IDN, IND"
        false "esp"
        false "esp,usa")))
  (testing "Topic query parameter validation"
    (let [valid? #(malli/validate [:re browse/topic-re] %)]
      (is (true? (every? valid? dom.types/topic-types)))
      (are [expected value] (= expected (valid? value))
        true "technology,initiative"
        true "financing_resource,event"
        true "event,policy"
        true (str/join "," dom.types/topic-types)
        false "resource"
        false "technology,"
        false "technology,event,"
        false ""
        false " "
        false ","
        false ",,"))))

(deftest db-filter-based-on-query-params
  (letfn [(decode-params [params]
            (malli/decode browse/api-opts-schema params mt/string-transformer))]
    (testing "Default filter values"
      (is (= (browse/get-db-filter (decode-params {})) {:offset 0 :limit 50 :review-status "APPROVED"})))
    (testing "Country is not empty"
      (is (= (browse/get-db-filter (decode-params {:country "73,106,107"}))
             {:geo-coverage #{107 73 106} :offset 0 :limit 50 :review-status "APPROVED"})))
    (testing "Topic is not empty"
      (is (= (browse/get-db-filter (decode-params {:topic "technology"}))
             {:topic #{"technology"} :offset 0 :limit 50 :review-status "APPROVED"})))
    (testing "Search is not empty"
      (is (= (browse/get-db-filter (decode-params {:q "act"}))
             {:search-text "act" :offset 0 :limit 50 :review-status "APPROVED"})))
    (testing "Search multiple keywords"
      (is (= (browse/get-db-filter (decode-params {:q "some test"}))
             {:search-text "some & test" :offset 0 :limit 50 :review-status "APPROVED"})))
    (testing "Trailing/leading/double spaces are trimmed"
      (is (= (browse/get-db-filter (decode-params {:q "  This   is a test  "}))
             {:search-text "This & is & a & test" :offset 0 :limit 50 :review-status "APPROVED"})))
    (testing "Ampersand is removed"
      (is (= (browse/get-db-filter (decode-params {:q "&&test&&"}))
             {:search-text "test" :offset 0 :limit 50 :review-status "APPROVED"})))
    (testing "None is empty"
      (is (= (browse/get-db-filter (decode-params
                                    {:q "eco"
                                     :country "253"
                                     :topic "initiative,event"}))
             {:search-text "eco"
              :geo-coverage #{253}
              :topic #{"initiative" "event"}
              :offset 0 :limit 50
              :review-status "APPROVED"})))))

(deftest browse-view-results
  (let [db (test-util/db-test-conn)
        system (-> fixtures/*system*
                   (ig/init [::browse/get]))
        handler (::browse/get system)
        limit 50 ;; set in browse.sql
        email "mail@org.com"
        profile-data (db.topic-test/make-profile "John" "Doe" email)
        _ (seeder/seed db {:country? true :technology? true})
        ;; Create a stakeholder
        sth (db.stakeholder/new-stakeholder db profile-data)
        ;; Mark stakeholder as APPROVED
        _ (db.stakeholder/update-stakeholder-status db (assoc sth :review_status "APPROVED"))
        ;; Mark a technology as favorite
        _ (db.favorite/new-stakeholder-association db {:stakeholder (:id sth)
                                                       :topic "technology"
                                                       :topic_id 1
                                                       :association "user"
                                                       :remarks nil})]

    (testing "Query for favorites WITHOUT LOGIN"
      (let [request (-> (mock/request :get "/")
                        (assoc
                         :parameters {:query {:favorites true}}))
            resp (handler request)
            body (-> resp :body)
            results (:results body)
            counts (:counts body)
            tech-count (first counts)]
        ;; results are not filtered, because not logged in user
        (is (= limit (count results)))
        (is (= 1 (count counts)))
        (is (= (:topic tech-count) "technology"))
        (is (> (:count tech-count) limit))))

    (testing "Query for favorites as approved and logged-in user"
      (let [request (-> (mock/request :get "/")
                        (assoc
                         :approved? true
                         :user sth
                         :parameters {:query {:favorites true}}))
            resp (handler request)
            body (-> resp :body)
            results (:results body)
            counts (:counts body)
            tech-count (first counts)]
        ;; Only favorites are shown
        (is (= 1 (count results)))
        ;; only tech returned
        (is (= 1 (count counts)))
        (is (= (:topic tech-count) "technology"))
        (is (= (:count tech-count) 1))))

    (testing "Testing query for BOGUS tags"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc :parameters {:query {:tag #{"bogus1" "bogus2"}}})))
            body (-> resp :body)
            results (:results body)]
        (is (= 0 (count results)))))

    (testing "Testing query for existing tags"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc :parameters {:query {:tag #{"waste management"}}})))
            body (-> resp :body)
            results (:results body)]
        (is (= 16 (count results)))))))

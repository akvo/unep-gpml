(ns gpml.db.landing-test
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.test :refer [are deftest is testing use-fixtures]]
            [gpml.db.country :as db.country]
            [gpml.db.country-group :as db.country-group]
            [gpml.db.event :as db.event]
            [gpml.db.landing :as db.landing]
            [gpml.db.resource :as db.resource]
            [gpml.db.topic :as db.topic]
            [gpml.fixtures :as fixtures]
            [integrant.core :as ig]))

(use-fixtures :each fixtures/with-test-system)

(defn make-resource [title geo-coverage]
  {:title title
   :type "Financing Resource"
   :publish_year 2010
   :summary "Summary"
   :value 1000000
   :value_currency "USD"
   :value_remarks "Initial Contribution"
   :image nil
   :valid_from nil
   :valid_to nil
   :geo_coverage_type geo-coverage
   :attachments nil
   :remarks "Remarks"
   :review_status "APPROVED"
   :language "en"})

(defn add-country-data [conn]
  (db.country/new-country conn {:name "Spain" :description "Member State" :iso_code "ESP"})
  (db.country/new-country conn {:name "India" :description "Member State" :iso_code "IND"})
  (db.country/new-country conn {:name "Indonesia" :description "Member State" :iso_code "IDN"})
  (db.country/new-country conn {:name "Kenya" :description "Member State" :iso_code "KEN"})
  (db.country/new-country conn {:name "Netherlands" :description "Member State" :iso_code "NLD"})
  (db.country/new-country conn {:name "All" :description "Member State" :iso_code nil})
  (db.country-group/new-country-group conn {:name "Asia" :type "region"})
  (db.country-group/new-country-group conn {:name "Europe" :type "region"})
  (jdbc/insert-multi! conn :country_group_country
                      [{:country_group 1 :country 2}
                       {:country_group 1 :country 3}
                       {:country_group 2 :country 1}]))

(defn add-resource-data [conn]
  (add-country-data conn)
  (db.resource/new-resource conn (make-resource "Resource 1" "transnational"))
  (db.resource/new-resource conn (make-resource "Resource 2" "national"))
  (db.resource/new-resource conn (make-resource "Resource 3" "regional"))
  (db.resource/new-resource conn (make-resource "Resource 4" "global"))
  (db.resource/new-resource conn (make-resource "Resource 5" "national"))
  (jdbc/insert-multi! conn :resource_geo_coverage
                      [;; Resource 1
                       {:resource 10001 :country 1}
                       {:resource 10001 :country 2}
                       {:resource 10001 :country 3}
                       ;; Resource 2
                       {:resource 10002 :country 4}
                       ;; Resource 3
                       {:resource 10003 :country_group 1}
                       {:resource 10003 :country_group 2}
                       {:resource 10005 :country 3}]))

(deftest test-map-specific-counts
  (testing "Test map counts for landing page"
    (let [db-key :duct.database.sql/hikaricp
          system (ig/init fixtures/*system* [db-key])
          conn (-> system db-key :spec)
          _ (add-resource-data conn)
          landing (db.landing/map-counts-include-all-countries conn {:entity-group :topic})
          valid? (fn [country-id] (->> landing
                                       (filter #(= country-id (:country_id %)))
                                       first
                                       :counts
                                       :financing_resource))]
      (are [expected country-id] (= expected (valid? country-id))
        1 (-> (db.country/country-by-code conn {:name "ESP"}) :id)
        1 (-> (db.country/country-by-code conn {:name "IND"}) :id)
        2 (-> (db.country/country-by-code conn {:name "IDN"}) :id)
        1 (-> (db.country/country-by-code conn {:name "KEN"}) :id)
        0 (-> (db.country/country-by-code conn {:name "NLD"}) :id)))))

(deftest test-summary
  (testing "Test summary data for landing page"
    (let [db-key :duct.database.sql/hikaricp
          system (ig/init fixtures/*system* [db-key])
          conn (-> system db-key :spec)
          _ (add-resource-data conn)
          _ (db.event/new-event conn
                                {:title "any"
                                 :start_date "2021-10-03"
                                 :end_date "2021-10-15"
                                 :description "blah"
                                 :remarks "blah"
                                 :geo_coverage_type nil
                                 :country nil
                                 :city nil
                                 :image nil
                                 :review_status "SUBMITTED"
                                 :language "en"})
          summary (db.landing/summary conn)
          extract-data (fn [topic]
                         (->> summary
                              (filter #(= topic (:resource_type %)))
                              first))]

      (are [expected topic] (= expected (:count (extract-data topic)))
        5 "financing_resource"
        0 "event")
      (are [expected topic] (= expected (:country_count (extract-data topic)))
        4 "financing_resource"
        0 "event"))))

(defn- get-country-group-ids [db country-id]
  (db.country-group/get-country-groups-by-countries db {:filters {:countries-ids [country-id]}}))

(deftest landing-counts
  (let [db-key :duct.database.sql/hikaricp
        system (ig/init fixtures/*system* [db-key])
        conn (-> system db-key :spec)
        _ (add-resource-data conn)
        landing (db.landing/map-counts-include-all-countries conn {:entity-group :topic})]
    (testing "Landing counts match browse results"
      (let [country-id 4
            transnationals (->> (get-country-group-ids conn country-id)
                                (map (comp str :id))
                                set)
            landing-counts-by-country (filter #(= country-id (:country_id %)) landing)
            browse (db.topic/get-topics conn {:topic #{"financing_resource"}
                                              :geo-coverage [country-id]
                                              :transnational transnationals
                                              :count-only? true
                                              :limit 8
                                              :offset 0})]
        (is (= (+ (get-in (first landing-counts-by-country) [:counts :financing_resource])
                  (get-in (first landing-counts-by-country) [:transnational_counts :financing_resource]))
               (:count (first browse))))))))

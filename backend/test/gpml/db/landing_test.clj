(ns gpml.db.landing-test
  (:require [clojure.test :refer [deftest testing use-fixtures are]]
            [clojure.java.jdbc :as jdbc]
            [gpml.db.country :as db.country]
            [gpml.db.country-group :as db.country-group]
            [gpml.db.landing :as db.landing]
            [gpml.db.resource :as db.resource]
            [gpml.db.event :as db.event]
            [gpml.fixtures :as fixtures]
            [integrant.core :as ig]))

(use-fixtures :each fixtures/with-test-system)

(defn make-resource [title geo-coverage]
  {:title title
   :type "Financing Resource"
   :publish_year 2010
   :summary "Summary"
   :value 1000000
   :image nil
   :valid_from nil
   :valid_to nil
   :geo_coverage_type geo-coverage
   :attachments nil
   :remarks "Remarks"
   :review_status "APPROVED"})

(defn add-resource-data [conn]
  (db.country/new-country conn {:name "Spain" :iso_code "ESP"})
  (db.country/new-country conn {:name "India" :iso_code "IND"})
  (db.country/new-country conn {:name "Indonesia" :iso_code "IDN"})
  (db.country/new-country conn {:name "Kenya" :iso_code "KEN"})
  (db.country/new-country conn {:name "Netherlands" :iso_code "NLD"})
  (db.country/new-country conn {:name "All" :iso_code nil})
  (db.country-group/new-country-group conn {:name "Asia" :type "region"})
  (db.country-group/new-country-group conn {:name "Europe" :type "region"})
  (jdbc/insert-multi! conn :country_group_country
                      [{:country_group 1 :country 2}
                       {:country_group 1 :country 3}
                       {:country_group 2 :country 1}])
  (db.resource/new-resource conn (make-resource "Resource 1" "transnational"))
  (db.resource/new-resource conn (make-resource "Resource 2" "national"))
  (db.resource/new-resource conn (make-resource "Resource 3" "regional"))
  (db.resource/new-resource conn (make-resource "Resource 4" "global"))
  (db.resource/new-resource conn (make-resource "Resource 5" "national"))
  (jdbc/insert-multi! conn :resource_geo_coverage
                      [ ;; Resource 1
                       {:resource 1 :country 1}
                       {:resource 1 :country 2}
                       {:resource 1 :country 3}
                       ;; Resource 2
                       {:resource 2 :country 4}
                       ;; Resource 3
                       {:resource 3 :country_group 1}
                       {:resource 3 :country_group 2}
                       {:resource 5 :country 3}]))

(deftest test-map-counts
  (testing "Test map counts for landing page"
    (let [db-key :duct.database.sql/hikaricp
          system (ig/init fixtures/*system* [db-key])
          conn (-> system db-key :spec)
          _ (add-resource-data conn)
          landing (db.landing/map-counts+global conn)
          valid? (fn [iso-code] (->> landing
                                     (filter #(= iso-code (:iso_code %)))
                                     first
                                     :financing_resource))]
      (are [expected iso-code] (= expected (valid? iso-code))
        3 "ESP"
        3 "IND"
        4 "IDN"
        2 "KEN"
        1 "NLD"))))

(deftest test-map-specific-counts
  (testing "Test map counts for landing page"
    (let [db-key :duct.database.sql/hikaricp
          system (ig/init fixtures/*system* [db-key])
          conn (-> system db-key :spec)
          _ (add-resource-data conn)
          landing (db.landing/map-specific-counts conn)
          valid? (fn [iso-code] (->> landing
                                     (filter #(= iso-code (:iso_code %)))
                                     first
                                     :financing_resource))]
      (are [expected iso-code] (= expected (valid? iso-code))
        1 "KEN"
        1 "IDN"))))

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
                                 :review_status "SUBMITTED"})
          summary (db.landing/summary conn)
          extract-data (fn [topic]
                         (->> summary
                              (filter #(= topic (:resource_type %)))
                              first))]

      (are [expected topic] (= expected (:count (extract-data topic)))
        4 "financing_resource"
        0 "event")
      (are [expected topic] (= expected (:country_count (extract-data topic)))
        4 "financing_resource"
        0 "event"))))

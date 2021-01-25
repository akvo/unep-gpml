(ns gpml.db.landing-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [clojure.java.jdbc :as jdbc]
            [gpml.db.country :as db.country]
            [gpml.db.country-group :as db.country-group]
            [gpml.db.landing :as db.landing]
            [gpml.db.resource :as db.resource]
            [gpml.fixtures :as fixtures]
            [integrant.core :as ig]))

(use-fixtures :each fixtures/with-test-system)

(defn make-resource [title geo-coverage]
  {:title title
   :type "Financial Resource"
   :publish_year 2010
   :summary "Summary"
   :value 1000000
   :image nil
   :valid_from nil
   :valid_to nil
   :geo_coverage_type geo-coverage
   :attachments nil
   :remarks "Remarks"})

(defn add-resource-data [conn]
  (db.country/new-country conn {:name "Spain" :iso_code "ESP"})
  (db.country/new-country conn {:name "India" :iso_code "IND"})
  (db.country/new-country conn {:name "Indonesia" :iso_code "IDN"})
  (db.country/new-country conn {:name "Kenya" :iso_code "KEN"})
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
  (jdbc/insert-multi! conn :resource_geo_coverage
                      [ ;; Resource 1
                       {:resource 1 :country 1}
                       {:resource 1 :country 2}
                       {:resource 1 :country 3}
                       ;; Resource 2
                       {:resource 2 :country 4}
                       ;; Resource 3
                       {:resource 3 :country_group 1}
                       {:resource 3 :country_group 2}]))

(deftest test-map-counts
  (testing "Test map counts for landing page"
    (let [db-key :duct.database.sql/hikaricp
          system (ig/init fixtures/*system* [db-key])
          conn (-> system db-key :spec)
          _ (add-resource-data conn)
          landing (db.landing/map-counts-grouped conn)]
      (prn landing)
      (is (= (:resource (first (filter #(= "ESP" (:iso_code %)) landing))) 3))
      (is (= (:resource (first (filter #(= "IND" (:iso_code %)) landing))) 3))
      (is (= (:resource (first (filter #(= "IDN" (:iso_code %)) landing))) 3))
      (is (= (:resource (first (filter #(= "KEN" (:iso_code %)) landing))) 2)))))

(deftest test-summary
  (testing "Test summary data for landing page"
    (let [db-key :duct.database.sql/hikaricp
          system (ig/init fixtures/*system* [db-key])
          conn (-> system db-key :spec)
          _ (add-resource-data conn)
          summary (first (db.landing/summary conn))]
      (is (= (:resource summary) 3))
      (is (= (:resource_countries summary) 4)))))

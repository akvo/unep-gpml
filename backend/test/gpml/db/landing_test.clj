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

(defn make-resource [title]
  {:title title
   :type "Financial Resource"
   :publish_year 2010
   :summary "Summary"
   :value 1000000
   :image nil
   :valid_from nil
   :valid_to nil
   :geo_coverage_type nil
   :attachments nil
   :remarks "Remarks"})

(defn add-resource-data [conn]
  (let [_ (db.country/new-country conn {:name "Spain" :iso_code "ESP"})
        _ (db.country/new-country conn {:name "India" :iso_code "IND"})
        _ (db.country/new-country conn {:name "Indonesia" :iso_code "IDN"})
        _ (db.country-group/new-country-group conn {:name "Asia" :type "region"})
        _ (db.country-group/new-country-group conn {:name "Europe" :type "region"})
        _ (jdbc/insert-multi! conn :country_group_countries
                              [{:country_group 1 :country 2}
                               {:country_group 1 :country 3}
                               {:country_group 2 :country 1}])
        _ (db.resource/new-resource conn (make-resource "Resource 1"))
        _ (db.resource/new-resource conn (make-resource "Resource 2"))
        _ (db.resource/new-resource conn (make-resource "Resource 3"))
        _ (jdbc/insert-multi! conn :resource_geo_coverage
                              [ ;; Resource 1
                               {:resource 1 :country 1}
                               {:resource 1 :country 2}
                               {:resource 1 :country 3}
                               ;; Resource 2
                               {:resource 2 :country 3}
                               ;; Resource 3
                               {:resource 2 :country_group 1}
                               {:resource 2 :country_group 2}])
        ]))

(deftest test-map-counts
  (testing "Test map counts for landing page"
    (let [db-key :duct.database.sql/hikaricp
          system (ig/init fixtures/*system* [db-key])
          conn (-> system db-key :spec)
          _ (add-resource-data conn)
          landing (db.landing/map-counts conn)]
      (is (= (:resource (first (filter (fn [x] (= "ESP" (:iso_code x))) landing))) 2))
      (is (= (:resource (first (filter (fn [x] (= "IND" (:iso_code x))) landing))) 2))
      (is (= (:resource (first (filter (fn [x] (= "IDN" (:iso_code x))) landing))) 3)))))

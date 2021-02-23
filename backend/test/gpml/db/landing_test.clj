(ns gpml.db.landing-test
  (:require [clojure.test :refer [deftest testing use-fixtures are is]]
            [clojure.java.jdbc :as jdbc]
            [gpml.handler.profile :as handler.profile]
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
   :value_currency "USD"
   :value_remarks "Initial Contribution"
   :image nil
   :valid_from nil
   :valid_to nil
   :geo_coverage_type geo-coverage
   :attachments nil
   :remarks "Remarks"
   :review_status "APPROVED"})

(defn add-country-data [conn]
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
     {:country_group 2 :country 1}]))

(defn add-resource-data [conn]
  (add-country-data conn)
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

(deftest test-map-specific-counts
  (testing "Test map counts for landing page"
    (let [db-key :duct.database.sql/hikaricp
          system (ig/init fixtures/*system* [db-key])
          conn (-> system db-key :spec)
          _ (add-resource-data conn)
          landing (db.landing/map-counts-include-all-countries conn)
          valid? (fn [iso-code] (->> landing
                                     (filter #(= iso-code (:iso_code %)))
                                     first
                                     :financing_resource))]
      (are [expected iso-code] (= expected (valid? iso-code))
        1 "ESP"
        1 "IND"
        2 "IDN"
        1 "KEN"
        0 "NLD"))))

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
        5 "financing_resource"
        0 "event")
      (are [expected topic] (= expected (:country_count (extract-data topic)))
        4 "financing_resource"
        0 "event"))))

(def spanish {:country "Spain"
              :geo_coverage_type "national"
              :geo_coverage_value ["ESP"]})

(def india {:country "India"
            :geo_coverage_type "national"
            :geo_coverage_value ["IND"]})

(def asia {:geo_coverage_type "regional" :geo_coverage_value ["Asia"]})

(def approved {:review_status "APPROVED"})

(defn org [& org-data]
  (apply merge
    {:name (str "org" (fixtures/uuid))
     :review_status "SUBMITTED"}
    org-data))

(deftest test-organisation

  (testing "Test organisation data for landing page"
    (let [db-key :duct.database.sql/hikaricp
          system (ig/init fixtures/*system* [db-key])
          conn (-> system db-key :spec)
          _ (add-country-data conn)
          summary (fn [& orgs]
                    (doseq [org orgs]
                      (handler.profile/new-organisation conn org))
                    (let [summary (db.landing/summary conn)
                          orgs-data (->> summary
                                      (filter #(= "organisation" (:resource_type %)))
                                      first)]
                      (clojure.java.jdbc/execute! conn "delete from organisation_geo_coverage")
                      (clojure.java.jdbc/execute! conn "delete from organisation")
                      ((juxt :count :country_count) orgs-data)))]

      (testing "Two orgs in one country"
        (is (= [2 1] (summary (org spanish approved) (org spanish approved)))))

      (testing "One org in a region"
        (is (= [1 2] (summary (org approved asia)))))

      (testing "One org in a region, another in a country"
        (is (= [2 3] (summary (org approved spanish) (org approved asia))))
        (is (= [2 2] (summary (org approved india) (org approved asia)))))

      (testing "One global org"
        (is (= [1 0] (summary (org approved {:geo_coverage_type "global"})))))

      (testing "Unapproved org is not counted"
        (is (= [0 0] (summary (org spanish) (org asia) (org {:geo_coverage_type "global"})))))

      )))

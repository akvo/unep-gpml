(ns gpml.db.landing-test
  (:require
   [clojure.java.jdbc :as jdbc]
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
  (let [countries [(db.country/new-country conn {:name "Spain" :description "Member State" :iso_code_a3 "ESP"})
                   (db.country/new-country conn {:name "India" :description "Member State" :iso_code_a3 "IND"})
                   (db.country/new-country conn {:name "Indonesia" :description "Member State" :iso_code_a3 "IDN"})
                   (db.country/new-country conn {:name "Kenya" :description "Member State" :iso_code_a3 "KEN"})
                   (db.country/new-country conn {:name "Netherlands" :description "Member State" :iso_code_a3 "NLD"})
                   (db.country/new-country conn {:name "All" :description "Member State" :iso_code_a3 nil})]
        country-groups [(db.country-group/new-country-group conn {:name "Asia" :type "region"})
                        (db.country-group/new-country-group conn {:name "Europe" :type "region"})]]
    (jdbc/insert-multi! conn :country_group_country
                        [{:country_group ((nth country-groups 0) :id) :country ((nth countries 1) :id)}
                         {:country_group ((nth country-groups 0) :id) :country ((nth countries 2) :id)}
                         {:country_group ((nth country-groups 1) :id) :country ((nth countries 1) :id)}])
    {:countries countries :country-groups country-groups}))

(defn add-resource-data [conn]
  (let [country-data (add-country-data conn)]
    (db.resource/new-resource conn (make-resource "Resource 1" "national"))
    (db.resource/new-resource conn (make-resource "Resource 2" "national"))
    (db.resource/new-resource conn (make-resource "Resource 3" "transnational"))
    (db.resource/new-resource conn (make-resource "Resource 4" "global"))
    (db.resource/new-resource conn (make-resource "Resource 5" "national"))
    (jdbc/insert-multi! conn :resource_geo_coverage
                        [;; Resource 1
                         {:resource 10001 :country ((nth (:countries country-data) 0) :id)}
                         {:resource 10001 :country ((nth (:countries country-data) 1) :id)}
                         {:resource 10001 :country ((nth (:countries country-data) 2) :id)}
                         ;; Resource 2
                         {:resource 10002 :country ((nth (:countries country-data) 3) :id)}
                         ;; Resource 3
                         {:resource 10003 :country_group ((nth (:country-groups country-data) 0) :id)}
                         {:resource 10003 :country_group ((nth (:country-groups country-data) 1) :id)}
                         {:resource 10005 :country ((nth (:countries country-data) 2) :id)}])))

(deftest test-map-specific-counts
  (testing "Test map counts for landing page"
    (let [db-key [:duct.database.sql/hikaricp :duct.database.sql.hikaricp/read-write]
          system (ig/init fixtures/*system* [db-key])
          conn (:spec (get system db-key))
          _ (add-resource-data conn)
          {:keys [country_counts]} (db.landing/get-resource-map-counts conn {:entity-group :topic})
          financing-resource (fn [country-id]
                               (let [c (->> country_counts
                                            (filter #(= country-id (:country_id %))))]
                                 (assert (= 1 (count c))
                                         c)
                                 (->> c
                                      first
                                      :counts
                                      :financing_resource)))]
      (are [a3 expected] (let [c (db.country/get-countries conn
                                                           {:filters {:descriptions ["Member State"]
                                                                      :iso-codes-a3 [a3]}})]
                           (assert (= 1 (count c))
                                   c)
                           (testing a3
                             (is (= expected (-> c
                                                 first
                                                 :id
                                                 financing-resource))))
                           true)
        "ESP" 1
        "IND" 1
        "IDN" 2
        "KEN" 1
        "NLD" 0))))

(deftest test-summary
  (testing "Test summary data for landing page"
    (let [db-key [:duct.database.sql/hikaricp :duct.database.sql.hikaricp/read-write]
          system (ig/init fixtures/*system* [db-key])
          conn (:spec (get system db-key))
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
  (let [db-key [:duct.database.sql/hikaricp :duct.database.sql.hikaricp/read-write]
        system (ig/init fixtures/*system* [db-key])
        conn (:spec (get system db-key))
        _ (add-resource-data conn)
        {:keys [country_counts]} (db.landing/get-resource-map-counts conn {:entity-group :topic})]
    (testing "Landing counts match browse results"
      (let [country-id 4
            transnationals (->> (get-country-group-ids conn country-id)
                                (map (comp str :id))
                                set)
            landing-counts-by-country (filter #(= country-id (:country_id %)) country_counts)
            browse (db.topic/get-topics conn {:topic #{"financing_resource"}
                                              :geo-coverage-countries [country-id]
                                              :geo-coverage-country-groups transnationals
                                              :count-only? true
                                              :limit 8
                                              :offset 0})]
        (is (= (+ (get-in (first landing-counts-by-country) [:counts :financing_resource])
                  (get-in (first landing-counts-by-country) [:transnational_counts :financing_resource]))
               (:count (first browse))))))))

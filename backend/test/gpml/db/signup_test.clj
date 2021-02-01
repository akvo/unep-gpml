(ns gpml.db.signup-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.country :as db.country]
            [gpml.fixtures :as fixtures]
            [integrant.core :as ig]))

(use-fixtures :each fixtures/with-test-system)

(defn get-country [conn profile]
  (:id (db.country/country-by-name conn {:name (:country profile)})))

(defn make-profile [conn first-name last-name email country]
  {:picture nil
   :cv nil
   :title "mr."
   :first_name first-name
   :last_name last-name
   :affiliation nil
   :email email
   :linked_in nil
   :twitter nil
   :url nil
   :country (get-country conn country)
   :representation "test"
   :about "Lorem Ipsum"
   :geo_coverage_type nil
   :role "USER"})

(defn add-stakeholder-data [conn]
  (let [country "Indonesia"
        iso_code "IDN"]
  (db.country/new-country conn {:name country :iso_code iso_code})
  (db.stakeholder/new-stakeholder conn (make-profile conn "John" "Doe" "mail@org.com" country))))

(deftest test-new-profile
  (testing "Test profile is get inserted"
    (let [db-key :duct.database.sql/hikaricp
          system (ig/init fixtures/*system* [db-key])
          conn (-> system db-key :spec)
          _ (add-stakeholder-data conn)
          stakeholder (db.stakeholder/all-stakeholder conn)]
      (is (= (:first_name (first stakeholder)) "John"))
      (is (= (:picture (first stakeholder)) nil))
      (is (= (:country (first stakeholder)) (get-country conn "Indonesia")))
      (is (= (:last_name (first stakeholder)) "Doe")))))

(ns gpml.db.signup-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.db.country :as db.country]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.fixtures :as fixtures]
            [integrant.core :as ig]))

(use-fixtures :each fixtures/with-test-system)

(defn get-country [conn profile]
  (:id (first (db.country/get-countries conn {:filters {:names [(:country profile)]
                                                        :descriptions ["Member State"]}}))))

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
   :organisation_role "Account Manager"
   :representation "test"
   :about "Lorem Ipsum"
   :geo_coverage_type nil
   :role "USER"
   :public_email true
   :idp_usernames ["auth0|123"]})

(defn add-stakeholder-data [conn]
  (let [country "Indonesia"
        iso_code "IDN"]
    (db.country/new-country conn {:name country :iso_code_a3 iso_code :description "Member State"})
    (db.stakeholder/new-stakeholder conn (make-profile conn "John" "Doe" "mail@org.com" country))))

(deftest test-new-profile
  (testing "Test profile is get inserted"
    (let [db-key :duct.database.sql/hikaricp
          system (ig/init fixtures/*system* [db-key])
          conn (-> system db-key :spec)
          _ (add-stakeholder-data conn)
          stakeholder (first (db.stakeholder/all-stakeholder conn))]
      (is (= (:review_status stakeholder) "SUBMITTED"))
      (is (= (:first_name stakeholder) "John"))
      (is (= (:picture stakeholder) nil))
      (is (= (:organisation_role stakeholder) "Account Manager"))
      (is (true? (:public_email stakeholder)))
      (is (= (:country stakeholder) (get-country conn "Indonesia")))
      (is (= (:last_name stakeholder) "Doe")))))

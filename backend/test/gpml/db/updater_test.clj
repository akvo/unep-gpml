(ns gpml.db.updater-test
  (:require [clojure.string :as str]
            [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.db.country :as db.country]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.fixtures :as fixtures]
            [gpml.seeder.db :as db.seeder]
            [gpml.seeder.dummy :as dummy]
            [gpml.seeder.main :as seeder]
            [gpml.test-util :as test-util]))

(use-fixtures :each fixtures/with-test-system)

(deftest update-country-mapping-sanity-checks
  (let [countries-new (seeder/get-data "new_countries")
        countries-old (seeder/get-data "countries")
        mapping-file (seeder/get-data "new_countries_mapping")
        old-ids (mapv #(-> % first name read-string) mapping-file)]

    ;; Sanity check for the old -> new mapping
    (testing "mapping is correct"
      (doseq [mapping mapping-file]
        (let [old-id (-> mapping first name read-string)
              new-id (-> mapping second)
              country-new (first (filter #(= new-id (:id %)) countries-new))
              country-old (first (filter #(= old-id (:id %)) countries-old))
              iso-code-new (:iso_code country-new)
              iso-code-old (:iso_code country-old)]
          (when-not (or
                     ;; Missing countries
                     (nil? iso-code-new)
                     (nil? iso-code-old)
                     ;; No "proper" 3 letter ISO codes
                     (str/starts-with? iso-code-old "x")
                     (str/starts-with? iso-code-new "x")
                     ;; Chagos Archipelago
                     (and (= (:id country-new) 1080) (= (:id country-old) 109))
                     ;; Sint Eustatius
                     (and (= (:id country-new) 1069) (= (:id country-old) 8))
                     ;; Saba
                     (and (= (:id country-new) 1068) (= (:id country-old) 7)))
            (is (= iso-code-new iso-code-old))))))

    ;; Ensure mapping for all countries, except those deleted, or with
    ;; empty names in the old map.
    (doseq [country-old countries-old]
      (testing (str (:name country-old) " is available in new map")
        (let [;; countries not available on the new map
              new-map-deleted ["Ascencion (UK)" "Gough (UK)" "Tristan da Cunha (UK)"]]
          (is (or
               ;; countries which are not available on the new json
               (.contains ^clojure.lang.PersistentVector new-map-deleted (:name country-old))
               ;; old country is an empty string
               (empty? (str/trim (:name country-old)))
               ;; old country is available on the new_countries_mapping.json
               (.contains ^clojure.lang.PersistentVector old-ids (:id country-old)))))))))

(deftest country-table-foreign-key-checks
  (let [db (test-util/db-test-conn)
        fkeys (db.seeder/get-foreign-key db {:table "country"})
        fkey (mapv :tbl (:deps fkeys))]

    ;; Sanity checks for DB foreign keys
    (doseq [topic ["event" "organisation"
                   "policy" "resource"
                   "stakeholder" "technology"]]
      (testing (str "foreign " topic " is available")
        (is (.contains ^clojure.lang.PersistentVector fkey topic)))
      (testing (str "foreign " topic "_geo_coverage is available")
        (is (.contains ^clojure.lang.PersistentVector fkey (str topic "_geo_coverage")))))))

(deftest revert-update-country-test
  (let [db (test-util/db-test-conn)
        countries-new (seeder/get-data "new_countries")
        countries-old (filter #(-> % :name str/trim not-empty) (seeder/get-data "countries"))
        ;; seed countries with old id
        _ (seeder/seed-countries db {:old? true})
        me (dummy/get-or-create-profile
            db "test@akvo.org" "Testing Profile" "ADMIN" "APPROVED")
        country (first (db.country/get-countries db {:filters {:iso-codes-a3 ["IDN"]
                                                               :descriptions ["Member State"]}}))
        _ (db.stakeholder/update-stakeholder db {:country (:id country)
                                                 :id (:id me)})
        me (db.stakeholder/stakeholder-by-email db me)]
    (seeder/updater-country db)
    (testing "my country id is updated"
      (is (= (:id country) (:country me)))
      (is (= (count (db.country/get-countries db {})) (count countries-new))))
    (seeder/updater-country db)
    (let [old-me (db.stakeholder/stakeholder-by-id db me)]
      (testing "my country id is reversed"
        (is (= me old-me))
        (is (= (count (db.country/get-countries db {})) (count countries-old)))))))

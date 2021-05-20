(ns gpml.db.updater-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [clojure.string :as str]
            [gpml.fixtures :as fixtures]
            [gpml.seeder.db :as db.seeder]
            [gpml.seeder.util :as db.util]
            [gpml.seeder.main :as seeder]
            [gpml.seeder.dummy :as dummy]
            [gpml.test-util :as test-util]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.country :as db.country]))

(use-fixtures :each fixtures/with-test-system)

(deftest update-country-test
  (let [db (test-util/db-test-conn)
        fkeys (db.seeder/get-foreign-key db {:table "country"})
        fkey (mapv #(:tbl %) (:deps fkeys))
        countries-new (seeder/get-data "new_countries")
        countries-old (seeder/get-data "countries")
        mapping-file (seeder/get-data "new_countries_mapping")
        old-ids (mapv #(-> % first name read-string) mapping-file) ]
    (seeder/seed-languages db)

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
               (.contains new-map-deleted (:name country-old))
               ;; old country is an empty string
               (empty? (str/trim (:name country-old)))
               ;; old country is available on the new_countries_mapping.json
               (.contains old-ids (:id country-old)))))))

    (testing (str "foreign project_countries is available")
      (is (.contains fkey "project_country")))
    (doseq [topic ["event" "organisation"
                   "policy" "resource"
                   "stakeholder" "technology"]]
      (testing (str "foreign " topic " is available")
        (is (.contains fkey topic)))
      (testing (str "foreign " topic "_geo_coverage is available")
        (is (.contains fkey (str topic "_geo_coverage")))))
    (testing "seed using old ids"
      (seeder/resync-country db {:old? true})
      (let [;; get id from database
            old-id (db.country/country-by-code db {:name "IDN"})
            ;; get the old country.json id
            old-json-id (-> (filter #(= "IDN" (:iso_code %))
                                    (seeder/get-data "countries"))
                            first :id)]
        (is (= old-json-id (old-id :id)))))
    (let [me (dummy/get-or-create-profile
              db "test@akvo.org" "Testing Profile" "ADMIN" "APPROVED")
          country (db.country/country-by-code db {:name "IDN"})
          _ (db.stakeholder/update-stakeholder db {:country (:id country)
                                                   :id (:id me)})
          me (db.stakeholder/stakeholder-by-email db me)
          ;; for updater
          cache-id (seeder/get-cache-id)]
      (testing "create stakeholder with old-id"
        (is (= "IDN" (:country me))))
      (db.util/country-id-updater db cache-id mapping-file {:revert? false})
      ;; Reseeding country with new file
      (seeder/seed-countries db {:old false})
      (let [new-id (db.country/country-by-code db {:name "IDN"})
            new-json-id (-> (filter #(= "IDN" (:iso_code %))
                                    (seeder/get-data "new_countries"))
                            first :id)
            old-json-id (-> (filter #(= "IDN" (:iso_code %))
                                    (seeder/get-data "countries"))
                            first :id)]
        (testing "the new id in db is not equal to old id"
          (is (= new-json-id (new-id :id)))
          (is (not= old-json-id (new-id :id))))
        (db.util/revert-constraint db cache-id)
        (let [new-me (db.stakeholder/stakeholder-by-email db me)]
          (testing "My new country id is changed"
            (is (= "IDN" (:country new-me)))))))))

(deftest revert-update-country-test
  (let [db (test-util/db-test-conn)
        countries-new (seeder/get-data "new_countries")
        countries-old (filter #(-> % :name str/trim not-empty) (seeder/get-data "countries"))
        ;; seed countries with old id
        _ (seeder/seed-countries db {:old true})
        me (dummy/get-or-create-profile
            db "test@akvo.org" "Testing Profile" "ADMIN" "APPROVED")
        country (db.country/country-by-code db {:name "IDN"})
        _ (db.stakeholder/update-stakeholder db {:country (:id country)
                                                 :id (:id me)})
        me (db.stakeholder/stakeholder-by-email db me)]
    (seeder/updater-country db)
    (testing "my country id is updated"
      (is (= "IDN" (:country me)))
      (is (= (count (db.country/all-countries db)) (count countries-new))))
    (seeder/updater-country db {:revert? true})
    (testing "my country id is reversed"
      (is (= "IDN" (:country me)))
      (is (= (count (db.country/all-countries db)) (count countries-old))))))

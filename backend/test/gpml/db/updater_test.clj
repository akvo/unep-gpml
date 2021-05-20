(ns gpml.db.updater-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [clojure.java.io :as io]
            [clojure.string :as str]
            [gpml.fixtures :as fixtures]
            [gpml.seeder.db :as db.seeder]
            [gpml.seeder.main :as seeder]
            [gpml.seeder.dummy :as dummy]
            [gpml.test-util :as test-util]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.initiative :as db.initiative]
            [gpml.db.country :as db.country]))

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
        (let [ ;; countries not available on the new map
              new-map-deleted ["Ascencion (UK)" "Gough (UK)" "Tristan da Cunha (UK)"]]
          (is (or
               ;; countries which are not available on the new json
               (.contains new-map-deleted (:name country-old))
               ;; old country is an empty string
               (empty? (str/trim (:name country-old)))
               ;; old country is available on the new_countries_mapping.json
               (.contains old-ids (:id country-old)))))))))

(deftest country-table-foreign-key-checks
  (let [db (test-util/db-test-conn)
        fkeys (db.seeder/get-foreign-key db {:table "country"})
        fkey (mapv #(:tbl %) (:deps fkeys))]

    ;; Sanity checks for DB foreign keys
    (testing (str "foreign project_countries is available")
      (is (.contains fkey "project_country")))
    (doseq [topic ["event" "organisation"
                   "policy" "resource"
                   "stakeholder" "technology"]]
      (testing (str "foreign " topic " is available")
        (is (.contains fkey topic)))
      (testing (str "foreign " topic "_geo_coverage is available")
        (is (.contains fkey (str topic "_geo_coverage")))))))

(deftest update-country-test
  (let [db (test-util/db-test-conn)]
    (seeder/seed-languages db)
    (testing "seed using old ids"
      (seeder/resync-country db {:old? true})
      (let [ ;; get id from database
            old-id (db.country/country-by-code db {:name "CYP"})
            ;; get the old country.json id
            old-json-id (-> (filter #(= "CYP" (:iso_code %))
                                    (seeder/get-data "countries"))
                            first :id)]
        (is (= old-json-id (old-id :id)))))

    (let [me (dummy/get-or-create-profile
              db "test@akvo.org" "Testing Profile" "ADMIN" "APPROVED")
          country (db.country/country-by-code db {:name "CYP"})
          _ (db.stakeholder/update-stakeholder db {:country (:id country)
                                                   :id (:id me)})
          me (db.stakeholder/stakeholder-by-email db me)
          ;; transnational initiative
          tn-initiative-data (seeder/parse-data
                              (slurp (io/resource "examples/initiative-transnational.json"))
                              {:keywords? true})
          tn-initiative-id (db.initiative/new-initiative db tn-initiative-data)
          tn-initiative (db.initiative/initiative-by-id db tn-initiative-id)]

      (testing "create stakeholder with old-id"
        (is (= "CYP" (:country me))))

      ;; Run the country updater!
      (seeder/updater-country db {:revert? false})

      (let [new-id (db.country/country-by-code db {:name "CYP"})
            new-json-id (-> (filter #(= "CYP" (:iso_code %))
                                    (seeder/get-data "new_countries"))
                            first :id)
            old-json-id (-> (filter #(= "CYP" (:iso_code %))
                                    (seeder/get-data "countries"))
                            first :id)
            ;; country-id-mapping (seeder/get-data "new_countries_mapping")
            ]

        (testing "the new id in db is not equal to old id"
          (is (= new-json-id (new-id :id)))
          (is (not= old-json-id (new-id :id))))

        (let [new-me (db.stakeholder/stakeholder-by-email db me)]
          (testing "My new country id is changed"
            (is (= "CYP" (:country new-me)))))

        (testing "Initiative country ID changes correctly"
          (let [new-tn-initiative (db.initiative/initiative-by-id db tn-initiative-id)
                country-new (:q23 new-tn-initiative)
                country-old (:q23 tn-initiative)]
            (is (= (vals country-new) (vals country-old)))
            ;; FIXME: Change check to be better using country-id-mapping?
            (is (not (= (keys country-new) (keys country-old))))
            ;; FIXME: Check q24_4
            (println (:q24_4 new-tn-initiative))))))))

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

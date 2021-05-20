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

;; below countries is not available on the map
(def tobe-deleted ["Ascencion (UK)" "Gough (UK)" "Tristan da Cunha (UK)"])

(deftest update-country-test
  (let [db (test-util/db-test-conn)
        fkeys (db.seeder/get-foreign-key db {:table "country"})
        fkey (mapv #(:tbl %) (:deps fkeys))
        new-files (seeder/get-data "new_countries")
        old-files (seeder/get-data "countries")
        new-countries (mapv #(:name %) new-files)
        mapping-file (seeder/get-data "new_countries_mapping")
        old-ids (mapv #(-> % first name read-string) mapping-file) ]
    (seeder/seed-languages db)

    (testing "mapping is correct"
      (doseq [mapping mapping-file]
        (let [old-id (-> mapping first name read-string)
              new-id (-> mapping second)
              country-new (first (filter #(= new-id (:id %)) new-files))
              country-old (first (filter #(= old-id (:id %)) old-files))
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

    (doseq [old-file old-files]
      (testing (str (:name old-file) " is available in new map")
        (let [is-true
              (or ;; countries which are not available on the new json
               (.contains tobe-deleted (:name old-file))
               ;; old country name has exact name with the new one
               (.contains new-countries (:name old-file))
               ;; old country is available on the new_countries_mapping.json
               (.contains old-ids (:id old-file))
               ;; old country is an empty string
               (empty? (str/trim (:name old-file))))]
          (when-not is-true
            (println (str "WARNING" (:name old-file) " will be removed")))
          (is is-true))))
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
        new-files (seeder/get-data "new_countries")
        old-files (filter #(-> % :name str/trim not-empty) (seeder/get-data "countries"))
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
      (is (= (count (db.country/all-countries db)) (count new-files))))
    (seeder/updater-country db {:revert? true})
    (testing "my country id is reversed"
      (is (= "IDN" (:country me)))
      (is (= (count (db.country/all-countries db)) (count old-files))))))

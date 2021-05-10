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
        old-ids (mapv #(Integer. (name (first %))) mapping-file) ]
    (testing "mapping is correct"
      (doseq [mapping mapping-file]
        (let [old-id (-> mapping first name Integer.)
              new-id (-> mapping second)
              new-file (filter #(= new-id (:id %)) new-files)
              old-file (filter #(= old-id (:id %)) old-files)]
            (is (= (:iso_code new-file) (:iso_code old-file)))
            (is (= (:id new-file) (:id old-file))))))
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
        (db.util/country-id-updater db cache-id mapping-file)
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

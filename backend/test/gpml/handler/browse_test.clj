(ns gpml.handler.browse-test
  (:require [clojure.string :as str]
            [clojure.test :refer [deftest testing is are use-fixtures]]
            #_[gpml.db.browse :as db.browse]
            #_[gpml.db.country :as db.country]
            #_[gpml.db.country-group :as db.country-group]
            #_[gpml.db.policy :as db.policy]
            #_[gpml.db.resource :as db.resource]
            [gpml.fixtures :as fixtures]
            [gpml.handler.browse :as browse]
            #_[integrant.core :as ig]
            [malli.core :as malli]
            #_[ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(deftest query-params
  (testing "Country query parameter validation"
    (let [valid? #(malli/validate [:re browse/country-re] %)]
      (are [expected value] (= expected (valid? value))
        true "NLD"
        true "NLD,HND"
        true "NLD,HND,ESP,IDN,IND"
        false ""
        false " "
        false ","
        false ",,"
        false "ESP,IDN,"
        false "esp"
        false "esp,usa")))
  (testing "Topic query parameter validation"
    (let [valid? #(malli/validate [:re browse/topic-re] %)]
      (is (true? (every? valid? browse/topics)))
      (are [expected value] (= expected (valid? value))
        true "technology,project"
        true "resource,event"
        true "people,event,policy"
        true (str/join "," browse/topics)
        false "technology,"
        false "technology,event,"
        false ""
        false " "
        false ","
        false ",,"))))

#_(defn- sample-policy
  [conn]
  (db.country-group/new-country-group conn {:name "Group1"
                                            :type "mea"})

  (db.country/new-country conn {:name "Country 1"
                                :iso_code "ISO"})

  (db.policy/new-policy conn {:title "The Litter Act"
                              :original_title ""
                              :data_source "Goverment"
                              :country 1
                              :abstract "This is a long abstract from the policy"
                              :type_of_law "Legislation"
                              :record_number "Cap 250"
                              :first_publication_date "2007-12-31T00:00:00+00"
                              :latest_amendment_date "2007-12-31T00:00:00+00"
                              :status "In force"
                              :geo_coverage_type "global"
                              :attachments ["https://url.com/file.pdf"]
                              :implementing_mea 1
                              :remarks "Shall I compare thee to a summer's day? Thou art more lovely and more temperate: Rough winds do shake the darling buds of May, And summer's lease hath all too short a date:"}))

#_(deftest policy-filter
  (testing "Filtering policy by search text"
    (let [conn (-> fixtures/*system*
                   (ig/init [:duct.database/sql])
                   :duct.database.sql/hikaricp
                   :spec)
          _ (sample-policy conn)]
      (is (true? true))
     )))

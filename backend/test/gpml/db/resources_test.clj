(ns gpml.db.resources-test
  (:require
   [clojure.test :refer [deftest is testing use-fixtures]]
   [gpml.db.country :as db.country]
   [gpml.db.country-group :as db.country-group]
   [gpml.db.event :as db.event]
   [gpml.db.resources :as db.resources]
   [gpml.fixtures :as fixtures]
   [gpml.seeder.main :as seeder]
   [gpml.test-util :as test-util]))

(use-fixtures :each fixtures/with-test-system)

(deftest resources-filtering
  (let [db (test-util/db-test-conn)
        _ (seeder/seed db {:country? true
                           :technology? true})]
    (testing "Simple filter"
      (is (not-empty (db.resources/get-resources db {}))))))

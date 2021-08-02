(ns gpml.handler.organisation-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.handler.profile-test :as profile-test]
            [gpml.fixtures :as fixtures]
            [gpml.handler.organisation :as organisation]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(deftest handler-post-with-new-organisation-test
  (testing "New profile is created with new organisation"
    (let [system (ig/init fixtures/*system* [::organisation/post])
          handler (::organisation/post system)
          db (-> system :duct.database.sql/hikaricp :spec)
          data (profile-test/seed-important-database db)
          body-params {:name "My nown company"
                       :geo_coverage_type "regional"
                       :country (-> (:countries data) second :id)
                       :type "Company"
                       :url "mycompany.org"}
          resp (handler (-> (mock/request :post "/")
                            (assoc :jwt-claims {:email "john@org" :picture "test.jpg"})
                            (assoc :body-params body-params)))]
      (is (= 201 (:status resp)))
      (is (= (assoc body-params :id 10001) (:body resp))))))

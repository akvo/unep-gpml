(ns gpml.handler.organisation-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.fixtures :as fixtures]
            [gpml.handler.organisation :as organisation]
            [gpml.handler.profile :as profile]
            [gpml.handler.profile-test :as profile-test]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(deftest handler-post-with-new-organisation-test
  (testing "New profile is created with new organisation"
    (let [system          (ig/init fixtures/*system* [::organisation/post ::profile/post])
          profile-handler (::profile/post system)
          org-handler     (::organisation/post system)
          db              (-> system :duct.database.sql/hikaricp :spec)
          data            (profile-test/seed-important-database db)
          profile         (assoc (profile-test/new-profile 1)
                         :org nil
                         :organisation_role nil
                         :geo_coverage_value (mapv :id (:country_groups data))
                         :tags (mapv :id (:tags data))
                         :country (-> (:countries data) first :id)
                         :photo profile-test/picture)
          body-params     {:name              "test10001"
                           :geo_coverage_type "regional"
                           :country           (-> (:countries data) second :id)
                           :type              "Company"
                           :url               "mycompany.org"
                           :stakeholder       "juan@akvo.org"}
          jwt-claims      {:email "john@org" :picture "test.jpg"}
          _               (profile-handler (-> (mock/request :post "/")
                                 (assoc :jwt-claims jwt-claims)
                                 (assoc :body-params profile)))
          resp            (org-handler (-> (mock/request :post "/")
                                (assoc :jwt-claims jwt-claims)
                                (assoc :body-params body-params)))]
      (is (= 201 (:status resp)))
      (is (= (assoc body-params :id 10001) (:body resp))))))

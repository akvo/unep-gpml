(ns gpml.handler.organisation-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.db.invitation :as db.invitation]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.fixtures :as fixtures]
            [gpml.handler.organisation :as organisation]
            [gpml.handler.stakeholder :as stakeholder]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(deftest handler-post-with-new-organisation-with-non-existent-second-contact-test
  (testing "New profile is created with new organisation"
    (let [system          (ig/init fixtures/*system* [::organisation/post ::stakeholder/post])
          profile-handler (::stakeholder/post system)
          org-handler     (::organisation/post system)
          db              (-> system :duct.database.sql/hikaricp :spec)
          created-by      (format "created_by_%s@akvo.org" (fixtures/uuid))
          profile         {:email created-by
                           :first_name "John"
                           :geo_coverage_type nil
                           :affiliation nil
                           :title "Mr"
                           :public_email false
                           :public_database false
                           :representation ""
                           :picture nil
                           :last_name "Doe"
                           :country nil
                           :idp_usernames ["auth0|123"]}
          _ (db.stakeholder/new-stakeholder db profile)
          stakeholder     (format "stakeholder_%s@akvo.org" (fixtures/uuid))
          body-params     {:name              "test10001"
                           :geo_coverage_type "regional"
                           :country           nil
                           :type              "Company"
                           :url               "mycompany.org"
                           :stakeholder       stakeholder}
          jwt-claims      {:email "john@org" :picture "test.jpg"}
          _               (profile-handler (-> (mock/request :post "/")
                                               (assoc :jwt-claims jwt-claims)
                                               (assoc :body-params profile)))
          _               (is (nil? (db.invitation/invitation-by-email db {:email stakeholder})))
          resp            (org-handler (-> (mock/request :post "/")
                                           (assoc :jwt-claims jwt-claims)
                                           (assoc :body-params body-params)))
;;          mails           @fixtures/mails-sent
          ]
      (is (= 201 (:status resp)))
      (is (some? (db.invitation/invitation-by-email db {:email stakeholder})))
      (is (= (assoc body-params :id 10001) (:body resp)))
      ;; (is (= 1 (count mails)))
      ;; (is (= (-> mails first :receivers) (list {:Name stakeholder, :Email stakeholder})))
      ;; (is (= (-> mails first :subject) "Mr. John Doe has invited you to join UNEP GPML Digital Platform"))
      ;; (is (= (-> mails first :texts first) "Dear user,\n\nMr. John Doe has invited you to join http://localhost as part of entity test10001. Please visit http://localhost/stakeholder-signup and follow instructions to signup.\n\n- UNEP GPML Digital Platform\n"))
      )))

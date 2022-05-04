(ns gpml.handler.review-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.fixtures :as fixtures]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.review :as db.review]
            [gpml.handler.review :as review]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(defn- new-stakeholder [db email first_name last_name role review_status]
  (let [info {:picture "https://picsum.photos/200"
              :affiliation nil
              :country nil
              :representation ""
              :geo_coverage_type nil
              :title "Mr."
              :first_name first_name
              :last_name last_name
              :email email
              :idp_usernames ["auth0|123"]}
        sth (db.stakeholder/new-stakeholder db info)]
    (db.stakeholder/update-stakeholder-status db (assoc sth :review_status review_status))
    (db.stakeholder/update-stakeholder-role db (assoc sth :role role))
    sth))

(deftest get-reviewers-test
  (testing "Get reviewers endpoint returns non empty response"
    (let [system (ig/init fixtures/*system* [::review/get-reviewers])
          handler (::review/get-reviewers system)
          db (-> system :duct.database.sql/hikaricp :spec)
          ;; Reviewers
          _ (new-stakeholder db "reviewer-approved@org.com" "R" "A" "REVIEWER" "APPROVED")
          _ (new-stakeholder db "reviewer-submitted@org.com" "R" "S" "REVIEWER" "SUBMITTED")
          ;; Admins
          _ (new-stakeholder db "admin-approved@org.com" "A" "A" "ADMIN" "APPROVED")
          _ (new-stakeholder db "admin-submitted@org.com" "A" "S" "ADMIN" "SUBMITTED")
          ;; User
          _ (new-stakeholder db "user-approved@org.com" "U" "A" "USER" "APPROVED")
          _ (new-stakeholder db "user-submitted@org.com" "U" "S" "USER" "SUBMITTED")
          resp (handler (mock/request :get "/"))
          body (:body resp)]
      (is (= 200 (:status resp)))
      (is (= 2 (count body)))
      (is (= #{"ADMIN" "REVIEWER"} (set (map :role body)))))))

(deftest get-topic-review
  (let [system (ig/init fixtures/*system* [::review/get-reviews])
        handler (::review/get-reviews system)
        db (-> system :duct.database.sql/hikaricp :spec)
        admin (new-stakeholder db "admin-approved@org.com" "R" "A" "ADMIN" "APPROVED")
        reviewer (new-stakeholder db "reviewer-approved@org.com" "R" "A" "REVIEWER" "APPROVED")
        user (new-stakeholder db "user-submitted@org.com" "U" "S" "USER" "SUBMITTED")]

    (testing "Fetching topic review when NO REVIEWER ASSIGNED"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc
                               :parameters {:path {:topic-type "stakeholder"
                                                   :topic-id (:id user)}})))
            body (:body resp)]
        (is (= 200 (:status resp)))
        (is (empty? body))))

    (testing "Fetching topic review when REVIEWER ASSIGNED"
      (let [stakeholder-id (:id user)
            _ (db.review/new-review db {:topic-type "stakeholder"
                                        :topic-id stakeholder-id
                                        :assigned-by (:id admin)
                                        :reviewer (:id reviewer)})
            resp (handler (-> (mock/request :get "/")
                              (assoc
                               :parameters {:path {:topic-type "stakeholder"
                                                   :topic-id (:id user)}})))
            body (:body resp)]
        (is (= 200 (:status resp)))
        (let [res body]
          (is (= (:id reviewer) (-> res first :reviewer)))
          (is (= (:id admin) (-> res first :assigned_by)))
          (is (= "stakeholder" (-> res first :topic_type)))
          (is (= (:id user) (-> res first :topic_id))))))))

(deftest new-review
  (let [system (ig/init fixtures/*system* [:gpml.handler.review/new-multiple-review])
        handler (:gpml.handler.review/new-multiple-review system)
        db (-> system :duct.database.sql/hikaricp :spec)
        admin (new-stakeholder db "admin-approved@org.com" "R" "A" "ADMIN" "APPROVED")
        reviewer1 (new-stakeholder db "reviewer1@org.com" "R" "A" "REVIEWER" "APPROVED")
        reviewer2 (new-stakeholder db "reviewer2@org.com" "R" "A" "REVIEWER" "APPROVED")
        user (new-stakeholder db "user-submitted@org.com" "U" "S" "USER" "SUBMITTED")]

    (testing "Assign new reviewer"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc
                               :admin admin
                               :parameters {:path {:topic-type "stakeholder"
                                                   :topic-id (:id user)}
                                            :body {:reviewers [(:id reviewer1) (:id reviewer2)]}})))
            body (:body resp)
            review (db.review/review-by-id db (first (:reviews body)))]
        (is (= 200 (:status resp)))
        (is (= (:reviewer review) (:id reviewer1)))
        (is (= (:assigned_by review) (:id admin)))
        (is (= (:topic_id review) (:id user)))))))

(deftest update-review
  (let [system (ig/init fixtures/*system* [::review/update-review])
        handler (::review/update-review system)
        db (-> system :duct.database.sql/hikaricp :spec)
        admin (new-stakeholder db "admin-approved@org.com" "R" "A" "ADMIN" "APPROVED")
        reviewer1 (new-stakeholder db "reviewer@org.com" "R" "A" "REVIEWER" "APPROVED")
        reviewer2 (new-stakeholder db "reviewer2@org.com" "R" "A" "REVIEWER" "APPROVED")
        user (new-stakeholder db "user@org.com" "U" "S" "USER" "SUBMITTED")]

    (testing "Updating unassigned review"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc
                               :parameters {:path {:topic-type "stakeholder"
                                                   :topic-id (:id user)}
                                            :body {:review-comment ""
                                                   :review-status "REJECTED"}})))]

        (is (= 403 (:status resp)))))

    (testing "Updating review assigned to another user"
      (let [_ (db.review/new-review db {:topic-type "stakeholder"
                                        :topic-id (:id user)
                                        :assigned-by (:id admin)
                                        :reviewer (:id reviewer1)})

            resp (handler (-> (mock/request :get "/")
                              (assoc
                               ;; Logging in as REVIEWER2 instead of REVEIWER
                               :reviewer reviewer2
                               :parameters {:path {:topic-type "stakeholder"
                                                   :topic-id (:id user)}
                                            :body {:review-comment ""
                                                   :review-status "REJECTED"}})))]
        (is (= 403 (:status resp)))))

    (testing "Rejecting a submission in a review"
      (let [comment "Missing lot of data"
            _ (println reviewer1)
            resp (handler (-> (mock/request :get "/")
                              (assoc
                               :reviewer reviewer1
                               :parameters {:path {:topic-type "stakeholder"
                                                   :topic-id (:id user)}
                                            :body {:review-comment comment
                                                   :review-status "REJECTED"}})))
            body (:body resp)
            review (db.review/review-by-id db body)]
        (is (= 200 (:status resp)))
        (is (= (:reviewer review) (:id reviewer1)))
        (is (= (:assigned_by review) (:id admin)))
        (is (= (:topic_id review) (:id user)))
        (is (= (:review_status review) "REJECTED"))
        (is (= (:review_comment review) comment))))

    (testing "Accepting a submission in a review"
      (let [comment "Best user!!!"
            resp (handler (-> (mock/request :get "/")
                              (assoc
                               :reviewer reviewer1
                               :parameters {:path {:topic-type "stakeholder"
                                                   :topic-id (:id user)}
                                            :body {:review-comment comment
                                                   :review-status "ACCEPTED"}})))
            body (:body resp)
            review (db.review/review-by-id db body)]
        (is (= 200 (:status resp)))
        (is (= (:reviewer review) (:id reviewer1)))
        (is (= (:assigned_by review) (:id admin)))
        (is (= (:topic_id review) (:id user)))
        (is (= (:review_status review) "ACCEPTED"))
        (is (= (:review_comment review) comment))))

    (testing "Changing reviewer as a REVIEWER"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc
                               :reviewer reviewer2
                               :parameters {:path {:topic-type "stakeholder"
                                                   :topic-id (:id user)}
                                            :body {:reviewer (:id reviewer1)}})))]
        (is (= 403 (:status resp)))))

    (testing "Changing reviewer as ADMIN"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc
                               :reviewer (assoc admin :role "ADMIN")
                               :parameters {:path {:topic-type "stakeholder"
                                                   :topic-id (:id user)}
                                            :body {:reviewers [(:id reviewer2)]}})))
            body (:body resp)
            review (db.review/review-by-id db (-> body :reviews first))]
        (is (= 200 (:status resp)))
        (is (= (:reviewer review) (:id reviewer2)))))))

(deftest list-reviews
  (let [system (ig/init fixtures/*system* [:gpml.handler.review/list-user-reviews])
        handler (:gpml.handler.review/list-user-reviews system)
        db (-> system :duct.database.sql/hikaricp :spec)
        admin (new-stakeholder db "admin-approved@org.com" "R" "A" "ADMIN" "APPROVED")
        reviewer (new-stakeholder db "reviewer@org.com" "R" "A" "REVIEWER" "APPROVED")
        reviewer2 (new-stakeholder db "reviewer2@org.com" "R" "A" "REVIEWER" "APPROVED")
        ;; Users to review
        emails (->> (range 10) (map #(str "user" % "@org.com")))
        users (->> emails
                   (map #(new-stakeholder db % "U" "S" "USER" "SUBMITTED")))
        ;; Assign reviews to first reviewer
        reviews1 (->> users
                      (take 5)
                      (mapv #(db.review/new-review
                              db
                              {:topic-type "stakeholder"
                               :topic-id (:id %)
                               :assigned-by (:id admin)
                               :reviewer (:id reviewer)})))
        ;; Assign reviews to second reviewer
        reviews2 (->> users
                      (take-last 5)
                      (mapv #(db.review/new-review
                              db
                              {:topic-type "stakeholder"
                               :topic-id (:id %)
                               :assigned-by (:id admin)
                               :reviewer (:id reviewer2)})))]

    (testing "Listing reviews for a user"
      (let [resp1 (handler (-> (mock/request :get "/")
                               (assoc
                                :reviewer reviewer
                                :parameters {:query {:page 1 :limit 10}})))
            body1 (:body resp1)
            resp2 (handler (-> (mock/request :get "/")
                               (assoc
                                :reviewer reviewer2
                                :parameters {:query {:page 1 :limit 10}})))
            body2 (:body resp2)]

        (is (= 5 (count (:reviews body1))))
        (is (= 5 (:count body1)))
        (is (= (map :id reviews1) (->> body1 :reviews (map :id))))

        (is (= 5 (count (:reviews body2))))
        (is (= 5 (:count body2)))
        (is (= (map :id reviews2) (->> body2 :reviews (map :id))))))

    (testing "Testing pagination when listing reviews for a user"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc
                               :reviewer reviewer2
                               :parameters {:query {:page 2 :limit 2}})))
            body (:body resp)]
        (is (= 2 (count (:reviews body))))
        (is (= 5 (:count body)))
        (is (= 3 (:pages body)))
        (is (= (->> reviews2 (map :id) (drop 2) (take 2))
               (->> body :reviews (map :id))))))

    (testing "Testing querying reviews by status"
      (let [resp1 (handler (-> (mock/request :get "/")
                               (assoc
                                :reviewer reviewer2
                                :parameters {:query {:page 1 :limit 10 :review-status "PENDING,REJECTED"}})))
            body1 (:body resp1)

            resp2 (handler (-> (mock/request :get "/")
                               (assoc
                                :reviewer reviewer2
                                :parameters {:query {:page 1 :limit 10 :review-status "ACCEPTED"}})))
            body2 (:body resp2)]

        (is (= 5 (count (:reviews body1))))
        (is (= 5 (:count body1)))
        (is (= (map :id reviews2) (->> body1 :reviews (map :id))))

        (is (= 0 (count (:reviews body2))))
        (is (= 0 (:count body2)))
        (is (= () (->> body2 :reviews (map :id))))))))

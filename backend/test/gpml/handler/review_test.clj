(ns gpml.handler.review-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.db.review :as db.review]
            [gpml.fixtures :as fixtures]
            [gpml.handler.resource.permission :as h.r.permission]
            [gpml.handler.review :as review]
            [gpml.service.permissions :as srv.permissions]
            [gpml.test-util :as test-util]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(defn- create-review
  [{:keys [db logger]} topic-type topic-id assigned-by reviewer-id]
  (let [conn (:spec db)
        review (db.review/new-review
                conn
                {:topic-type topic-type
                 :topic-id topic-id
                 :assigned-by assigned-by
                 :reviewer reviewer-id})]
    (srv.permissions/assign-roles-to-users
     {:conn conn
      :logger logger}
     [{:role-name :resource-reviewer
       :context-type (h.r.permission/entity-type->context-type topic-type)
       :resource-id topic-id
       :user-id reviewer-id}])
    review))

(deftest get-reviewers-test
  (let [system (ig/init fixtures/*system* [::review/get-reviewers])
        config (get system [:duct/const :gpml.config/common])
        handler (::review/get-reviewers system)]
    (testing "Get reviewers endpoint returns non empty response"
      (let [admin-id (test-util/create-test-stakeholder config
                                                        "john.doe@mail.invalid"
                                                        "APPROVED"
                                                        "ADMIN")
            ;; Reviewers
            _ (test-util/create-test-stakeholder config
                                                 "reviewer-approved@org.com"
                                                 "APPROVED"
                                                 "REVIEWER")
            _ (test-util/create-test-stakeholder config
                                                 "reviewer-submitted@org.com"
                                                 "SUBMITTED"
                                                 "REVIEWER")
            ;; Admins
            _ (test-util/create-test-stakeholder config
                                                 "admin-submitted@org.com"
                                                 "SUBMITTED"
                                                 "ADMIN")
            ;; User
            _ (test-util/create-test-stakeholder config
                                                 "user-approved@org.com"
                                                 "APPROVED"
                                                 "USER")
            _ (test-util/create-test-stakeholder config
                                                 "user-submitted@org.com"
                                                 "SUBMITTED"
                                                 "USER")
            resp (handler (-> (mock/request :get "/")
                              (assoc :user {:id admin-id})))
            body (:body resp)]
        (is (= 200 (:status resp)))
        (is (:success? body))
        (is (= 3 (count (:reviewers body))))
        (is (= #{"USER" "ADMIN" "REVIEWER"} (set (map :role (:reviewers body)))))))
    (testing "Get reviewers failed when caller user doesn't have enough permissions"
      (let [sth-id (test-util/create-test-stakeholder config
                                                      "john.doe2@mail.invalid"
                                                      "APPROVED"
                                                      "USER")
            resp (handler (-> (mock/request :get "/")
                              (assoc :user {:id sth-id})))]
        (is (= 403 (:status resp)))))))

(deftest get-topic-review
  (let [system (ig/init fixtures/*system* [::review/get-reviews])
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        logger (get config :logger)
        handler (::review/get-reviews system)
        admin-id (test-util/create-test-stakeholder config
                                                    "john.doe@mail.invalid"
                                                    "APPROVED"
                                                    "ADMIN")
        ;; Reviewers
        reviewer-id (test-util/create-test-stakeholder config
                                                       "reviewer-approved@org.com"
                                                       "APPROVED"
                                                       "REVIEWER")
        user-id (test-util/create-test-stakeholder config
                                                   "user-submitted@org.com"
                                                   "SUBMITTED"
                                                   "USER")]

    (testing "Fetching topic review when NO REVIEWER ASSIGNED"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc
                               :user {:id admin-id}
                               :parameters {:path {:topic-type "stakeholder"
                                                   :topic-id user-id}})))
            body (:body resp)]
        (is (= 200 (:status resp)))
        (is (empty? body))))

    (testing "Fetching topic review when REVIEWER ASSIGNED"
      (let [_ (db.review/new-review conn {:topic-type "stakeholder"
                                          :topic-id user-id
                                          :assigned-by admin-id
                                          :reviewer reviewer-id})
            _ (srv.permissions/assign-roles-to-users
               {:conn conn
                :logger logger}
               [{:role-name :resource-reviewer
                 :context-type :stakeholder
                 :resource-id user-id
                 :user-id reviewer-id}])
            resp (handler (-> (mock/request :get "/")
                              (assoc
                               :user {:id admin-id}
                               :parameters {:path {:topic-type "stakeholder"
                                                   :topic-id user-id}})))
            body (:body resp)]
        (is (= 200 (:status resp)))
        (let [res body]
          (is (= reviewer-id (-> res first :reviewer)))
          (is (= admin-id (-> res first :assigned_by)))
          (is (= "stakeholder" (-> res first :topic_type)))
          (is (= user-id (-> res first :topic_id))))))))

(deftest new-review
  (let [system (ig/init fixtures/*system* [:gpml.handler.review/new-multiple-review])
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        handler (:gpml.handler.review/new-multiple-review system)
        admin-id (test-util/create-test-stakeholder config
                                                    "john.doe@mail.invalid"
                                                    "APPROVED"
                                                    "ADMIN")
        reviewer-1-id (test-util/create-test-stakeholder config
                                                         "reviewer1@org.com"
                                                         "APPROVED"
                                                         "REVIEWER")
        reviewer-2-id (test-util/create-test-stakeholder config
                                                         "reviewer2@org.com"
                                                         "APPROVED"
                                                         "REVIEWER")
        user-id (test-util/create-test-stakeholder config
                                                   "user-submitted@org.com"
                                                   "SUBMITTED"
                                                   "USER")]

    (testing "Assign new reviewer"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc
                               :user {:id admin-id}
                               :parameters {:path {:topic-type "stakeholder"
                                                   :topic-id user-id}
                                            :body {:reviewers [reviewer-1-id reviewer-2-id]}})))
            body (:body resp)
            review (db.review/review-by-id conn (first (:reviews body)))]
        (is (= 200 (:status resp)))
        (is (= (:reviewer review) reviewer-1-id))
        (is (= (:assigned_by review) admin-id))
        (is (= (:topic_id review) user-id))))))

(deftest update-review
  (let [system (ig/init fixtures/*system* [::review/update-review])
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        logger (get config :logger)
        handler (::review/update-review system)
        admin-id (test-util/create-test-stakeholder config
                                                    "john.doe@mail.invalid"
                                                    "APPROVED"
                                                    "ADMIN")
        reviewer-1-id (test-util/create-test-stakeholder config
                                                         "reviewer1@org.com"
                                                         "APPROVED"
                                                         "REVIEWER")
        reviewer-2-id (test-util/create-test-stakeholder config
                                                         "reviewer2@org.com"
                                                         "APPROVED"
                                                         "REVIEWER")
        user-id (test-util/create-test-stakeholder config
                                                   "user-submitted@org.com"
                                                   "SUBMITTED"
                                                   "USER")]

    (testing "Updating unassigned review"
      (let [resp (handler (-> (mock/request :patch "/")
                              (assoc
                               :user {:id reviewer-1-id}
                               :parameters {:path {:topic-type "stakeholder"
                                                   :topic-id user-id}
                                            :body {:review-comment ""
                                                   :review-status "REJECTED"}})))]

        (is (= 403 (:status resp)))))

    (testing "Updating review assigned to another user"
      (let [_ (db.review/new-review conn {:topic-type "stakeholder"
                                          :topic-id user-id
                                          :assigned-by admin-id
                                          :reviewer reviewer-1-id})
            _ (srv.permissions/assign-roles-to-users
               {:conn conn
                :logger logger}
               [{:role-name :resource-reviewer
                 :context-type :stakeholder
                 :resource-id user-id
                 :user-id reviewer-1-id}])
            resp (handler (-> (mock/request :patch "/")
                              (assoc
                               ;; Logging in as REVIEWER2 instead of REVEIWER
                               :user {:id reviewer-2-id}
                               :parameters {:path {:topic-type "stakeholder"
                                                   :topic-id user-id}
                                            :body {:review-comment ""
                                                   :review-status "REJECTED"}})))]
        (is (= 403 (:status resp)))))

    (testing "Rejecting a submission in a review"
      (let [comment "Missing lot of data"
            resp (handler (-> (mock/request :patch "/")
                              (assoc
                               :user {:id  reviewer-1-id}
                               :parameters {:path {:topic-type "stakeholder"
                                                   :topic-id user-id}
                                            :body {:review-comment comment
                                                   :review-status "REJECTED"}})))
            body (:body resp)
            review (db.review/review-by-id conn body)]
        (is (= 200 (:status resp)))
        (is (= (:reviewer review) reviewer-1-id))
        (is (= (:assigned_by review) admin-id))
        (is (= (:topic_id review) user-id))
        (is (= (:review_status review) "REJECTED"))
        (is (= (:review_comment review) comment))))

    (testing "Accepting a submission in a review"
      (let [comment "Best user!!!"
            resp (handler (-> (mock/request :patch "/")
                              (assoc
                               :user {:id reviewer-1-id}
                               :parameters {:path {:topic-type "stakeholder"
                                                   :topic-id user-id}
                                            :body {:review-comment comment
                                                   :review-status "ACCEPTED"}})))
            body (:body resp)
            review (db.review/review-by-id conn body)]
        (is (= 200 (:status resp)))
        (is (= (:reviewer review) reviewer-1-id))
        (is (= (:assigned_by review) admin-id))
        (is (= (:topic_id review) user-id))
        (is (= (:review_status review) "ACCEPTED"))
        (is (= (:review_comment review) comment))))

    (testing "Changing reviewer as a REVIEWER"
      (let [resp (handler (-> (mock/request :patch "/")
                              (assoc
                               :user {:id reviewer-2-id}
                               :parameters {:path {:topic-type "stakeholder"
                                                   :topic-id user-id}
                                            :body {:reviewer reviewer-1-id}})))]
        (is (= 403 (:status resp)))))

    (testing "Changing reviewer as ADMIN"
      (let [resp (handler (-> (mock/request :patch "/")
                              (assoc
                               :user {:id admin-id}
                               :parameters {:path {:topic-type "stakeholder"
                                                   :topic-id user-id}
                                            :body {:reviewers [reviewer-2-id]}})))
            body (:body resp)
            review (db.review/review-by-id conn (-> body :reviews first))]
        (is (= 200 (:status resp)))
        (is (= (:reviewer review) reviewer-2-id))))))

(deftest list-reviews
  (let [system (ig/init fixtures/*system* [:gpml.handler.review/list-user-reviews])
        config (get system [:duct/const :gpml.config/common])
        handler (:gpml.handler.review/list-user-reviews system)
        admin-id (test-util/create-test-stakeholder config
                                                    "john.doe@mail.invalid"
                                                    "APPROVED"
                                                    "ADMIN")
        reviewer-1-id (test-util/create-test-stakeholder config
                                                         "reviewer1@org.com"
                                                         "APPROVED"
                                                         "REVIEWER")
        reviewer-2-id (test-util/create-test-stakeholder config
                                                         "reviewer2@org.com"
                                                         "APPROVED"
                                                         "REVIEWER")
        ;; Users to review
        emails (->> (range 10) (map #(str "user" % "@org.com")))
        users-ids (->> emails
                       (map #(test-util/create-test-stakeholder config
                                                                %
                                                                "SUBMITTED"
                                                                "USER")))
        ;; Assign reviews to first reviewer
        reviews1 (->> users-ids
                      (take 5)
                      (mapv #(create-review config "stakeholder" % admin-id reviewer-1-id)))
        ;; Assign reviews to second reviewer
        reviews2 (->> users-ids
                      (take-last 5)
                      (mapv #(create-review config "stakeholder" % admin-id reviewer-2-id)))]

    (testing "Listing reviews for a user"
      (let [resp1 (handler (-> (mock/request :get "/")
                               (assoc
                                :user {:id reviewer-1-id}
                                :parameters {:query {:page 1 :limit 10}})))
            body1 (:body resp1)
            resp2 (handler (-> (mock/request :get "/")
                               (assoc
                                :user {:id reviewer-2-id}
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
                               :user {:id  reviewer-2-id}
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
                                :user {:id  reviewer-2-id}
                                :parameters {:query {:page 1 :limit 10 :review-status "PENDING,REJECTED"}})))
            body1 (:body resp1)

            resp2 (handler (-> (mock/request :get "/")
                               (assoc
                                :user {:id reviewer-2-id}
                                :parameters {:query {:page 1 :limit 10 :review-status "ACCEPTED"}})))
            body2 (:body resp2)]

        (is (= 5 (count (:reviews body1))))
        (is (= 5 (:count body1)))
        (is (= (map :id reviews2) (->> body1 :reviews (map :id))))

        (is (= 0 (count (:reviews body2))))
        (is (= 0 (:count body2)))
        (is (= () (->> body2 :reviews (map :id))))))))

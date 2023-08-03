(ns gpml.handler.comment-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.db.comment :as db.comment]
            [gpml.fixtures :as fixtures]
            [gpml.handler.comment :as sut]
            [gpml.seeder.main :as seeder]
            [gpml.test-util :as test-util]
            [gpml.util :as util]
            [integrant.core :as ig]
            [java-time :as time]
            [java-time.pre-java8 :as time-pre-j8]
            [malli.core :as m]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(defn- random-comment-data [author-id resource-id resource-type]
  {:author_id author-id
   :resource_id resource-id
   :resource_type resource-type
   :title "Dummy title"
   :content "Dummy content"})

(deftest create-comment-test
  (let [system (-> fixtures/*system*
                   (ig/init [::sut/post]))
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        handler (::sut/post system)
        _ (seeder/seed conn {:country? true :event? true})
        sth-id (test-util/create-test-stakeholder config
                                                  "john.doe@mail.invalid"
                                                  "APPROVED"
                                                  "USER")]
    (testing "Create a comment successfully"
      (let [comment-payload (random-comment-data sth-id 1 "event")
            request (-> (mock/request :post "/")
                        (assoc :parameters {:body comment-payload}
                               :user {:id sth-id}))
            {:keys [status body]} (handler request)]
        (is (= 200 status))
        (is (seq (:comment body)))
        (is (= (get-in body [:comment :author_id]) sth-id))))
    (testing "User don't have the necessary permissions to comment"
      (let [sth-id (test-util/create-test-stakeholder config
                                                      "john.doe2@mail.invalid"
                                                      "SUBMITTED"
                                                      "USER")
            comment-payload (random-comment-data sth-id 1 "event")
            request (-> (mock/request :post "/")
                        (assoc :parameters {:body comment-payload}
                               :user {:id sth-id}))
            {:keys [status]} (handler request)]
        (is (= 403 status))))
    (testing "Fails validation due to missing required parameters"
      (let [comment-payload (dissoc (random-comment-data sth-id 1 "event") :author_id)]
        (is (not (m/validate sut/create-comment-params comment-payload)))
        (is (some #{::m/missing-key} (map :type (:errors (m/explain sut/create-comment-params comment-payload)))))))
    (testing "Fails validation due to invalid parameter schema"
      (let [comment-payload (assoc (random-comment-data sth-id 1 "event") :author_id "1")]
        (is (not (m/validate sut/create-comment-params comment-payload)))))))

(deftest get-comment-test
  (let [system (-> fixtures/*system*
                   (ig/init [::sut/get]))
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        handler (::sut/get system)
        _ (seeder/seed conn {:country? true :event? true})
        sth-id (test-util/create-test-stakeholder config
                                                  "john.doe@mail.invalid"
                                                  "APPROVED"
                                                  "USER")
        comment (db.comment/create-comment conn (-> (assoc (random-comment-data sth-id 1 "event")
                                                           :updated-at (time-pre-j8/sql-timestamp (time/instant) "UTC"))
                                                    (util/replace-in-keys #"_" "-")))]
    (testing "Get comments successfully"
      (let [request (-> (mock/request :get "/")
                        (assoc :parameters {:query {:resource_id "1" :resource_type "event"}}))
            {:keys [status body]} (handler request)]
        (is (= 200 status))
        (is (seq (:comments body)))))
    (testing "Fails Validation due to missing required parameters"
      (let [parameters {:resource_type "event"}]
        (is (not (m/validate sut/get-resource-comments-params parameters)))
        (is (some #{::m/missing-key} (map :type (:errors (m/explain sut/get-resource-comments-params parameters)))))))
    (testing "Validation fails due to invalid parameter schema"
      (let [parameters {:resource_type "event" :resource_id :a}]
        (is (not (m/validate sut/get-resource-comments-params parameters)))))
    (testing "Returns a tree like datastructure when there are comment replies"
      (let [reply-comment (db.comment/create-comment conn (-> (assoc (random-comment-data sth-id 1 "event")
                                                                     :parent-id (:id comment)
                                                                     :updated-at (time-pre-j8/sql-timestamp (time/instant) "UTC"))
                                                              (util/replace-in-keys #"_" "-")))
            request (-> (mock/request :get "/")
                        (assoc :parameters {:query {:resource_id "1" :resource_type "event"}}))
            {:keys [status body]} (handler request)]
        (is (= 200 status))
        (is (= (:id reply-comment) (-> body :comments first :children first :id)))))))

(deftest update-comment-test
  (let [system (-> fixtures/*system*
                   (ig/init [::sut/put]))
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        handler (::sut/put system)
        _ (seeder/seed conn {:country? true :event? true})
        sth-id (test-util/create-test-stakeholder config
                                                  "john.doe@mail.invalid"
                                                  "APPROVED"
                                                  "USER")
        comment (db.comment/create-comment conn (-> (assoc (random-comment-data sth-id 1 "event")
                                                           :updated-at (time-pre-j8/sql-timestamp (time/instant) "UTC"))
                                                    (util/replace-in-keys #"_" "-")))]
    (testing "Update a comment successfully"
      (let [request (-> (mock/request :put "/")
                        (assoc :parameters {:body {:id (:id comment)
                                                   :title "test comment"
                                                   :content "test content"}}
                               :user {:id sth-id}))
            {:keys [status body]} (handler request)
            updated-comment (first (db.comment/get-resource-comments conn {:id (:id comment)}))]
        (is (= 200 status))
        (is (= 1 (:updated-comments body)))
        (is (= "test comment" (:title updated-comment)))
        (is (= "test content" (:content updated-comment)))))
    (testing "Update a comment of another user should output unauthorized"
      (let [sth-id (test-util/create-test-stakeholder config
                                                      "john.doe2@mail.invalid"
                                                      "APPROVED"
                                                      "USER")
            request (-> (mock/request :put "/")
                        (assoc :parameters {:body {:id (:id comment)
                                                   :title "test comment"
                                                   :content "test content"}}
                               :user {:id sth-id}))
            {:keys [status]} (handler request)]
        (is (= 403 status))))
    (testing "Fails validation due to missing required parameters"
      (let [parameters {}]
        (is (not (m/validate sut/update-comment-params parameters)))
        (is (some #{::m/missing-key} (map :type (:errors (m/explain sut/update-comment-params parameters)))))))
    (testing "Fails validation due to invalid parameter schema"
      (let [parameters {:id "something random"
                        :title :a
                        :content true}]
        (is (not (m/validate sut/update-comment-params parameters)))
        (is (= 3 (count (:errors (m/explain sut/update-comment-params parameters)))))))))

(deftest delete-comment-test
  (let [system (-> fixtures/*system*
                   (ig/init [::sut/delete]))
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        handler (::sut/delete system)
        _ (seeder/seed conn {:country? true :event? true})
        sth-id (test-util/create-test-stakeholder config
                                                  "john.doe@mail.invalid"
                                                  "APPROVED"
                                                  "USER")]
    (testing "Delete a comment successfully"
      (let [comment (db.comment/create-comment conn (-> (assoc (random-comment-data sth-id 1 "event")
                                                               :updated-at (time-pre-j8/sql-timestamp (time/instant) "UTC"))
                                                        (util/replace-in-keys #"_" "-")))
            request (-> (mock/request :delete "/")
                        (assoc :parameters {:path {:id (:id comment)}}
                               :user {:id sth-id}))
            {:keys [status body]} (handler request)]
        (is (= 200 status))
        (is (= 1 (:deleted-comments body)))))
    (testing "Deleting a root comment also delete its replies"
      (let [comment (db.comment/create-comment conn (-> (assoc (random-comment-data sth-id 1 "event")
                                                               :updated-at (time-pre-j8/sql-timestamp (time/instant) "UTC"))
                                                        (util/replace-in-keys #"_" "-")))
            _ (db.comment/create-comment conn (-> (assoc (random-comment-data sth-id 1 "event")
                                                         :parent-id (:id comment)
                                                         :updated-at (time-pre-j8/sql-timestamp (time/instant) "UTC"))
                                                  (util/replace-in-keys #"_" "-")))
            request (-> (mock/request :delete "/")
                        (assoc :parameters {:path {:id (:id comment)}}
                               :user {:id sth-id}))
            {:keys [status body]} (handler request)
            comments (db.comment/get-resource-comments conn {})]
        (is (= 200 status))
        ;; NOTE: since the parent-id foreign key has the ON DELETE
        ;; CASCADE the deletion of child comments doesn't account to
        ;; number of rows affected. Therefore we just get the number
        ;; of affected rows by the DELETE statement.
        (is (= 1 (:deleted-comments body)))
        (is (not (seq comments)))))
    (testing "Trying to delete another user's comment will outputs unauthorized"
      (let [sth-id-2 (test-util/create-test-stakeholder config
                                                        "john.doe2@mail.invalid"
                                                        "APPROVED"
                                                        "USER")
            comment (db.comment/create-comment conn (-> (assoc (random-comment-data sth-id 1 "event")
                                                               :updated-at (time-pre-j8/sql-timestamp (time/instant) "UTC"))
                                                        (util/replace-in-keys #"_" "-")))
            request (-> (mock/request :delete "/")
                        (assoc :parameters {:path {:id (:id comment)}}
                               :user {:id sth-id-2}))
            {:keys [status]} (handler request)]
        (is (= 403 status))))
    (testing "Admins should be able to delete comments"
      (let [sth-admin-id (test-util/create-test-stakeholder config
                                                            "john.doe3@mail.invalid"
                                                            "APPROVED"
                                                            "ADMIN")
            comment (db.comment/create-comment conn (-> (assoc (random-comment-data sth-id 1 "event")
                                                               :updated-at (time-pre-j8/sql-timestamp (time/instant) "UTC"))
                                                        (util/replace-in-keys #"_" "-")))
            request (-> (mock/request :delete "/")
                        (assoc :parameters {:path {:id (:id comment)}}
                               :user {:id sth-admin-id}))
            {:keys [status]} (handler request)]
        (is (= 200 status))))))

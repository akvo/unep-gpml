(ns gpml.handler.submission-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.db.event :as db.event]
            [gpml.fixtures :as fixtures]
            [gpml.handler.profile-test :as profile-test]
            [gpml.handler.submission :as submission]
            [gpml.service.permissions :as srv.permissions]
            [gpml.test-util :as test-util]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(deftest handler-get-test
  (testing "Get pending submission list"
    (let [system (ig/init fixtures/*system* [::submission/get])
          config (get system [:duct/const :gpml.config/common])
          conn (get-in config [:db :spec])
          logger (get config :logger)
          handler (::submission/get system)

          _ (profile-test/seed-important-database conn)
          ;; create new admin name Jane
          admin-id (test-util/create-test-stakeholder config
                                                      "jane@org.com"
                                                      "APPROVED"
                                                      "ADMIN")
          ;; User Default
          _ (test-util/create-test-stakeholder config
                                               "john@org.com"
                                               "SUBMITTED"
                                               "ADMIN")
          ;; create new user name Bob
          _ (test-util/create-test-stakeholder config
                                               "bob@org.com"
                                               "SUBMITTED"
                                               "ADMIN")

          ;; create new user name Justin
          user-justin-id (test-util/create-test-stakeholder config
                                                            "justin@org.com"
                                                            "APPROVED"
                                                            "ADMIN")

          ;; Justin create an event
          event (db.event/new-event conn {:title "Title"
                                          :start_date "2021-02-03T09:00:00Z"
                                          :end_date "2021-02-03T10:00:00Z"
                                          :description "desc"
                                          :remarks "some remarks"
                                          :country nil
                                          :city nil
                                          :image nil
                                          :geo_coverage_type "global"
                                          :created_by user-justin-id
                                          :language "en"})
          _ (srv.permissions/create-resource-context {:conn conn
                                                      :logger logger}
                                                     {:context-type :event
                                                      :resource-id (:id event)})
          _ (srv.permissions/assign-roles-to-users {:conn conn
                                                    :logger (:logger config)}
                                                   [{:role-name :resource-owner
                                                     :context-type :project
                                                     :resource-id (:id event)
                                                     :user-id user-justin-id}])
          ;; Jane trying to see the list of submission user in this case Nick
          resp (handler (-> (mock/request :get "/")
                            (assoc :user {:id admin-id}
                                   :parameters {:query {:page 1
                                                        :review_status "SUBMITTED"
                                                        :limit 10}})))]
      (is (= 200 (:status resp)))
      ;; John and Bob, Exclude Justin
      ;; Doesn't include tags created while seeding db as they're now "APPROVED"
      (is (= 3 (-> resp :body :count)))
      (is (= 3 (count (-> resp :body :data))))
      (is (= "stakeholder" (-> resp :body :data first :type)))
      (is (= "/submission/stakeholder/10002" (-> resp :body :data first :preview)))
      (is (= "event" (some #{"event"} (map :type (-> resp :body :data)))))
      (is (= "event" (-> resp :body :data last :type)))
      (is (= "justin@org.com" (-> (filter #(not= "tag" (:type %)) (-> resp :body :data)) last :created_by))))))

(deftest handler-get-detail-test
  (let [system (ig/init fixtures/*system* [::submission/get-detail])
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        handler (::submission/get-detail system)
        _ (profile-test/seed-important-database conn)
        ;; create new admin name Jane
        admin-id (test-util/create-test-stakeholder config
                                                    "jane@org.com"
                                                    "APPROVED"
                                                    "ADMIN")
        ;; create new user name Justin
        user-justin-id (test-util/create-test-stakeholder config
                                                          "justin@org.com"
                                                          "SUBMITTED"
                                                          "ADMIN")]
    (testing "Get pending submission detail"
      (let [resp (handler (-> (mock/request :get "/")
                              (assoc :user {:id admin-id}
                                     :parameters
                                     {:path {:id user-justin-id
                                             :submission "stakeholder"}})))
            body (:body resp)]
        (is (= (:id body) user-justin-id))
        (is (= (:email body) "justin@org.com"))))
    (testing "If user is not admin or reviewer outputs unathorized"
      (let [;; create new admin name Jane
            sth-id (test-util/create-test-stakeholder config
                                                      "john.doe@org.com"
                                                      "APPROVED"
                                                      "USER")
            resp (handler (-> (mock/request :get "/")
                              (assoc :user {:id sth-id}
                                     :parameters
                                     {:path {:id user-justin-id
                                             :submission "stakeholder"}})))]
        (is (= 403 (:status resp)))))))

(deftest remap-initative-test
  (testing "Get remap initiative code"
    ;; This is a regression test, and doesn't necessarily test
    ;; everything that the remap function is doing.
    (let [system (ig/init fixtures/*system* [::submission/get-detail])
          db (-> system :duct.database.sql/hikaricp :spec)
          duration-value "Single event"
          initiative {:q38 {"38-0" duration-value}}
          data (submission/remap-initiative initiative db)]
      (is (= duration-value (:duration data))))))

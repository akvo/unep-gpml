(ns gpml.handler.project-test
  (:require
   [clojure.test :refer [deftest is testing use-fixtures]]
   [gpml.db.project :as db.prj]
   [gpml.domain.project :as dom.prj]
   [gpml.domain.types :as dom.types]
   [gpml.fixtures :as fixtures]
   [gpml.handler.project :as sut]
   [gpml.seeder.main :as seeder]
   [gpml.service.permissions :as srv.permissions]
   [gpml.test-util :as test-util]
   [gpml.util.postgresql :as pg-util]
   [integrant.core :as ig]
   [malli.core :as m]
   [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(defn- random-project-data []
  {:title "test project"
   :geo_coverage_type (rand-nth (vec dom.types/geo-coverage-types))
   :type (first dom.prj/project-types)
   :checklist {"test item" false}
   :stage (rand-nth (vec dom.prj/project-stages))
   :geo_coverage_countries [724]
   :geo_coverage_country_groups [151]
   :source dom.types/default-resource-source})

(defn- create-random-project [db stakeholder-id]
  (let [db-project (-> (random-project-data)
                       (assoc :stakeholder_id stakeholder-id)
                       (db.prj/project->db-project))
        created-project (db.prj/create-projects db {:insert-cols (map name (keys db-project))
                                                    :insert-values [(vals db-project)]})]
    (-> created-project first :id)))

(deftest create-project-test
  (let [system (-> fixtures/*system*
                   (ig/init [::sut/post]))
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        handler (::sut/post system)
        _ (seeder/seed conn {:country? true})
        sth-id (test-util/create-test-stakeholder config
                                                  "john.doe@mail.invalid"
                                                  "APPROVED"
                                                  "USER")]
    (testing "Create a project successfully"
      (let [project-payload (random-project-data)
            request (-> (mock/request :post "/")
                        (assoc :parameters {:body project-payload})
                        (assoc :user {:id sth-id}))
            {:keys [status body]} (handler request)]
        (is (= 200 status))
        (is (:success? body))
        (is (pos-int? (:project_id body)))))
    (testing "Creation should fail if user is not authenticated"
      (let [project-payload (random-project-data)
            request (-> (mock/request :post "/")
                        (assoc :parameters {:body project-payload}))
            {:keys [status]} (handler request)]
        (is (= 403 status))))
    (testing "Creation should fail if user doesn't have enough permissions"
      (let [sth-id (test-util/create-test-stakeholder config
                                                      "john.doe2@mail.invalid"
                                                      "SUBMITTED"
                                                      "USER")
            project-payload (random-project-data)
            request (-> (mock/request :post "/")
                        (assoc :parameters {:body project-payload}
                               :user {:id sth-id}))
            {:keys [status]} (handler request)]
        (is (= 403 status))))
    (testing "Parameter validation should fail when passing bad parameters"
      (let [project-payload (-> (random-project-data)
                                (assoc :geo_coverage_type "test"))
            create-project-schema (:body (ig/init-key ::sut/post-params {}))]
        (is (not (m/validate create-project-schema project-payload)))))
    (testing "Parameter validation should fail when missing required parameter"
      (let [project-payload (-> (random-project-data)
                                (dissoc :geo_coverage_type))
            create-project-schema (:body (ig/init-key ::sut/post-params {}))]
        (is (not (m/validate create-project-schema project-payload)))
        (is (some #{::m/missing-key} (map :type (:errors (m/explain create-project-schema project-payload)))))))))

(deftest update-project-test
  (let [system (-> fixtures/*system*
                   (ig/init [::sut/put]))
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        logger (get config :logger)
        handler (::sut/put system)
        _ (seeder/seed conn {:country? true})
        sth-id (test-util/create-test-stakeholder config
                                                  "john.doe@mail.invalid"
                                                  "APPROVED"
                                                  "USER")
        project-id (create-random-project conn sth-id)
        _ (srv.permissions/create-resource-context {:conn conn
                                                    :logger logger}
                                                   {:context-type :project
                                                    :resource-id project-id})
        _ (srv.permissions/assign-roles-to-users {:conn conn
                                                  :logger (:logger config)}
                                                 [{:role-name :resource-owner
                                                   :context-type :project
                                                   :resource-id project-id
                                                   :user-id sth-id}])]
    (testing "Update project successfully"
      (let [project-payload (random-project-data)
            request (-> (mock/request :put "/")
                        (assoc :parameters {:path {:id project-id}
                                            :body project-payload})
                        (assoc :user {:id sth-id}))
            {:keys [status body]} (handler request)]
        (is (= 200 status))
        (is (:success? body))))
    (testing "Update project fails for user without enough permissions"
      (let [sth-id (test-util/create-test-stakeholder config
                                                      "john.doe2@mail.invalid"
                                                      "APPROVED"
                                                      "USER")
            project-payload (random-project-data)
            request (-> (mock/request :put "/")
                        (assoc :parameters {:path {:id project-id}
                                            :body project-payload})
                        (assoc :user {:id sth-id}))
            {:keys [status]} (handler request)]
        (is (= 403 status))))
    (testing "Parameter validation should fail when passing bad parameters"
      (let [project-payload (-> (random-project-data)
                                (assoc :geo_coverage_type "test"))
            update-project-schema (:body (ig/init-key ::sut/put-params {}))]
        (is (not (m/validate update-project-schema project-payload)))))
    (testing "Parameter validation should fail when missing required parameter"
      (let [update-project-schema (:path (ig/init-key ::sut/put-params {}))]
        (is (not (m/validate update-project-schema {})))
        (is (some #{::m/missing-key} (map :type (:errors (m/explain update-project-schema {})))))))))

(deftest get-project-test
  (let [system (-> fixtures/*system*
                   (ig/init [::sut/get-by-id]))
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        logger (get config :logger)
        handler (::sut/get-by-id system)
        _ (seeder/seed conn {:country? true})
        sth-id (test-util/create-test-stakeholder config
                                                  "john.doe@mail.invalid"
                                                  "APPROVED"
                                                  "USER")
        project-id (create-random-project conn sth-id)
        _ (srv.permissions/create-resource-context {:conn conn
                                                    :logger logger}
                                                   {:context-type :project
                                                    :resource-id project-id})
        _ (srv.permissions/assign-roles-to-users {:conn conn
                                                  :logger (:logger config)}
                                                 [{:role-name :resource-owner
                                                   :context-type :project
                                                   :resource-id project-id
                                                   :user-id sth-id}])]
    (testing "Getting a project successfully"
      (let [request (-> (mock/request :get "/")
                        (assoc :parameters {:path {:id project-id}}
                               :user {:id sth-id}))
            {:keys [status body]} (handler request)]
        (is (= 200 status))
        (is (:success? body))
        (is (= project-id (get-in body [:project :id])))))
    (testing "An unapproved user doesn't have enough permission to see a project details"
      (let [sth-id (test-util/create-test-stakeholder config
                                                      "john.doe2@mail.invalid"
                                                      "SUBMITTED"
                                                      "USER")
            request (-> (mock/request :get "/")
                        (assoc :parameters {:path {:id project-id}}
                               :user {:id sth-id}))
            {:keys [status]} (handler request)]
        (is (= 403 status))))
    (testing "Parameter validation should fail when passing bad parameters"
      (let [get-project-schema (:path (ig/init-key ::sut/get-by-id-params {}))]
        (is (not (m/validate get-project-schema {:id "foo"})))))
    (testing "Parameter validation should fail when missing required parameter"
      (let [get-project-schema (:path (ig/init-key ::sut/get-by-id-params {}))]
        (is (not (m/validate get-project-schema {})))
        (is (some #{::m/missing-key} (map :type (:errors (m/explain get-project-schema {})))))))))

(deftest get-projects-test
  (let [system (-> fixtures/*system*
                   (ig/init [::sut/get]))
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        handler (::sut/get system)
        _ (seeder/seed conn {:country? true})
        sth-id (test-util/create-test-stakeholder config
                                                  "john.doe@mail.invalid"
                                                  "APPROVED"
                                                  "USER")
        project-id-1 (create-random-project conn sth-id)
        _project-id-2 (create-random-project conn sth-id)]
    (testing "Get projects successfully"
      (let [request (-> (mock/request :get "/")
                        (assoc :user {:id sth-id}))
            {:keys [status body]} (handler request)]
        (is (= 200 status))
        (is (:success? body))
        (is (= 2 (count (:projects body))))))
    (testing "Unapproved user doesn't have enough permissions"
      (let [sth-id (test-util/create-test-stakeholder config
                                                      "john.doe2@mail.invalid"
                                                      "SUBMITTED"
                                                      "USER")
            request (-> (mock/request :get "/")
                        (assoc :user {:id sth-id}))
            {:keys [status]} (handler request)]
        (is (= 403 status))))
    (testing "Applying filters"
      (let [request (-> (mock/request :get "/")
                        (assoc :parameters {:query {:ids [project-id-1]}}
                               :user {:id sth-id}))
            {:keys [status body]} (handler request)]
        (is (= 200 status))
        (is (:success? body))
        (is (= 1 (count (:projects body))))
        (is (= project-id-1 (-> body :projects first :id)))))
    (testing "Parameter validation should fail when passing bad parameters"
      (let [get-projects-schema (:query (ig/init-key ::sut/get-params {}))]
        (is (not (m/validate get-projects-schema {:ids true :geo_coverage_types ["test"]})))))))

(deftest delete-project-test
  (let [db (test-util/db-test-conn)
        system (-> fixtures/*system*
                   (ig/init [::sut/delete]))
        config (get system [:duct/const :gpml.config/common])
        conn (get-in config [:db :spec])
        logger (get config :logger)
        handler (::sut/delete system)
        _ (seeder/seed db {:country? true})
        sth-id (test-util/create-test-stakeholder config
                                                  "john.doe@mail.invalid"
                                                  "APPROVED"
                                                  "USER")
        project-id (create-random-project db sth-id)
        _ (srv.permissions/create-resource-context {:conn conn
                                                    :logger logger}
                                                   {:context-type :project
                                                    :resource-id project-id})
        _ (srv.permissions/assign-roles-to-users {:conn conn
                                                  :logger (:logger config)}
                                                 [{:role-name :resource-owner
                                                   :context-type :project
                                                   :resource-id project-id
                                                   :user-id sth-id}])]
    (testing "Delete a project successfully"
      (let [request (-> (mock/request :delete "/")
                        (assoc :parameters {:path {:id project-id}}
                               :user {:id sth-id}))
            {:keys [status body]} (handler request)
            project (db.prj/get-projects db {:filters {:ids (pg-util/->JDBCArray [project-id] "integer")}})]
        (is (= 200 status))
        (is (:success? body))
        (is (not (seq project)))))
    (testing "User doesn't have enought permissions to delete a project"
      (let [sth-id (test-util/create-test-stakeholder config
                                                      "john.doe2@mail.invalid"
                                                      "APPROVED"
                                                      "USER")
            request (-> (mock/request :delete "/")
                        (assoc :parameters {:path {:id project-id}}
                               :user {:id sth-id}))
            {:keys [status]} (handler request)]
        (is (= 403 status))))
    (testing "Parameter validation should fail when passing bad parameters"
      (let [delete-project-schema (:path (ig/init-key ::sut/delete-params {}))]
        (is (not (m/validate delete-project-schema {:id "foo"})))))
    (testing "Parameter validation should fail when missing required parameter"
      (let [delete-project-schema (:path (ig/init-key ::sut/delete-params {}))]
        (is (not (m/validate delete-project-schema {})))
        (is (some #{::m/missing-key} (map :type (:errors (m/explain delete-project-schema {})))))))))

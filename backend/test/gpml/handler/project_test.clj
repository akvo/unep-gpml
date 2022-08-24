(ns gpml.handler.project-test
  (:require [clojure.test :refer :all]
            [gpml.db.project :as db.prj]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.domain.project :as dom.prj]
            [gpml.domain.types :as dom.types]
            [gpml.fixtures :as fixtures]
            [gpml.handler.project :as sut]
            [gpml.test-util :as test-util]
            [gpml.util :as util]
            [gpml.util.postgresql :as pg-util]
            [integrant.core :as ig]
            [malli.core :as m]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(defn- random-project-data
  []
  {:title "test project"
   :geo_coverage_type (rand-nth (vec dom.types/geo-coverage-types))
   :type (first dom.prj/project-types)
   :checklist {"test item" false}})

(defn- create-random-project
  [db stakeholder-id]
  (let [db-project (-> (random-project-data)
                       (assoc :id (util/uuid) :stakeholder_id stakeholder-id)
                       (db.prj/project->db-project))]
    (db.prj/create-projects db {:insert-cols (map name (keys db-project))
                                :insert-values [(vals db-project)]})
    (:id db-project)))

(defn- make-profile [first-name last-name email]
  {:picture nil
   :cv nil
   :title "mr."
   :first_name first-name
   :last_name last-name
   :affiliation nil
   :email email
   :linked_in nil
   :twitter nil
   :url nil
   :country nil
   :representation "test"
   :about "Lorem Ipsum"
   :geo_coverage_type "global"
   :role "USER"
   :idp_usernames ["auth0|123"]})

(deftest create-project-test
  (let [db (test-util/db-test-conn)
        system (-> fixtures/*system*
                   (ig/init [::sut/post]))
        handler (::sut/post system)
        profile (make-profile "John" "Doe" "mail@org.com")
        sth-id (:id (db.stakeholder/new-stakeholder db profile))]
    (testing "Happy path"
      (let [project-payload (random-project-data)
            request (-> (mock/request :post "/")
                        (assoc :parameters {:body project-payload})
                        (assoc :user {:id sth-id}))
            {:keys [status body]} (handler request)]
        (is (= 200 status))
        (is (:success? body))
        (is (uuid? (:project_id body)))))
    (testing "Creation should fail if user is not authenticated"
      (let [project-payload (random-project-data)
            request (-> (mock/request :post "/")
                        (assoc :parameters {:body project-payload}))
            {:keys [status body]} (handler request)]
        (is (= 500 status))
        (is (not (:success? body)))
        (is (seq (:error-details body)))))
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
  (let [db (test-util/db-test-conn)
        system (-> fixtures/*system*
                   (ig/init [::sut/put]))
        handler (::sut/put system)
        profile (make-profile "John" "Doe" "mail@org.com")
        sth-id (:id (db.stakeholder/new-stakeholder db profile))
        project-id (create-random-project db sth-id)]
    (testing "Happy path"
      (let [project-payload (random-project-data)
            request (-> (mock/request :put "/")
                        (assoc :parameters {:path {:id project-id}
                                            :body project-payload})
                        (assoc :user {:id sth-id}))
            {:keys [status body]} (handler request)]
        (is (= 200 status))
        (is (:success? body))))
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
  (let [db (test-util/db-test-conn)
        system (-> fixtures/*system*
                   (ig/init [::sut/get-by-id]))
        handler (::sut/get-by-id system)
        profile (make-profile "John" "Doe" "mail@org.com")
        sth-id (:id (db.stakeholder/new-stakeholder db profile))
        project-id (create-random-project db sth-id)]
    (testing "Happy path"
      (let [request (-> (mock/request :get "/")
                        (assoc :parameters {:path {:id project-id}}))
            {:keys [status body]} (handler request)]
        (is (= 200 status))
        (is (:success? body))
        (is (= project-id (get-in body [:project :id])))))
    (testing "Parameter validation should fail when passing bad parameters"
      (let [get-project-schema (:path (ig/init-key ::sut/get-by-id-params {}))]
        (is (not (m/validate get-project-schema {:id 1})))))
    (testing "Parameter validation should fail when missing required parameter"
      (let [get-project-schema (:path (ig/init-key ::sut/get-by-id-params {}))]
        (is (not (m/validate get-project-schema {})))
        (is (some #{::m/missing-key} (map :type (:errors (m/explain get-project-schema {})))))))))

(deftest get-projects-test
  (let [db (test-util/db-test-conn)
        system (-> fixtures/*system*
                   (ig/init [::sut/get]))
        handler (::sut/get system)
        profile (make-profile "John" "Doe" "mail@org.com")
        sth-id (:id (db.stakeholder/new-stakeholder db profile))
        project-id-1 (create-random-project db sth-id)
        _project-id-2 (create-random-project db sth-id)]
    (testing "Happy path"
      (let [request (mock/request :get "/")
            {:keys [status body]} (handler request)]
        (is (= 200 status))
        (is (:success? body))
        (is (= 2 (count (:projects body))))))
    (testing "Happy path applying filters"
      (let [request (-> (mock/request :get "/")
                        (assoc :parameters {:query {:ids [project-id-1]}}))
            {:keys [status body]} (handler request)]
        (is (= 200 status))
        (is (:success? body))
        (is (= 1 (count (:projects body))))
        (is (= project-id-1 (-> body :projects first :id)))))
    (testing "Parameter validation should fail when passing bad parameters"
      (let [get-projects-schema (:query (ig/init-key ::sut/get-params {}))]
        (is (not (m/validate get-projects-schema {:ids 1 :geo_coverage_types ["test"]})))))))

(deftest delete-project-test
  (let [db (test-util/db-test-conn)
        system (-> fixtures/*system*
                   (ig/init [::sut/delete]))
        handler (::sut/delete system)
        profile (make-profile "John" "Doe" "mail@org.com")
        sth-id (:id (db.stakeholder/new-stakeholder db profile))
        project-id (create-random-project db sth-id)]
    (testing "Happy path"
      (let [request (-> (mock/request :delete "/")
                        (assoc :parameters {:path {:id project-id}}))
            {:keys [status body]} (handler request)
            project (db.prj/get-projects db {:filters {:ids (pg-util/->JDBCArray [project-id] "uuid")}})]
        (is (= 200 status))
        (is (:success? body))
        (is (not (seq project)))))
    (testing "Parameter validation should fail when passing bad parameters"
      (let [delete-project-schema (:path (ig/init-key ::sut/delete-params {}))]
        (is (not (m/validate delete-project-schema {:id 1})))))
    (testing "Parameter validation should fail when missing required parameter"
      (let [delete-project-schema (:path (ig/init-key ::sut/delete-params {}))]
        (is (not (m/validate delete-project-schema {})))
        (is (some #{::m/missing-key} (map :type (:errors (m/explain delete-project-schema {})))))))))

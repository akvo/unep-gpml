(ns gpml.handler.auth-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.topic-stakeholder-auth :as db.ts-auth]
            [gpml.fixtures :as fixtures]
            [gpml.handler.auth :as auth]
            [gpml.seeder.main :as seeder]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

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

(deftest post-topic-auth-handler-test
  (let [system (ig/init fixtures/*system* [::auth/post-topic-auth])
        handler (::auth/post-topic-auth system)
        db (-> system :duct.database.sql/hikaricp :spec)
        profile (make-profile "John" "Doe" "mail@org.com")
        sth-id (:id (db.stakeholder/new-stakeholder db profile))]
    (seeder/seed db {:organisation? true :resource? true})
    (testing "Allow adding a focal point to an organisation"
      (let [request (-> (mock/request :post "/")
                        (assoc :parameters {:path {:topic-type "organisation" :topic-id 1}
                                            :body {:stakeholders [{:id sth-id
                                                                   :roles ["focal-point"]}]}}
                               :user (select-keys profile [:email])))
            {:keys [status body]} (handler request)]
        (is (= 200 status))
        (is (:success? body))))
    (testing "More than two focal points in the same organisation should fail"
      (let [profile-1 (make-profile "John1" "Doe1" "mail1@org.com")
            sth-id-1 (:id (db.stakeholder/new-stakeholder db profile-1))
            profile-2 (make-profile "John2" "Doe2" "mail2@org.com")
            sth-id-2 (:id (db.stakeholder/new-stakeholder db profile-2))
            profile-3 (make-profile "John3" "Doe3" "mail3@org.com")
            sth-id-3 (:id (db.stakeholder/new-stakeholder db profile-3))
            request (-> (mock/request :post "/")
                        (assoc :parameters {:path {:topic-type "organisation" :topic-id 1}
                                            :body {:stakeholders [{:id sth-id-1
                                                                   :roles ["focal-point"]}
                                                                  {:id sth-id-2
                                                                   :roles ["focal-point"]}
                                                                  {:id sth-id-3
                                                                   :roles ["focal-point"]}]}}
                               :user (select-keys profile [:email])))
            {:keys [status body]} (handler request)]
        (is (= 400 status))
        (is (not (:success? body)))
        (is (= :maximum-focal-points-reached (:reason body)))))))

(deftest put-update-roles-handler-test
  (let [system (ig/init fixtures/*system* [::auth/update-roles])
        handler (::auth/update-roles system)
        db (-> system :duct.database.sql/hikaricp :spec)
        profile (make-profile "John" "Doe" "mail@org.com")
        sth-id (:id (db.stakeholder/new-stakeholder db profile))
        _ (seeder/seed db {:organisation? true :resource? true})]
    (testing "Updating auth roles should work"
      (let [_ (db.ts-auth/new-auth db {:topic-id 1
                                       :topic-type "resource"
                                       :stakeholder sth-id
                                       :roles ["focal-point"]})
            request (-> (mock/request :put "/")
                        (assoc :parameters {:path {:topic-type "resource" :topic-id 1 :stakeholder sth-id}
                                            :body {:roles ["owner"]}}
                               :user (select-keys profile [:email])))
            {:keys [status body]} (handler request)]
        (is (= 200 status))
        (is (:success? body))))
    (testing "Updating should fail if topic is organisation and focal points is at maximum"
      (let [profile-1 (make-profile "John1" "Doe1" "mail1@org.com")
            sth-id-1 (:id (db.stakeholder/new-stakeholder db profile-1))
            _ (db.ts-auth/new-auth db {:topic-id 1
                                       :topic-type "organisation"
                                       :stakeholder sth-id-1
                                       :roles ["focal-point"]})
            profile-2 (make-profile "John2" "Doe2" "mail2@org.com")
            sth-id-2 (:id (db.stakeholder/new-stakeholder db profile-2))
            _ (db.ts-auth/new-auth db {:topic-id 1
                                       :topic-type "organisation"
                                       :stakeholder sth-id-2
                                       :roles ["focal-point"]})
            profile-3 (make-profile "John3" "Doe3" "mail3@org.com")
            sth-id-3 (:id (db.stakeholder/new-stakeholder db profile-3))
            _ (db.ts-auth/new-auth db {:topic-id 1
                                       :topic-type "organisation"
                                       :stakeholder sth-id-3
                                       :roles ["owner"]})
            request (-> (mock/request :put "/")
                        (assoc :parameters {:path {:topic-type "organisation" :topic-id 1 :stakeholder sth-id-3}
                                            :body {:roles ["focal-point"]}}
                               :user (select-keys profile-3 [:email])))
            {:keys [status body]} (handler request)]
        (is (= 400 status))
        (is (not (:success? body)))
        (is (= :maximum-focal-points-reached (:reason body)))))))

(deftest post-new-roles-handler-test
  (let [system (ig/init fixtures/*system* [::auth/new-roles])
        handler (::auth/new-roles system)
        db (-> system :duct.database.sql/hikaricp :spec)
        profile (make-profile "John" "Doe" "mail@org.com")
        sth-id (:id (db.stakeholder/new-stakeholder db profile))
        _ (seeder/seed db {:organisation? true :resource? true})]
    (testing "Adding new roles to a stakeholder should work"
      (let [request (-> (mock/request :post "/")
                        (assoc :parameters {:path {:topic-type "resource" :topic-id 1 :stakeholder sth-id}
                                            :body {:roles ["owner"]}}
                               :user (select-keys profile [:email])))
            {:keys [status body]} (handler request)]
        (is (= 200 status))
        (is (:success? body))))
    (testing "Adding new focal-point role to a stakeholdr should failed if organisation has reached maximum number of focal points"
      (let [profile-1 (make-profile "John1" "Doe1" "mail1@org.com")
            sth-id-1 (:id (db.stakeholder/new-stakeholder db profile-1))
            _ (db.ts-auth/new-auth db {:topic-id 1
                                       :topic-type "organisation"
                                       :stakeholder sth-id-1
                                       :roles ["focal-point"]})
            profile-2 (make-profile "John2" "Doe2" "mail2@org.com")
            sth-id-2 (:id (db.stakeholder/new-stakeholder db profile-2))
            _ (db.ts-auth/new-auth db {:topic-id 1
                                       :topic-type "organisation"
                                       :stakeholder sth-id-2
                                       :roles ["focal-point"]})
            request (-> (mock/request :post "/")
                        (assoc :parameters {:path {:topic-type "organisation" :topic-id 1 :stakeholder sth-id}
                                            :body {:roles ["focal-point"]}}
                               :user (select-keys profile [:email])))
            {:keys [status body]} (handler request)]
        (is (= 400 status))
        (is (not (:success? body)))
        (is (= :maximum-focal-points-reached (:reason body)))))))

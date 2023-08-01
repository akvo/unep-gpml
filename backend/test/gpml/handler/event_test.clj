(ns gpml.handler.event-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [gpml.db.event :as db.event]
            [gpml.domain.types :as dom.types]
            [gpml.fixtures :as fixtures]
            [gpml.handler.event :as event]
            [gpml.handler.profile-test :as profile-test]
            [gpml.test-util :as test-util]
            [integrant.core :as ig]
            [ring.mock.request :as mock])
  (:import [java.sql Timestamp]
           [java.time Instant]))

(use-fixtures :each fixtures/with-test-system)

(defn time* []
  (Timestamp. (.toEpochMilli (Instant/now))))

(defn new-event [data]
  {:title "title" :start_date (time*) :end_date (time*)
   :description "desc"
   :remarks ""
   :geo_coverage_type "global"
   :country (get-in data [:countries 0 :id])
   :city "string"
   :image "image" :url "url"
   :language "en"})

(deftest handler-post-test
  (testing "New event is created"
    (let [system (ig/init fixtures/*system* [::event/post])
          config (get system [:duct/const :gpml.config/common])
          conn (get-in config [:db :spec])
          handler (::event/post system)
          data (profile-test/seed-important-database conn)
          ;; create new user name John
          sth-id (test-util/create-test-stakeholder config
                                                    "john.doe@mail.invalid"
                                                    "APPROVED"
                                                    "ADMIN")
          payload (new-event (merge data {:owners [(:id sth-id)]}))
          resp-one (handler (-> (mock/request :post "/")
                                (assoc :user {:id sth-id})
                                (assoc :body-params payload)
                                (assoc :parameters {:body {:source dom.types/default-resource-source}})))
          event-one (db.event/event-by-id conn (:body resp-one))]
      (is (= 201 (:status resp-one)))
      (is (= (:url event-one) (:url payload))))))

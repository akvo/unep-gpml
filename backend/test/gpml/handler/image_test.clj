(ns gpml.handler.image-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [gpml.fixtures :as fixtures]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.test-util :refer [picture]]
            [gpml.handler.image :as image]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

(use-fixtures :each fixtures/with-test-system)

(deftest handler-get-test
  (testing "Image is available"
    (let [system (ig/init fixtures/*system* [::image/get])
          handler (::image/get system)
          db (-> system :duct.database.sql/hikaricp :spec)
          _ (db.stakeholder/new-stakeholder-image db {:picture picture})
          resp (handler (-> (mock/request :get "/image")
                            (assoc :parameters {:path {:id 1 :image_type "profile"}}
                                   :path-params {:id 1}
                                   )))]
      (is (= 200 (:status resp))))))

(deftest handler-image-not-found
  (testing "Image is not found"
    (let [system (ig/init fixtures/*system* [::image/get])
          handler (::image/get system)
          resp (handler (-> (mock/request :get "/image")
                            (assoc :parameters {:path {:id 1 :image_type "profile"}}
                                   :path-params {:id 1}
                                   )))]
      (is (= 404 (:status resp)))
      (is (= "Image not found" (-> resp :body :message))))))

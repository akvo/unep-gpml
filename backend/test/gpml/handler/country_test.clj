(ns gpml.handler.country-test
  (:require [clojure.test :refer [deftest testing is]]
            [gpml.handler.country :as country]
            [integrant.core :as ig]
            [ring.mock.request :as mock]))

;; TODO: We're reusing the existing dev database, we have a different one gpml_test
;; that we need to migrate and seed via fixtures
;; https://clojure.github.io/clojure/clojure.test-api.html#clojure.test/use-fixtures
(def db {:spec {:connection-uri "jdbc:postgresql://db/gpml?user=unep&password=password"}})

(deftest ^:integration handler-test
  (testing "Country endpoint returns non empty response"
    (let [handler (ig/init-key ::country/handler {:db db})
          resp (handler (mock/request :get "/"))]
      (is (= 200 (:status resp)))
      (is (not-empty (:body resp))))))

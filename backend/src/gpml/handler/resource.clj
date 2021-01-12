(ns gpml.handler.resource
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]))

(def resource-sample-data [{:id 1
                            :title "Resource 1"
                            :type "Financial Resource"
                            :publish_year 2020
                            :summary "Summary of the resource"
                            :value 100000
                            :value_currency "USD"
                            :image nil
                            :valid_from "2020-01-01T00:00:00Z"
                            :valid_to "2020-12-31T00:00:00Z"
                            :geo_coverage_type "national"
                            :geo_coverage_countries ["Kenya"]
                            :attachments ["http://example.com/foo.pdf"]
                            :organisations ["GRID Arendal" "The Global Partnership of Marine Litter" "United Nation Environmental Programme"]
                            :tags ["microplastics" "sea-land interface" "state of knowledge"]
                            :urls [{:url "http://example.com/en/foo1.pdf" :language "English"}
                                   {:url "http://example.com/zh/foo1.pdf" :language "Chinese"}]
                            :remarks "Remarks"
                            :created "2021-01-01T00:00:00Z"
                            :modified "2021-01-01T00:00:00Z"}
                           {:id 2
                            :title "Resource 2"
                            :type "Technical Resource"
                            :publish_year 2020
                            :summary "Summary of the resource"
                            :value nil
                            :value_currency nil
                            :image nil
                            :valid_from "2020-01-01T00:00:00Z"
                            :valid_to "2020-12-31T00:00:00Z"
                            :geo_coverage_type "global with elements in specific areas"
                            :geo_coverage_countries ["Kenya" "Germany" "India"]
                            :attachments ["http://example.com/foo.pdf"]
                            :organisations ["GRID Arendal" "The Global Partnership of Marine Litter" "United Nation Environmental Programme"]
                            :tags ["mechanism" "best practice" "inland" "inventory" "macroplastics" "minimization" "prevention" "state of knowledge"]
                            :urls [{:url "http://example.com/en/foo1.pdf" :language "English"}
                                   {:url "http://example.com/zh/foo1.pdf" :language "Chinese"}]
                            :remarks "Remarks"
                            :created "2021-01-01T00:00:00Z"
                            :modified "2021-01-01T00:00:00Z"}])

(defn resource-sample [_]
  (resp/response {:results resource-sample-data :next nil :prev nil :total 2 :page 1}))

(defmethod ig/init-key :gpml.handler.resource/handler [_ _]
  #'resource-sample)

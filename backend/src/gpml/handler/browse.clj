(ns gpml.handler.browse
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]))

(def technology-sample-data [{:id 1
                              :title "The Great Bubble Barrier"
                              :year_founded 2015
                              :country "The Netherlands"
                              :organisation_type "Startup"
                              :development_stage "Scale up"
                              :specifications_provided false
                              :email nil
                              :tags ["collection" "recovery" "partnerships" "funding"]
                              :geo_coverage_type "national"
                              :geo_coverage_countries ["The Netherlands"]
                              :urls [{:url "https://thegreatbubblebarrier.com/" :language "English"}]
                              :attachments []
                              :remarks "Remarks"
                              :created "2021-01-01T00:00:00Z"
                              :modified "2021-01-01T00:00:00Z"}
                             {:id 2
                              :title "Floating Trash Barrier"
                              :year_founded 2010
                              :country "India"
                              :organisation_type "Startup"
                              :development_stage "Scale up"
                              :specifications_provided true
                              :email nil
                              :tags ["collection" "recovery" "plastics" "waste" "water" "customers"]
                              :geo_coverage_type "national"
                              :geo_coverage_countries ["India"]
                              :urls [{:url "https://www.alphamers.com/" :language "English"}]
                              :attachments []
                              :remarks "Remarks"
                              :created "2021-01-01T00:00:00Z"
                              :modified "2021-01-01T00:00:00Z"}])

(def event-sample-data [{:id 1
                         :title "Event 1"
                         :start_date "2021-02-01T10:00:00Z"
                         :end_date "2021-02-01T12:00:00Z"
                         :description "Description of the event"
                         :image nil
                         :geo_coverage_type "national"
                         :geo_coverage_countries ["Kenya"]
                         :remarks "Remarks"
                         :tags ["microplastics" "sea-land interface" "state of knowledge"]
                         :urls [{:url "http://example.com/events/en/event1.html" :language "English"}
                                {:url "http://example.com/events/zh/event2.html" :language "Chinese"}]
                         :created "2021-01-01T00:00:00Z"
                         :modified "2021-01-01T00:00:00Z"}
                        {:id 2
                         :title "Event 2"
                         :start_date "2021-10-03T10:00:00Z"
                         :end_date "2021-10-03T12:00:00Z"
                         :description "Description of the event 2"
                         :image nil
                         :geo_coverage_type "global"
                         :geo_coverage_countries []
                         :remarks "Remarks"
                         :tags ["best practice" "inventory" "macroplastics"]
                         :urls [{:url "http://example.com/events/en/event2.html" :language "English"}
                                {:url "http://example.com/events/zh/event2.html" :language "Chinese"}]
                         :created "2021-01-01T00:00:00Z"
                         :modified "2021-01-01T00:00:00Z"}])

(def policy-sample-data [{:id 1
                          :title "Environment (Protection) Act, 1986 (No. 29 of 1986)"
                          :original_title "The Environment (Protection)Act, 1986"
                          :data_source "FAOLEX"
                          :country "India"
                          :abstract "An Act to provide for the protection and improvement of environment and for matters connected therewith"
                          :type_of_law "Legislation"
                          :record_number "LEX-FAOC021695"
                          :implementing_mea nil
                          :first_publication_date "2015-12-03T00:00:00Z"
                          :latest_amendment_date nil
                          :status "In force"
                          :tags ["product ban"]
                          :geo_coverage_type "national"
                          :geo_coverage_countries ["India"]
                          :urls [{:url "http://extwprlegs1.fao.org/docs/pdf/guy152293.pdf" :language "English"}]
                          :attachments ["http://extwprlegs1.fao.org/docs/pdf/guy152293.pdf"]
                          :remarks "Remarks"
                          :created "2021-01-01T00:00:00Z"
                          :modified "2021-01-01T00:00:00Z"}
                         {:id 2
                          :title "Waste Management Framework Law No.16 of 2020"
                          :original_title nil
                          :data_source "FAOLEX"
                          :country "Jordan"
                          :abstract "Abstract"
                          :type_of_law "Legislation"
                          :record_number "LEX-FAOC193637"
                          :implementing_mea "Basel Convention"
                          :first_publication_date "1998-01-01T00:00:00Z"
                          :latest_amendment_date nil
                          :status "In force"
                          :tags []
                          :geo_coverage_type "national"
                          :geo_coverage_countries ["Jordan"]
                          :urls [{:url "https://www.legislation.gov.au/Details/F2012C00858" :language "English"}]
                          :attachments ["https://www.legislation.gov.au/Details/F2012C00858"]
                          :remarks "Remarks"
                          :created "2021-01-01T00:00:00Z"
                          :modified "2021-01-01T00:00:00Z"}])

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

(defn browse-sample [_]
  (let [data (flatten [(map #(assoc % :type "technology") technology-sample-data)
                       (map #(assoc % :type "resource") resource-sample-data)
                       (map #(assoc % :type "event") event-sample-data)
                       (map #(assoc % :type "policy") policy-sample-data)])]
    (resp/response {:results data :next nil :prev nil :total (count data) :page 1})))

(defmethod ig/init-key :gpml.handler.browse/handler [_ _]
  #'browse-sample)

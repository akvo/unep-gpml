(ns gpml.handler.technology
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

(defn technology-sample [_]
  (resp/response {:results technology-sample-data :next nil}))

(defmethod ig/init-key :gpml.handler.technology/handler [_ _]
  #'technology-sample)

(ns gpml.handler.event
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]))

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

(defn event-sample [_]
  (resp/response {:results event-sample-data :next nil :prev nil :total 2 :page 1}))

(defmethod ig/init-key :gpml.handler.event/handler [_ _]
  #'event-sample)

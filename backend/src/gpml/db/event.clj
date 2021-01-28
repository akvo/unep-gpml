(ns gpml.db.event
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/event.sql")

(comment
  (require 'dev)
  (require '[gpml.db.country :as db.country])

  (let [db (dev/db-conn)
        country-id (:id (db.country/country-by-code db {:name "IND"}))
        event1 {:title "Event 1"
                :start_date "2021-01-01T10:00:00Z"
                :end_date "2021-01-01T12:00:00Z"
                :description "Description of the event"
                :image nil
                :country country-id,
                :city "Timbuktu",
                :geo_coverage_type "national"
                :geo_coverage_countries ["KEN"]
                :remarks "Remarks"
                :tags ["microplastics" "sea-land interface" "state of knowledge"]
                :urls [{:url "http://example.com/events/en/event1.html" :language "en"}
                       {:url "http://example.com/events/zh/event2.html" :language "zh"}]}
        event2 {:remarks "Remarks",
                :description "Description of the event",
                :title "Event 10",
                :country country-id,
                :city "Timbuktu",
                :image nil
                :geo_coverage_type nil,
                :end_date "2021-01-01T12:00:00Z",
                :start_date "2021-01-01T10:00:00Z"}
        ]
    (gpml.db.event/new-event db event1)
    (gpml.db.event/new-event db event2))


  )

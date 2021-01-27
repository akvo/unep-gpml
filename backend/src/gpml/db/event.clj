(ns gpml.db.event
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/event.sql")

(comment
  (require 'dev)

  (let [db (dev/db-conn)
        event1 {:title "Event 1"
                :start_date "2021-01-01T10:00:00Z"
                :end_date "2021-01-01T12:00:00Z"
                :description "Description of the event"
                :image nil
                :country 20,
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
                :country 10,
                :city "Timbuktu",
                :image nil
                :geo_coverage_type nil,
                :end_date "2021-01-01T12:00:00Z",
                :start_date "2021-01-01T10:00:00Z"}
        tags [2 4]
        urls [{:language 2 :url "http://foo.com/fr"} {:language 7 :url "http://foo.com/gj"}]
        event-id (-> (gpml.db.event/new-event db event1) first :id)]
    (gpml.db.event/new-event db event2)
    (gpml.db.event/add-event-tags db {:tags (map #(vector event-id %) tags)})
    (gpml.db.event/add-event-language-urls
     db
     {:urls (map #(vector event-id (:language %) (:url %)) urls)}))


  )

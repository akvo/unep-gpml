(ns gpml.db.event
  {:ns-tracker/resource-deps ["event.sql"]}
  (:require [gpml.util :as util]
            [gpml.util.sql :as sql-util]
            [hugsql.core :as hugsql]))

(declare new-event
         add-event-language-urls
         add-event-geo-coverage
         update-event-status
         event-by-id
         event-image-by-id
         new-event-image
         dummy
         create-events
         get-events
         update-event
         create-event-images)

(hugsql/def-db-fns "gpml/db/event.sql" {:quoting :ansi})

(defn event->db-event
  "Apply transformations to Event entity fields to database specific
  types.

  NOTE: start and end date are not transformed here because they are
  java.time.OffsetDateTime which is supported by JDBC driver and will
  automatically apply the offset to the dates."
  [event]
  (-> event
      (util/update-if-not-nil :brs_api_modified sql-util/instant->sql-timestamp)
      (util/update-if-not-nil :geo_coverage_type sql-util/keyword->pg-enum "geo_coverage_type")
      (util/update-if-not-nil :review_status sql-util/keyword->pg-enum "review_status")))

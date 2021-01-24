(ns gpml.db.event-image
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/event_image.sql")

(ns gpml.db.landing
  (:require [hugsql.core :as hugsql]
            [gpml.pg-util]))

(hugsql/def-db-fns "gpml/db/landing.sql")

(comment
  (require 'dev)
  (let [db (dev/db-conn)]
    (gpml.db.landing/map-counts db)
    (gpml.db.landing/summary db))
  )

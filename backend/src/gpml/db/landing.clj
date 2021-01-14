(ns gpml.db.landing
  (:require [hugsql.core :as hugsql]
            [gpml.pg-util]))

(hugsql/def-db-fns "gpml/db/landing.sql")

(comment
  (require 'integrant.repl.state)
  (let [db (:spec (:duct.database.sql/hikaricp integrant.repl.state/system))]
    (hugsql/def-db-fns "gpml/db/landing.sql")
    (gpml.db.landing/map-counts db))
  )

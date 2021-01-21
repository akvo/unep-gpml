(ns gpml.db.tag
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/tag.sql")

(comment
  (require 'dev)

  (let [db (dev/db-conn)]
    (mapv #(:tag %) (gpml.db.tag/tag-by-category db {:category "event%"}))
    )


  )

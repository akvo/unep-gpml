(ns gpml.db.resource.association
  {:ns-tracker/resource-deps ["resource/association.sql"]}
  (:require [hugsql.core :as hugsql]))

(declare get-resource-associations)

(hugsql/def-db-fns "gpml/db/resource/association.sql" {:quoting :ansi})

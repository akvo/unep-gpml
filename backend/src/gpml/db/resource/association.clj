(ns gpml.db.resource.association
  {:ns-tracker/resource-deps ["resource/association.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/resource/association.sql" {:quoting :ansi})

(ns gpml.db.resource.detail
  {:ns-tracker/resource-deps ["resource/detail.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/resource/detail.sql" {:quoting :ansi})

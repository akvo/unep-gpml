(ns gpml.db.resource.translation
  {:ns-tracker/resource-deps ["resource/translation.sql"]}
  (:require [hugsql.core :as hugsql]))

(declare create-or-update-translations)

(hugsql/def-db-fns "gpml/db/resource/translation.sql" {:quoting :ansi})

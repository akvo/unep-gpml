(ns gpml.db.topic.translation
  (:require
   [hugsql.core :as hugsql]))

(declare get-bulk-topic-translations
         upsert-bulk-topic-translations
         delete-bulk-topic-translations)

(hugsql/def-db-fns "gpml/db/topic/translation.sql" {:quoting :ansi})
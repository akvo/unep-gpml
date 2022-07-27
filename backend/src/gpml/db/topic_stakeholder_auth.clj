(ns gpml.db.topic-stakeholder-auth
  {:ns-tracker/resource-deps ["topic_stakeholder_auth.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/topic_stakeholder_auth.sql" {:quoting :ansi})

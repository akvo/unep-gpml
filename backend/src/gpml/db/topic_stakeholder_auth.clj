(ns gpml.db.topic-stakeholder-auth
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/topic_stakeholder_auth.sql")

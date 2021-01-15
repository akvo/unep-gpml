(ns gpml.db.language
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/language.sql")

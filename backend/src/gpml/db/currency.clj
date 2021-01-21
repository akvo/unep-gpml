(ns gpml.db.currency
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/currency.sql")

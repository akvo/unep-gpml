(ns gpml.db.portfolio
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/portfolio.sql")

(ns gpml.exporter.main
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/exporter/main.sql")

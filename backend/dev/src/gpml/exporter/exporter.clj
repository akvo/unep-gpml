(ns gpml.exporter
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/exporter/exporter.sql")

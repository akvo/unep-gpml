(ns gpml.boundary.adapter.datasource.brs
  (:require [gpml.boundary.adapter.datasource.brs.core :as brs.core]
            [integrant.core :as ig]))

(defmethod ig/init-key :gpml.boundary.adapter.datasource/brs
  [_ config]
  (brs.core/map->BRS config))

(ns gpml.test-util
  (:require [gpml.fixtures :as fixtures]
            [integrant.core :as ig]))

(defn db-test-conn
  []
  (-> fixtures/*system*
      (ig/init [:duct.database.sql/hikaricp])
      :duct.database.sql/hikaricp
      :spec))

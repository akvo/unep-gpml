(ns gpml.main
  (:gen-class)
  (:require [duct.core :as duct]))

(duct/load-hierarchy)

(defn -main [& args]
  (let [keys     (or (duct/parse-keys args) [:duct/migrator :duct/daemon])
        profiles [:duct.profile/prod]]
    (-> (duct/resource "gpml/config.edn")
        (duct/read-config)
        (duct/exec-config profiles keys))))

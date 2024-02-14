(ns gpml.main
  "Please do not place any requires here."
  (:gen-class))

(defn -main [& args]
  (binding [*assert* false]
    (require '[duct.core])
    (duct.core/load-hierarchy)
    (let [keys     (or (duct.core/parse-keys args) [:duct/daemon])
          profiles [:duct.profile/prod]]
      (-> (duct.core/resource "gpml/config.edn")
          (duct.core/read-config)
          (duct.core/exec-config profiles keys)))))

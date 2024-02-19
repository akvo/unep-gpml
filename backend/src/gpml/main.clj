(ns gpml.main
  "Please do not place any requires here."
  (:gen-class))

(defn -main [& args]
  (binding [*assert* false]
    ;; Load multimethods:
    (require 'gpml.handler.detail
             'gpml.timbre-logger
             'gpml.timbre-logger.json
             'gpml.util.postgresql)
    (require 'duct.core)
    (@(requiring-resolve 'duct.core/load-hierarchy))
    (let [parse-keys @(requiring-resolve 'duct.core/parse-keys)
          resource @(requiring-resolve 'duct.core/resource)
          read-config @(requiring-resolve 'duct.core/read-config)
          exec-config @(requiring-resolve 'duct.core/exec-config)
          keys     (or (parse-keys args) [:duct/daemon])
          profiles [:duct.profile/prod]]
      (-> (resource "gpml/config.edn")
          (read-config)
          (exec-config profiles keys)))))

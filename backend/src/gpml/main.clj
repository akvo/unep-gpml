(ns gpml.main
  "Please do not place any requires here."
  (:gen-class))

(defn -main [& args]
  (binding [*assert* false]
    ;; Load multimethods:
    (require 'gpml.handler.detail
             'gpml.programmatic
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
      (-> (resource "gpml/duct.edn")
          (read-config {'gpml/profile (fn [_]
                                        ;; In GCP we have the 'production' and 'test' environments.
                                        ;; To avoid conflating GCP 'test' with local 'test',
                                        ;; all GCP environments are prefixed with prod-.
                                        ;; So we intend to have prod-production and prod-test.
                                        (let [e (System/getenv "ENV_NAME")]
                                          (when (empty? e)
                                            (throw (ex-info "ENV_NAME is unset" {})))
                                          (keyword (str "prod-" e))))})
          (exec-config profiles keys)))))

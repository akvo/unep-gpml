(ns seeder
  (:require
   [clojure.edn :as edn]
   [clojure.java.jdbc :as jdbc]
   [gpml.seeder.main :as seeder]
   [hikari-cp.core :as hikari]))

;; Seeder main function to run from Kubernetes

(defn -main [& args]

  (let [opts {:jdbc-url (System/getenv "DATABASE_URL")
              :register-mbeans false}
        ds (hikari/make-datasource opts)]

    (case (first args)
      "set-admin" (jdbc/execute! {:datasource ds} ["UPDATE stakeholder SET review_status='APPROVED', role='ADMIN' WHERE email=?" (second args)])
      "run-seeder" (time
                    (seeder/seed
                     {:datasource ds}
                     (edn/read-string (second args))))
      "update-country" (time (seeder/updater-country {:datasource ds})))))

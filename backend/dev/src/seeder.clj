(ns seeder
  (:require [clojure.java.io :as io]
            [clojure.java.jdbc :as jdbc]
            [hikari-cp.core :as hikari]
            [gpml.seeder.main :as seeder]))

;; Seeder main function to run from Kubernetes

(defn -main [& args]

  (println (System/getenv "GOOGLE_APPLICATION_CREDENTIALS"))

  (println (.exists (io/file "/secrets/cloudsql/credentials.json")))

  (println (System/getenv "DATABASE_URL"))

  (let [opts {:jdbc-url (System/getenv "DATABASE_URL")
              :register-mbeans false}
        ds (hikari/make-datasource opts)]

    (case (first args)
      "set-admin" (jdbc/execute! {:datasource ds} ["UPDATE stakeholder SET review_status='APPROVED', role='ADMIN' WHERE email=?" (second args)])
      "run-seeder" (time
                     (seeder/seed
                       {:datasource ds}
                       {:country? true
                        :currency? true
                        :organisation? true
                        :language? true
                        :tag? true
                        :policy? true
                        :resource? true
                        :technology? true
                        :project? true})))))
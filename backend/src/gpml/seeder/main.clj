(ns gpml.seeder.main
  (:require [clojure.java.jdbc :as jdbc]
            [jsonista.core :as j]))

(def db {:connection-uri "jdbc:postgresql://db/gpml?user=unep&password=password"})

(defn seed-country []
  (jdbc/delete! db :country [])
  (jdbc/insert-multi! db :country
    (map (fn [x] {:name (:name x) :iso_code (:code x)})
      (j/read-value (slurp "https://unep.tc.akvo.org/api/countries") j/keyword-keys-object-mapper))))

(seed-country)

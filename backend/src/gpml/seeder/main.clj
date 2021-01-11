(ns gpml.seeder.main
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.java.io :as io]
            [jsonista.core :as j]))

(def db {:classname "org.postgresql.Driver"
         :subprotocol "postgresql"
         :subname "//db/gpml"
         :user "unep"
         :password "password"
         :stringtype "unspecified"})

(defn seed-country []
  (jdbc/delete! db :country [])
  (jdbc/insert-multi! db :country
    (map (fn [x] {:name (:name x) :iso_code (:code x)})
      (j/read-value (slurp (io/resource "files/countries.json")) j/keyword-keys-object-mapper))))

(defn seed-country-group []
  (jdbc/delete! db :country_group [])
  (jdbc/insert-multi! db :country_group
    (j/read-value (slurp (io/resource "files/country_group.json")) j/keyword-keys-object-mapper)))

(defn seed []
  (println "-- Start Seeding")
  (seed-country)
  (seed-country-group)
  (println "-- Done Seeding")
  )

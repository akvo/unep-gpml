(ns gpml.seeder.main
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.java.io :as io]
            [clojure.string :as str]
            [jsonista.core :as j]))

(def db {:classname "org.postgresql.Driver"
         :subprotocol "postgresql"
         :subname "//db/gpml"
         :user "unep"
         :password "password"
         :stringtype "unspecified"})

(defn seed-countries []
  (jdbc/delete! db :country [])
  (jdbc/insert-multi! db :country
    (map (fn [x] {:name (:name x) :iso_code (:code x)})
      (j/read-value (slurp (io/resource "files/countries.json")) j/keyword-keys-object-mapper))))

(defn seed-country-groups []
  (jdbc/delete! db :country_group [])
  (jdbc/insert-multi! db :country_group
    (j/read-value (slurp (io/resource "files/country_group.json")) j/keyword-keys-object-mapper)))

(defn seed-organisations []
  (jdbc/delete! db :organisation [])
  (jdbc/insert-multi! db :organisation
    (j/read-value (slurp (io/resource "files/organisations.json")) j/keyword-keys-object-mapper)))

(defn seed-currencies []
  (jdbc/delete! db :currency [])
  (jdbc/insert-multi! db :currency
    (j/read-value (slurp (io/resource "files/currencies.json")) j/keyword-keys-object-mapper)))

(defn seed-languages[] 
  (jdbc/delete! db :language [])
  (jdbc/insert-multi! db :language
  (reduce (fn [acc [k v]]
    (conj acc {:iso_code (str/trim (name k)) :english_name (:name v) :native_name (:nativeName v)}))
    []
    (j/read-value (slurp (io/resource "files/languages.json")) j/keyword-keys-object-mapper))))

(defn seed []
  (println "-- Start Seeding")
  (seed-countries)
  (seed-country-groups)
  (seed-currencies)
  (seed-organisations)
  (seed-languages)
  (println "-- Done Seeding")
  )

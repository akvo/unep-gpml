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

(defn parse-data [x]
  (j/read-value x j/keyword-keys-object-mapper))

(defn get-data [x]
  (parse-data (slurp (io/resource (str "files/" x ".json")))))

(defn seed-countries []
  (jdbc/delete! db :country [])
  (jdbc/insert-multi! db :country
    (map (fn [x] {:name (:name x) :iso_code (:code x)})
      (get-data "countries"))))

(defn seed-country-groups []
  (jdbc/delete! db :country_group [])
  (jdbc/insert-multi! db :country_group
    (get-data "country_group")))

(defn seed-organisations []
  (jdbc/delete! db :organisation [])
  (jdbc/insert-multi! db :organisation
    (get-data "organisations")))

(defn seed-currencies []
  (jdbc/delete! db :currency [])
  (jdbc/insert-multi! db :currency
    (get-data "currencies")))

(defn seed-languages [] 
  (jdbc/delete! db :language [])
  (jdbc/insert-multi! db :language
  (reduce (fn [acc [k v]]
    (conj acc {:iso_code (str/trim (name k)) :english_name (:name v) :native_name (:nativeName v)}))
    []
    (get-data "languages"))))

(defn seed-tags []
  (jdbc/delete! db :tag [])
  (jdbc/delete! db :tag_category [])
  (doseq [data (j/read-value (slurp (io/resource "files/tags.json")))]
    (let [category (jdbc/insert! db :tag_category {:category (first data)})
          category-id (-> category first :id)
          tags (map (fn [e] (assoc {} :tag_category category-id :tag e)) (second data))]
      (jdbc/insert-multi! db :tag tags))))

(defn seed []
  (println "-- Start Seeding")
  (seed-countries)
  (seed-country-groups)
  (seed-currencies)
  (seed-organisations)
  (seed-languages)
  (seed-tags)
  (println "-- Done Seeding")
  )

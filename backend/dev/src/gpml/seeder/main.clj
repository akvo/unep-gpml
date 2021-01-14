(ns gpml.seeder.main
  (:require [clojure.java.io :as io]
            [clojure.java.jdbc :as jdbc]
            [clojure.string :as str]
            [gpml.db.country :as db.country]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.resource :as db.resource]
            [gpml.db.tag :as db.tag]
            [jsonista.core :as j]
            gpml.pg-util))

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
  (jdbc/delete! db :resource_geo_coverage [])
  (jdbc/delete! db :resource [])
  (jdbc/delete! db :country [])
  (jdbc/insert-multi! db :country
                      (map (fn [x] {:name (:name x) :iso_code (:code x)})
                           (get-data "countries"))))

(defn seed-country-groups []
  (jdbc/delete! db :country_group [])
  (jdbc/insert-multi! db :country_group
                      (get-data "country_group")))

(defn seed-organisations []
  (jdbc/delete! db :resource_organisation [])
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
  (jdbc/delete! db :resource_tag [])
  (jdbc/delete! db :tag [])
  (jdbc/delete! db :tag_category [])
  (doseq [data (j/read-value (slurp (io/resource "files/tags.json")))]
    (let [category (jdbc/insert! db :tag_category {:category (first data)})
          category-id (-> category first :id)
          tags (map (fn [e] (assoc {} :tag_category category-id :tag e)) (second data))]
      (jdbc/insert-multi! db :tag tags))))

(defn get-ids [cmd]
  (reduce (fn [acc o] (conj acc (:id o))) [] cmd))

(defn get-country [x]
  (db.country/country-by-names db {:names x}))

(defn get-organisation [x]
  (db.organisation/organisation-by-names db {:names x}))

(defn get-tag [x]
  (db.tag/tag-by-tags db {:tags x}))

(defn- get-resources
  []
  (->> (get-data "resources")
       (map (fn [x]
              (if-let [country (:country x)]
                (if-let [data (first (get-country [country]))]
                  (assoc x :country (:id data))
                  (assoc x :country nil))
                x)))
       (map (fn [x]
              (if-let [organisation (:organisation x)]
                (assoc x :organisation (get-ids (get-organisation organisation)))
                x)))
       (map (fn [x]
              (if-let [country (:geo_coverage x)]
                (assoc x :geo_coverage (get-ids (get-country country)))
                x)))
       (map (fn [x]
              (if-let [tags (:tags x)]
                (assoc x :tags (get-ids (get-tag tags)))
                x)))))

(defn seed-resources []
  (jdbc/delete! db :resource_tag [])
  (jdbc/delete! db :resource_organisation [])
  (jdbc/delete! db :resource_geo_coverage [])
  (jdbc/delete! db :resource_language_url [])
  (jdbc/delete! db :resource [])
  (doseq [data (get-resources)]
    (try
      (let [res-id (-> (db.resource/new-resource db data) first :id)
            data-org (:organisation data)
            data-geo (:geo_coverage data)
            data-tag (:tags data)]
        (when (not-empty data-org)
          (let [res-org (map (fn [x] (assoc {} :resource res-id :organisation x)) data-org)]
            (jdbc/insert-multi! db :resource_organisation res-org)))
        (when (not-empty data-geo)
          (let [res-geo (map (fn [x] (assoc {} :resource res-id :country x)) data-geo)]
            (jdbc/insert-multi! db :resource_geo_coverage res-geo)))
        (when (not-empty data-tag)
          (let [res-tag (map (fn [x] (assoc {} :resource res-id :tag x)) data-tag)]
            (jdbc/insert-multi! db :resource_tag res-tag))))
      (catch Exception e
        (println data)
        (.printStackTrace e)
        (throw e)))
    ))

(defn seed []
  (println "-- Start Seeding")
  (seed-countries)
  (seed-country-groups)
  (seed-currencies)
  (seed-organisations)
  (seed-languages)
  (seed-tags)
  (seed-resources)
  (println "-- Done Seeding"))

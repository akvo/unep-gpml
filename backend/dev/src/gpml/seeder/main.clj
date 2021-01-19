(ns gpml.seeder.main
  (:require [clojure.java.io :as io]
            [clojure.java.jdbc :as jdbc]
            [clojure.string :as str]
            [clj-time.core :as t]
            [clj-time.format :as f]
            [gpml.db.country :as db.country]
            [gpml.db.country-group :as db.country-group]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.resource :as db.resource]
            [gpml.db.policy :as db.policy]
            [gpml.db.tag :as db.tag]
            [gpml.db.language :as db.language]
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

(defn get-ids [cmd]
  (reduce (fn [acc o] (conj acc (:id o))) [] cmd))

(defn get-country [x]
  (db.country/country-by-names db {:names x}))

(defn get-country-group [x]
  (db.country-group/country-group-by-name db {:name x}))

(defn get-organisation [x]
  (db.organisation/organisation-by-names db {:names x}))

(defn get-tag [x]
  (db.tag/tag-by-tags db {:tags x}))

(defn get-language [x]
  (remove nil?
          (mapv (fn [y]
                  (if-let [language-id (db.language/language-by-name db {:name (:language y)})] 
                    (assoc y :url (:url y) :language (:id language-id)) nil))x)))

(defn delete-resources []
  (jdbc/delete! db :resource_tag [])
  (jdbc/delete! db :resource_organisation [])
  (jdbc/delete! db :resource_geo_coverage [])
  (jdbc/delete! db :resource_language_url [])
  (jdbc/delete! db :resource [])
  )

(defn delete-policies []
  (jdbc/delete! db :policy_tag [])
  (jdbc/delete! db :policy_geo_coverage [])
  (jdbc/delete! db :policy_language_url [])
  (jdbc/delete! db :policy [])
  )

(defn seed-countries []
  (jdbc/delete! db :country_group_countries [])
  (jdbc/delete! db :country [])
  (jdbc/insert-multi! db :country
                      (map (fn [x] {:name (:name x) :iso_code (:code x)})
                           (get-data "countries"))))

(defn seed-country-groups []
  (jdbc/delete! db :country_group [])
  (jdbc/insert-multi! db :country_group
                      (get-data "country_group")))

(defn get-country-group-countries []
  (into [] (reduce (fn [acc [k v]]
                  (let [group (:id (get-country-group (name k)))]
                    (concat acc (map (fn [x] {:country_group group :country x}) (get-ids (get-country v))))))
                [] (get-data "country_group_countries"))))

(defn seed-country-group-countries []
  (jdbc/delete! db :country_group_countries [])
  (jdbc/insert-multi! db :country_group_countries (get-country-group-countries)))


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
                                (conj acc {:iso_code (str/trim (name k)) 
                                           :english_name (:name v) 
                                           :native_name (:nativeName v)}))
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

(defn- get-resources
  []
  (->> (get-data "resources")
       (map (fn [x]
                (assoc x :value (:value_amount x))))
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
              (if-let [language-url (:resource_language_url x)]
                (assoc x :resource_language_url (get-language language-url))
                x))
            )
       (map (fn [x]
              (if-let [tags (:tags x)]
                (assoc x :tags (get-ids (get-tag tags)))
                x)))))

(defn seed-resources []
  (delete-resources)
  (doseq [data (get-resources)]
    (try
      (let [res-id (-> (db.resource/new-resource db data) first :id)
            data-org (:organisation data)
            data-geo (:geo_coverage data)
            data-lang (:resource_language_url data)
            data-tag (:tags data)]
        (when (not-empty data-org)
          (let [res-org (mapv #(assoc {} :resource res-id :organisation %) data-org)]
            (jdbc/insert-multi! db :resource_organisation res-org)))
        (when (not-empty data-geo)
          (let [res-geo (mapv #(assoc {} :resource res-id :country %) data-geo)]
            (jdbc/insert-multi! db :resource_geo_coverage res-geo)))
        (when (not-empty data-lang)
          (let [res-lang (map (fn [x] (assoc x :resource res-id)) data-lang)]
            (jdbc/insert-multi! db :resource_language_url res-lang)))
        (when (not-empty data-tag)
          (let [res-tag (mapv #(assoc {} :resource res-id :tag %) data-tag)]
            (jdbc/insert-multi! db :resource_tag res-tag))))
      (catch Exception e
        (println (data))
        (.printStackTrace e)
        (throw e)))))

(defn parse-date [x]
    (f/parse (f/formatter "yyyyMMdd")
             (str/replace (str/replace x #"-" "") #"/" "")
             ))


(defn- get-policies
  []
  (->> (get-data "policies")
       (map (fn [x]
                (assoc x :value (:value_amount x))))
       (map (fn [x]
              (if-let [country (:country x)]
                (if-let [data (first (get-country [country]))]
                  (assoc x :country (:id data))
                  (assoc x :country nil))
                x)))
       (map (fn [x]
              (if-let [group (:implementing_mea x)]
                (assoc x :implementing_mea (:id (get-country-group group)))
                x)))
       (map (fn [x]
              (if-let [country (:geo_coverage x)]
                (assoc x :geo_coverage (get-ids (get-country country)))
                x)))
       (map (fn [x]
              (if-let [language-url (:resource_language_url x)]
                (assoc x :resource_language_url (get-language language-url))
                x))
            )
       (map (fn [x]
              (if-let [date (:latest_amendment_date x)]
                (assoc x :latest_amendment_date (parse-date date))
                x))
            )
       (map (fn [x]
              (if-let [date (:first_publication_date x)]
                (if-let [parsed (parse-date date)]
                  (assoc x :first_publication_date parsed)
                  x)
                x))
            )
       (map (fn [x]
              (if-let [tags (:tags x)]
                (assoc x :tags (get-ids (get-tag tags)))
                x)))))

(defn seed-policies []
  (delete-policies)
  (doseq [data (get-policies)]
    (try
      (let [po-id (-> (db.policy/new-policy db data) first :id)
            data-geo (:geo_coverage data)
            data-lang (:resource_language_url data)
            data-tag (:tags data)]
        (when (not-empty data-geo)
          (let [po-geo (mapv #(assoc {} :policy po-id :country %) data-geo)]
            (jdbc/insert-multi! db :policy_geo_coverage po-geo)))
        (when (not-empty data-lang)
          (let [po-lang (map (fn [x] (assoc x :policy po-id)) data-lang)]
            (jdbc/insert-multi! db :policy_language_url po-lang)))
        (when (not-empty data-tag)
          (let [po-tag (mapv #(assoc {} :resource po-id :tag %) data-tag)]
            (jdbc/insert-multi! db :policy_tag po-tag))))
      (catch Exception e
        (println (data))
        (.printStackTrace e)
        (throw e)))))

(defn seed []
  (println "-- Start Seeding")
  (delete-resources)
  (delete-policies)
  (seed-countries)
  (seed-country-groups)
  (seed-country-group-countries)
  (seed-currencies)
  (seed-organisations)
  (seed-languages)
  (seed-tags)
  #_(seed-policies) ;; Wrong number of args (0) passed
  (seed-resources)
  (println "-- Done Seeding"))

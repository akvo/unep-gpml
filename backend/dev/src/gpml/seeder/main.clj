(ns gpml.seeder.main
  (:require [clj-time.format :as f]
            [clojure.java.io :as io]
            [clojure.java.jdbc :as jdbc]
            [clojure.string :as str]
            [duct.core :as duct]
            [gpml.db.country :as db.country]
            [gpml.db.action :as db.action]
            [gpml.db.action-detail :as db.action-detail]
            [gpml.db.country-group :as db.country-group]
            [gpml.db.currency :as db.currency]
            [gpml.db.language :as db.language]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.policy :as db.policy]
            [gpml.db.resource :as db.resource]
            [gpml.db.tag :as db.tag]
            [gpml.db.technology :as db.technology]
            [gpml.db.project :as db.project]
            gpml.pg-util
            [integrant.core :as ig]
            [jsonista.core :as j]))

(duct/load-hierarchy)

(defn- dev-system
  []
  (-> (duct/resource "gpml/config.edn")
      (duct/read-config)
      (duct/prep-config [:duct.profile/dev])))

(defonce db (-> (dev-system)
            (ig/init [:duct.database.sql/hikaricp])
            :duct.database.sql/hikaricp
            :spec))

(defn parse-date [x]
  (f/unparse (f/formatters :date-hour-minute-second-ms)
             (f/parse (f/formatter "yyyyMMdd")
                      (str/replace (str/replace x #"-" "") #"/" ""))))

(defn parse-data [s {:keys [keywords?]}]
  (if keywords?
    (j/read-value s j/keyword-keys-object-mapper)
    (j/read-value s)))

(defn get-data
  ([file-name]
   (get-data file-name {:keywords? true}))
  ([file-name opts]
   (parse-data (slurp (io/resource (str "files/" file-name ".json"))) opts)))

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

(defn get-action [x]
  (db.action/action-by-code db {:code x}))

(defn get-actions [x]
  (db.action/action-by-codes db {:codes x}))

(defn get-action-detail [x]
  (db.action-detail/action-detail-by-code db {:code x}))

(defn delete-resources []
  (jdbc/delete! db :resource_tag [])
  (jdbc/delete! db :resource_organisation [])
  (jdbc/delete! db :resource_geo_coverage [])
  (jdbc/delete! db :resource_language_url [])
  (jdbc/delete! db :resource []))

(defn delete-policies []
  (jdbc/delete! db :policy_tag [])
  (jdbc/delete! db :policy_geo_coverage [])
  (jdbc/delete! db :policy_language_url [])
  (jdbc/delete! db :policy []))

(defn delete-technologies []
  (jdbc/delete! db :technology_tag [])
  (jdbc/delete! db :technology_geo_coverage [])
  (jdbc/delete! db :technology []))

(defn delete-projects []
  (jdbc/delete! db :project_country [])
  (jdbc/delete! db :project_action [])
  (jdbc/delete! db :project_action_detail [])
  (jdbc/delete! db :project []))

(defn seed-countries []
  (jdbc/delete! db :country_group_country [])
  (jdbc/delete! db :country [])
  (jdbc/insert-multi! db :country
                      (map (fn [x] {:name (:name x) :iso_code (:code x)})
                           (get-data "countries"))))

(defn seed-country-groups []
  (jdbc/delete! db :country_group [])
  (doseq [data (get-data "country_group")]
    (db.country-group/new-country-group db data)))

(defn get-country-group-countries []
  (flatten
   (reduce (fn [acc [k v]]
             (let [group (:id (get-country-group (name k)))]
               (conj acc (map (fn [x] {:country_group group :country x})
                              (get-ids (get-country v))))))
           []
           (get-data "country_group_countries"))))


(defn seed-country-group-country []
  (jdbc/delete! db :country_group_country [])
  (doseq [data (get-country-group-countries)]
    (db.country-group/new-country-group-country db data)))

(defn seed-organisations []
  (jdbc/delete! db :organisation [])
  (doseq [data (get-data "organisations")]
    (db.organisation/new-organisation db data)))

(defn seed-currencies []
  (jdbc/delete! db :currency [])
  (doseq [data (get-data "currencies")]
    (db.currency/new-currency db data)))

(defn seed-languages []
  (jdbc/delete! db :language [])
  (doseq [data (reduce (fn [acc [k v]]
                                (conj acc {:iso_code (str/trim (name k))
                                           :english_name (:name v)
                                           :native_name (:nativeName v)}))
                              []
                              (get-data "languages"))]
    (db.language/new-language db data)))

(defn seed-tags []
  (jdbc/delete! db :tag [])
  (jdbc/delete! db :tag_category [])
  (doseq [data (get-data "tags" {:keywords? false})]
    (let [category (db.tag/new-tag-category db {:category (first data)})
          category-id (-> category first :id)]
      (doseq [tag (map #(assoc {} :tag_category category-id :tag %) (second data))]
        (db.tag/new-tag db tag)))))

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
        (println data)
        (.printStackTrace e)
        (throw e)))))

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
          (let [po-tag (mapv #(assoc {} :policy po-id :tag %) data-tag)]
            (jdbc/insert-multi! db :policy_tag po-tag))))
      (catch Exception e
        (println data)
        (.printStackTrace e)
        (throw e)))))

(defn- get-technologies
  []
  (->> (get-data "technologies")
       (map (fn [x]
              (if-let [country (:country x)]
                (if-let [data (first (get-country [country]))]
                  (assoc x :country (:id data))
                  (assoc x :country nil))
                x)))
       (map (fn [x]
              (if-let [country (:geo_coverage x)]
                (assoc x :geo_coverage (get-ids (get-country country)))
                x)))
       (map (fn [x]
              (if-let [tags (:tags x)]
                (assoc x :tags (get-ids (get-tag tags)))
                x)))))

(defn seed-technologies []
  (delete-technologies)
  (doseq [data (get-technologies)]
    (try
      (let [tech-id (-> (db.technology/new-technology db data) first :id)
            data-geo (:geo_coverage data)
            data-tag (:tags data)]
        (when (not-empty data-geo)
          (let [tech-geo (mapv #(assoc {} :technology tech-id :country %) data-geo)]
            (jdbc/insert-multi! db :technology_geo_coverage tech-geo)))
        (when (not-empty data-tag)
          (let [tech-tag (mapv #(assoc {} :technology tech-id :tag %) data-tag)]
            (jdbc/insert-multi! db :technology_tag tech-tag))))
      (catch Exception e
        (println data)
        (.printStackTrace e)
        (throw e)))))

(defn seed-actions []
  (jdbc/delete! db :action_detail [])
  (jdbc/delete! db :action [])
  (jdbc/insert-multi! db :action (get-data "actions")))

(defn get-action-details []
  (map (fn [x] (if-let [action (get-action (:action x))]
          (assoc x :action (:id action)) x)) (get-data "action_details")))

(defn seed-action-details []
  (jdbc/delete! db :action_detail [])
  (jdbc/insert-multi! db :action_detail (mapv #(dissoc % :type) (get-action-details))))

(defn- get-projects
  []
  (->> (get-data "projects")
       (map (fn [x]
              (if-let [country (seq(:countries x))]
                (assoc x :countries (get-ids (get-country country)))
                x)))
       (map (fn [x]
              (if-let [codes (:action_codes x)]
                (assoc x :action_codes (get-ids (map (fn [z] (get-action z)) codes)))
                x)))
       (map (fn [x]
              (if-let [codes (:action_details x)]
                (assoc x :action_details
                       (map (fn [y]
                              {:value (:value y)
                               :action_detail (:id (get-action-detail (:action_detail_code y)))})
                            codes))
                x)))
       ))

(defn seed-projects []
  (delete-projects)
  (doseq [data (get-projects)]
    (try
      (let [proj-id (-> (db.project/new-project db data) first :id)
            data-countries (:countries data)
            data-act (:action_codes data)
            data-act-detail (:action_details data)]
        (when (not-empty data-countries)
          (let [proj-countries (mapv #(assoc {} :project proj-id :country %) data-countries)]
            (jdbc/insert-multi! db :project_country proj-countries)))
        (when (not-empty data-act)
          (let [proj-act (mapv #(assoc {} :project proj-id :action %) data-act)]
            (jdbc/insert-multi! db :project_action proj-act)))
        (when (not-empty data-act-detail)
          (let [proj-act-detail (mapv (fn [z]
                                        {:project proj-id
                                         :action_detail (:action_detail z)
                                         :value (:value z)}
                                        ) data-act-detail)]
            (jdbc/insert-multi! db :project_action_detail proj-act-detail))))
      (catch Exception e
        (println data)
        (.printStackTrace e)
        (throw e)))))

(defn seed []
  (println "-- Start Seeding")
  (delete-resources)
  (delete-policies)
  (delete-technologies)
  (delete-projects)
  (seed-countries)
  (seed-country-groups)
  (seed-country-group-country)
  (seed-currencies)
  (seed-organisations)
  (seed-languages)
  (seed-tags)
  (seed-policies)
  (seed-resources)
  (seed-technologies)
  (seed-actions)
  (seed-action-details)
  (seed-projects)
  (println "-- Done Seeding"))

(comment
  (seed)
  ,)

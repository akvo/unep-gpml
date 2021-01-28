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

(defn get-country [db x]
  (db.country/country-by-names db {:names x}))

(defn get-country-group [db x]
  (db.country-group/country-group-by-name db {:name x}))

(defn get-country-groups [db x]
  (db.country-group/country-group-by-names db {:names x}))

(defn get-organisation [db x]
  (db.organisation/organisation-by-names db {:names x}))

(defn get-tag [db x]
  (db.tag/tag-by-tags db {:tags x}))

(defn get-language [db x]
  (remove nil?
          (mapv (fn [y]
                  (if-let [language-id (db.language/language-by-name db {:name (:language y)})]
                    (assoc y :url (:url y) :language (:id language-id)) nil))x)))

(defn get-action [db x]
  (db.action/action-by-code db {:code x}))

(defn get-actions [db x]
  (db.action/action-by-codes db {:codes x}))

(defn get-action-detail [db x]
  (db.action-detail/action-detail-by-code db {:code x}))

(defn delete-stakeholder [db]
  (jdbc/delete! db :stakeholder_tag [])
  (jdbc/delete! db :stakeholder_geo_coverage [])
  (jdbc/delete! db :stakeholder []))

(defn delete-resources [db]
  (jdbc/delete! db :resource_tag [])
  (jdbc/delete! db :resource_organisation [])
  (jdbc/delete! db :resource_geo_coverage [])
  (jdbc/delete! db :resource_language_url [])
  (jdbc/delete! db :resource []))

(defn delete-policies [db]
  (jdbc/delete! db :policy_tag [])
  (jdbc/delete! db :policy_geo_coverage [])
  (jdbc/delete! db :policy_language_url [])
  (jdbc/delete! db :policy []))

(defn delete-technologies [db]
  (jdbc/delete! db :technology_tag [])
  (jdbc/delete! db :technology_geo_coverage [])
  (jdbc/delete! db :technology []))

(defn delete-projects [db]
  (jdbc/delete! db :project_country [])
  (jdbc/delete! db :project_action [])
  (jdbc/delete! db :project_action_detail [])
  (jdbc/delete! db :project []))

(defn seed-countries [db]
  (jdbc/delete! db :country_group_country [])
  (jdbc/delete! db :country [])
  (jdbc/insert-multi! db :country
                      (map (fn [x] {:name (:name x) :iso_code (:code x)})
                           (get-data "countries"))))

(defn seed-country-groups [db]
  (jdbc/delete! db :country_group [])
  (doseq [data (get-data "country_group")]
    (db.country-group/new-country-group db data)))

(defn get-country-group-countries [db]
  (flatten
   (reduce (fn [acc [k v]]
             (let [group (:id (get-country-group db (name k)))]
               (conj acc (map (fn [x] {:country_group group :country x})
                              (get-ids (get-country db v))))))
           []
           (get-data "country_group_countries"))))


(defn seed-country-group-country [db]
  (jdbc/delete! db :country_group_country [])
  (doseq [data (get-country-group-countries db)]
    (db.country-group/new-country-group-country db data)))

(defn seed-organisations [db]
  (jdbc/delete! db :organisation [])
  (doseq [data (get-data "organisations")]
    (db.organisation/new-organisation db data)))

(defn seed-currencies [db]
  (jdbc/delete! db :currency [])
  (doseq [data (get-data "currencies")]
    (db.currency/new-currency db data)))

(defn seed-languages [db]
  (jdbc/delete! db :language [])
  (doseq [data (reduce (fn [acc [k v]]
                                (conj acc {:iso_code (str/trim (name k))
                                           :english_name (:name v)
                                           :native_name (:nativeName v)}))
                              []
                              (get-data "languages"))]
    (db.language/new-language db data)))

(defn seed-tags [db]
  (jdbc/delete! db :tag [])
  (jdbc/delete! db :tag_category [])
  (doseq [data (get-data "tags" {:keywords? false})]
    (let [category (db.tag/new-tag-category db {:category (first data)})
          category-id (-> category first :id)]
      (doseq [tag (map #(assoc {} :tag_category category-id :tag %) (second data))]
        (db.tag/new-tag db tag)))))

(defn get-resources [db]
  (->> (get-data "resources")
       (map (fn [x]
                (assoc x :value (:value_amount x))))
       (map (fn [x]
              (if-let [country (:country x)]
                (if-let [data (first (get-country db [country]))]
                  (assoc x :country (:id data))
                  (assoc x :country nil))
                x)))
       (map (fn [x]
              (if-let [organisation (:organisation x)]
                (assoc x :organisation (get-ids (get-organisation db organisation)))
                x)))
       (map (fn [x]
              (if (= "regional" (:geo_coverage_type x))
                (if-let [country-group (:geo_coverage x)]
                  (assoc x :geo_coverage (get-ids (get-country-groups db country-group))) x)
                (if-let [country (:geo_coverage x)]
                  (assoc x :geo_coverage (get-ids (get-country db country))) x))))
       (map (fn [x]
              (if-let [language-url (:resource_language_url x)]
                (assoc x :resource_language_url (get-language db language-url))
                x))
            )
       (map (fn [x]
              (if-let [tags (:tags x)]
                (assoc x :tags (get-ids (get-tag db tags)))
                x)))))

(defn seed-resources [db]
  (delete-resources db)
  (doseq [data (get-resources db)]
    (try
      (let [res-id (-> (db.resource/new-resource db data) first :id)
            data-org (:organisation data)
            data-geo (:geo_coverage data)
            data-geo-type (:geo_coverage_type data)
            data-lang (:resource_language_url data)
            data-tag (:tags data)]
        (when (not-empty data-org)
          (let [res-org (mapv #(assoc {} :resource res-id :organisation %) data-org)]
            (jdbc/insert-multi! db :resource_organisation res-org)))
        (when (not-empty data-geo)
          (if (= "regional" data-geo-type)
            (let [res-geo (mapv #(assoc {} :resource res-id :country_group %) data-geo)]
              (jdbc/insert-multi! db :resource_geo_coverage res-geo))
            (let [res-geo (mapv #(assoc {} :resource res-id :country %) data-geo)]
              (jdbc/insert-multi! db :resource_geo_coverage res-geo))))
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

(defn get-policies [db]
  (->> (get-data "policies")
       (map (fn [x]
                (assoc x :value (:value_amount x))))
       (map (fn [x]
              (if-let [country (:country x)]
                (if-let [data (first (get-country db [country]))]
                  (assoc x :country (:id data))
                  (assoc x :country nil))
                x)))
       (map (fn [x]
              (if-let [group (:implementing_mea x)]
                (assoc x :implementing_mea (:id (get-country-group db group)))
                x)))
       (map (fn [x]
              (if-let [country (:geo_coverage x)]
                (assoc x :geo_coverage (get-ids (get-country db country)))
                x)))
       (map (fn [x]
              (if-let [language-url (:resource_language_url x)]
                (assoc x :resource_language_url (get-language db language-url))
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
                x)))
       (map (fn [x]
              (if-let [tags (:tags x)]
                (assoc x :tags (get-ids (get-tag db tags)))
                x)))))

(defn seed-policies [db]
  (delete-policies db)
  (doseq [data (get-policies db)]
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

(defn get-technologies [db]
  (->> (get-data "technologies")
       (map (fn [x]
              (if-let [country (:country x)]
                (if-let [data (first (get-country db [country]))]
                  (assoc x :country (:id data))
                  (assoc x :country nil))
                x)))
       (map (fn [x]
              (if-let [country (:geo_coverage x)]
                (assoc x :geo_coverage (get-ids (get-country db country)))
                x)))
       (map (fn [x]
              (if-let [tags (:tags x)]
                (assoc x :tags (get-ids (get-tag db tags)))
                x)))))

(defn seed-technologies [db]
  (delete-technologies db)
  (doseq [data (get-technologies db)]
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

(defn seed-actions [db]
  (jdbc/delete! db :action_detail [])
  (jdbc/delete! db :action [])
  (jdbc/insert-multi! db :action (get-data "actions")))

(defn get-action-details [db]
  (map (fn [x] (if-let [action (get-action db (:action x))]
          (assoc x :action (:id action)) x)) (get-data "action_details")))

(defn seed-action-details [db]
  (jdbc/delete! db :action_detail [])
  (jdbc/insert-multi! db :action_detail (mapv #(dissoc % :type) (get-action-details db))))

(defn get-projects [db]
  (->> (get-data "projects")
       (map (fn [x]
              (if-let [country (seq(:countries x))]
                (assoc x :countries (get-ids (get-country db country)))
                x)))
       (map (fn [x]
              (if-let [codes (:action_codes x)]
                (assoc x :action_codes (get-ids (map (fn [z] (get-action db z)) codes)))
                x)))
       (map (fn [x]
              (if-let [codes (:action_details x)]
                (assoc x :action_details
                       (map (fn [y]
                              {:value (:value y)
                               :action_detail (:id (get-action-detail db (:action_detail_code y)))})
                            codes))
                x)))))

(defn seed-projects [db]
  (delete-projects db)
  (doseq [data (get-projects db)]
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
                                         :value (:value z)})
                                      data-act-detail)]
            (jdbc/insert-multi! db :project_action_detail proj-act-detail))))
      (catch Exception e
        (println data)
        (.printStackTrace e)
        (throw e)))))

(defn seed
  ([db {:keys [country? currency?
               organisation? language? tag?
               policy? resource?
               technology? project?]
        :or {country? false
             currency? false
             organisation? false
             language? false
             tag? false
             policy? false
             resource? false
             technology? false
             project? false}}]
   (println "-- Start Seeding")
   (delete-stakeholder db)
   (delete-resources db)
   (delete-policies db)
   (delete-technologies db)
   (delete-projects db)
   (when country?
     (println "Seeding country...")
     (seed-countries db)
     (seed-country-groups db)
     (seed-country-group-country db))
   (when currency?
     (println "Seeding currency...")
     (seed-currencies db))
   (when organisation?
     (println "Seeding organisation...")
     (seed-organisations db))
   (when language?
     (println "Seeding language...")
     (seed-languages db))
   (when tag?
     (println "Seeding tag...")
     (seed-tags db))
   (when policy?
     (println "Seeding policy...")
     (seed-policies db))
   (when resource?
     (println "Seeding resource...")
     (seed-resources db))
   (when technology?
     (println "Seeding technology...")
     (seed-technologies db))
   (when project?
     (println "Seeding project...")
     (seed-actions db)
     (seed-action-details db)
     (seed-projects db))
   (println "-- Done Seeding"))
  ([]
   (seed (-> (dev-system)
             (ig/init [:duct.database.sql/hikaricp])
             :duct.database.sql/hikaricp
             :spec)
         {:country? true
          :currency? true
          :organisation? true
          :language? true
          :tag? true
          :policy? true
          :resource? true
          :technology? true
          :project? true})))

(comment

  (seed)

  (time (seed (-> (dev-system)
             (ig/init [:duct.database.sql/hikaricp])
             :duct.database.sql/hikaricp
             :spec)
              {:resource? true}))

  (def db (-> (dev-system)
               (ig/init [:duct.database.sql/hikaricp])
               :duct.database.sql/hikaricp
               :spec))

  (->> (get-country-group-countries db)
       (filter #(= 2 (:country_group %)) ,,,)
       count)

  (require '[clojure.set :as set])

  (defn missing-names [names]
    (let [db-names (-> (get-country db names)
                       (#(map :name %))
                       set)]
      (set/difference (set names) db-names)))


  (->> (get-data "country_group_countries")
       vals
       (#(map missing-names %))
       (reduce set/union)
       (run! println))

  (defn geo-name-mimatches [topic]
    (let [r-countries (->> (get-data topic)
                           (#(map :geo_coverage %))
                           flatten
                           (filter some?)
                           (filter #(not(= "" %)))
                           set
                           )
          countries (->> (get-data "countries")
                         (#(map :name %))
                         set)]
      (set/difference r-countries countries)))


  (println "Technologies Geo Coverage")
  (doseq [item (geo-name-mimatches "technologies")]
    (println item))
  )

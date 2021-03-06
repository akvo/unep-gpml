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
            [gpml.db.event :as db.event]
            [gpml.db.tag :as db.tag]
            [gpml.db.technology :as db.technology]
            [gpml.db.project :as db.project]
            [gpml.exporter.main :as db.exporter]
            [gpml.seeder.util :as db.util]
            gpml.handler.detail
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

(defn truncate-db [db]
  (let [sql (slurp "dev/src/gpml/seeder/truncate.sql")]
    (jdbc/execute! db [sql])))

(defn seed-countries [db]
  (jdbc/insert-multi! db :country (get-data "countries")))

(defn seed-country-groups [db]
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
  (doseq [data (get-country-group-countries db)]
    (db.country-group/new-country-group-country db data)))

(defn map-organisation [db]
  (->> (get-data "organisations_new")
       (map (fn [x]
              (if-let [group (:country_group x)]
                (if-let [data (first (get-country-groups db [group]))]
                  (assoc x :country_group [(:id data)] :geo_coverage_type "regional")
                  (assoc x :country_group [] :geo_coverage_type "global"))
                (assoc x :country_group [] :geo_coverage_type "global"))))
       (map (fn [x]
              (if-let [country (:country x)]
                (if-let [data (first (get-country db [country]))]
                  (assoc x :country (:id data))
                  (assoc x :country nil))
                x)))))

(defn seed-organisations [db]
  (doseq [data (map-organisation db)]
      (let [org-id (:id (db.organisation/new-organisation db data))
            org-geo (:country_group data)]
        (when (not-empty org-geo)
          (let [res-geo (mapv #(assoc {} :organisation org-id :country_group %) org-geo)]
            (jdbc/insert-multi! db :organisation_geo_coverage res-geo))))))

(defn seed-currencies [db]
  (jdbc/execute! db ["TRUNCATE TABLE currency"])
  (doseq [data (get-data "currencies")]
    (db.currency/new-currency db data)))

(defn seed-languages [db]
  (doseq [data (reduce (fn [acc [k v]]
                         (conj acc {:iso_code (str/trim (name k))
                                    :english_name (:name v)
                                    :native_name (:nativeName v)}))
                       []
                       (get-data "languages"))]
    (db.language/new-language db data)))

(defn seed-tags [db]
  (doseq [data (get-data "tags" {:keywords? false})]
    (let [category (db.tag/new-tag-category db {:category (first data)})
          category-id (:id category)]
      (doseq [tag (map #(assoc {} :tag_category category-id :tag %) (second data))]
        (db.tag/new-tag db tag)))))

(defn get-resources [db]
  (->> (get-data "resources")
       (map (fn [x]
                (assoc x :publish_year (:publish_year x) :value (:value_amount x) :review_status "APPROVED")))
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
  (doseq [data (get-resources db)]
    (try
      (let [res-id (:id (db.resource/new-resource db data))
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


(defn get-events [db]
  (->> (get-data "events")
       (map (fn [x]
                (assoc x :city (:city x) :review_status "APPROVED")))
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
                (assoc x :event_language_url (get-language db language-url))
                x))
            )
       (map (fn [x]
              (if-let [tags (:tags x)]
                (assoc x :tags (get-ids (get-tag db tags)))
                x)))))

(defn seed-events [db]
  (doseq [data (get-events db)]
    (try
      (let [evt-id (:id (db.event/new-event db data))
            data-geo (:geo_coverage data)
            data-geo-type (:geo_coverage_type data)
            data-lang (:event_language_url data)
            data-tag (:tags data)]
        (when (not-empty data-geo)
          (if (= "regional" data-geo-type)
            (let [evt-geo (mapv #(assoc {} :event evt-id :country_group %) data-geo)]
              (jdbc/insert-multi! db :event_geo_coverage evt-geo))
            (let [evt-geo (mapv #(assoc {} :event evt-id :country %) data-geo)]
              (jdbc/insert-multi! db :event_geo_coverage evt-geo))))
        (when (not-empty data-lang)
          (let [evt-lang (map (fn [x] (assoc x :event evt-id)) data-lang)]
            (jdbc/insert-multi! db :event_language_url evt-lang)))
        (when (not-empty data-tag)
          (let [evt-tag (mapv #(assoc {} :event evt-id :tag %) data-tag)]
            (jdbc/insert-multi! db :event_tag evt-tag))))
      (catch Exception e
        (println data)
        (.printStackTrace e)
        (throw e)))))

(defn get-policies [db]
  (->> (get-data "policies")
       (map (fn [x]
                (assoc x :image (:image x))))
       (map (fn [x]
                (assoc x :value (:value_amount x) :review_status "APPROVED")))
       (map (fn [x]
                (assoc x :url (first (:url x)))))
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
  (doseq [data (get-policies db)]
    (try
      (let [po-id (:id (db.policy/new-policy db data))
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
                (assoc x :image (:image x))))
       (map (fn [x]
                (assoc x :logo (:logo x))))
       (map (fn [x]
                (assoc x :review_status "APPROVED")))
       (map (fn [x]
                (assoc x :url (first (:url x)))))
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
  (doseq [data (get-technologies db)]
    (try
      (let [tech-id (:id (db.technology/new-technology db data))
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
  (jdbc/insert-multi! db :action (get-data "actions")))

(defn get-action-details [db]
  (map (fn [x] (if-let [action (get-action db (:action x))]
          (assoc x :action (:id action)) x)) (get-data "action_details")))

(defn seed-action-details [db]
  (jdbc/insert-multi! db :action_detail (mapv #(dissoc % :type) (get-action-details db))))

(defn get-projects [db]
  (->> (get-data "projects")
       (map (fn [x]
              (assoc x :summary (:summary x))))
       (map (fn [x]
                (assoc x :review_status "APPROVED")))
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
  (doseq [data (get-projects db)]
    (try
      (let [proj-id (:id (db.project/new-project db data))
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

(defn get-cache-id []
  (str (java.util.UUID/randomUUID) "-" (quot (System/currentTimeMillis) 1000)))

(defn resync-country [db]
  (let [cache-id (get-cache-id)]
    (db.util/drop-constraint-country db cache-id)
    (println "Re-seeding country...")
    (seed-countries db)
    (db.util/revert-constraint db cache-id)))

(defn resync-country-group [db]
  (let [cache-id (get-cache-id)]
    (db.util/drop-constraint-country-group db cache-id)
    (println "Re-seeding country-group...")
    (seed-country-groups db)
    (db.util/revert-constraint db cache-id)
    (seed-country-group-country db)))

(defn resync-organisation [db]
  (let [cache-id (get-cache-id)]
    (db.util/drop-constraint-organisation db cache-id)
    (println "Re-seeding organisation...")
    (seed-organisations db)
    (db.util/revert-constraint db cache-id)))

(defn resync-policy [db]
  (let [cache-id (get-cache-id)]
    (db.util/drop-constraint-policy db cache-id)
    (println "Re-seeding policy...")
    (seed-policies db)
    (db.util/revert-constraint db cache-id)))

(defn resync-resource [db]
  (let [cache-id (get-cache-id)]
    (db.util/drop-constraint-resource db cache-id)
    (println "Re-seeding resource...")
    (seed-resources db)
    (db.util/revert-constraint db cache-id)))

(defn resync-technology [db]
  (let [cache-id (get-cache-id)]
    (db.util/drop-constraint-technology db cache-id)
    (println "Re-seeding technology...")
    (seed-technologies db)
    (db.util/revert-constraint db cache-id)))

(defn resync-event [db]
  (let [cache-id (get-cache-id)]
    (db.util/drop-constraint-event db cache-id)
    (println "Re-seeding event...")
    (seed-events db)
    (db.util/revert-constraint db cache-id)))

(defn resync-project [db]
  (let [cache-id (get-cache-id)]
    (db.util/drop-constraint-project db cache-id)
    (println "Re-seeding project...")
    (seed-projects db)
    (db.util/revert-constraint db cache-id)))

(defn seed
  ([db {:keys [country? currency?
               organisation? language? tag?
               policy? resource?
               technology? event?
               project?]
        :or {country? false
             currency? false
             organisation? false
             language? false
             tag? false
             policy? false
             resource? false
             technology? false
             event? false
             project? false}}]
   (jdbc/with-db-transaction [tx db]
     (println "-- Start Seeding")
     #_(truncate-db tx)
     (when country?
       (println "Seeding country...")
       (resync-country tx)
       (resync-country-group tx))
     (when currency?
       (println "Seeding currency...")
       (seed-currencies tx))
     (when organisation?
       (println "Seeding organisation...")
       (resync-organisation tx))
     (when language?
       (println "Seeding language...")
       (seed-languages tx))
     (when tag?
       (println "Seeding tag...")
       (seed-tags tx))
     (when policy?
       (println "Seeding policy...")
       (resync-policy tx))
     (when resource?
       (println "Seeding resource...")
       (resync-resource tx))
     (when technology?
       (println "Seeding technology...")
       (resync-technology tx))
     (when event?
       (println "Seeding event...")
       (resync-event tx))
     (when project?
       (println "Seeding project...")
       #_(seed-actions tx)
       #_(seed-action-details tx)
       (resync-project tx))
     (println "-- Done Seeding")))
  ([]
   (let [db (-> (dev-system)
              (ig/init [:duct.database.sql/hikaricp])
              :duct.database.sql/hikaricp
              :spec)]
     (seed db
       {:country? true
        :currency?  (db.util/is-empty db "currency")
        :organisation? true
        :language?  (db.util/is-empty db "language")
        :tag?  (db.util/is-empty db "tag")
        :policy? true
        :resource? true
        :technology? true
        :event? true
        :project? true})
     (gpml.handler.detail/cache-hierarchies! db))))

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

  ;; example resyncing

  (resync-country db)
  (resync-country-group db)
  (resync-policy db)
  (resync-resource db)
  (resync-organisation db)
  (resync-technology db)
  (resync-event db)
  (resync-project db)

  ;; get view table of topic
  (defn view-table-of [association]
    (->> (assoc association :v_topic_data (str "v_" (:topic association) "_data"))
         (db.exporter/get-topic-by-id db)
         :json))

  ;; get subscribed topic
  (defn get-subscribed-topic []
    (->> (db.exporter/get-stakeholder-info db)
         (mapv (fn [x]
             (if-let [topics (:associations x)]
               (assoc x :associations
                  (for [topic topics]
                    (assoc topic :data (view-table-of topic))))
               x)))))

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

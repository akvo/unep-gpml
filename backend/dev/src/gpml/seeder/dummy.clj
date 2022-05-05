(ns gpml.seeder.dummy
  (:require [duct.core :as duct]
            [clojure.string :as str]
            [clojure.java.jdbc :as jdbc]
            [gpml.db.event :as db.event]
            [gpml.db.initiative :as db.initiative]
            [gpml.db.tag :as db.tag]
            [gpml.db.country :as db.country]
            [gpml.db.language :as db.language]
            [gpml.db.country-group :as db.country-group]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.organisation :as db.organisation]
            [gpml.seeder.main :as seeder]
            [integrant.core :as ig]
            [clojure.java.io :as io]))

;; Dummy Content for UI eg. Pagination, Browse, etc
;; Also to Create test admin profile

(duct/load-hierarchy)

(defn- dev-system
  []
  (-> (duct/resource "gpml/config.edn")
      (duct/read-config)
      (duct/prep-config [:duct.profile/dev])))

(def lorem "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas luctus eros at consequat accumsan. Integer massa ligula, blandit at commodo vitae, vestibulum et erat.")

(defn get-country-id [db code]
  (:id (db.country/country-by-code db {:name code})))

(defn associate-tags [db data category]
  (mapv (fn [tag]
          (assoc data :tag (:id tag)))
        (take 3 (shuffle (db.tag/tag-by-category db {:category category})))))

(defn associate-geo [db data names]
  (mapv (fn [cg]
          (assoc data
                 :country_group (:id cg)
                 :country nil))
        (db.country-group/country-group-by-names db {:names names})))

(defn associate-url [db data]
  (let [language {:language
                  (:id (db.language/language-by-name db {:name "English"}))}
        prefix (str (-> data first first (str/replace ":" "")) "-" (-> data first second))]
    (mapv (fn [url] (conj data language
                          {:url (str "https://" prefix "-" url ".com")}))
          ["lorem", "dolor"])))

(defn register-organisation [db]
  (db.organisation/new-organisation db {:name "Akvo"
                                        :geo_coverage_type "global"
                                        :country (get-country-id db "NLD")
                                        :type "NGO and Major Groups and Stakeholder"
                                        :url "akvo.org"
                                        :review_status "APPROVED"}))

(defn get-org-id [db]
  (let [org (db.organisation/organisation-by-name db {:name "Akvo"})]
    (if org org (register-organisation db))))

(defn get-account-props [db]
  {:title "Mr"
   :representation "Non-Governmental Organization (NGO) and other Major Groups and Stakeholder (MGS)"
   :organisation_role "Developer"
   :about lorem
   :affiliation (:id (get-org-id db))
   :picture "https://directory.growasia.org/wp-content/uploads/solution_logos/0.jpg"})

(defn get-or-create-profile [db my-email my-name role review-status]
  (let [profile (db.stakeholder/stakeholder-by-email db {:email my-email})]
    (if profile
      profile
      (let [me (-> my-name (str/split #" "))
            new-profile (db.stakeholder/new-stakeholder
                         db (conj (get-account-props db)
                                  {:email my-email
                                   :first_name (first me)
                                   :last_name (last me)
                                   :country (get-country-id db "NLD")
                                   :geo_coverage_type "regional"
                                   :idp_usernames ["auth0|123"]
                                   :geo_coverage_value
                                   (map :id
                                        (db.country-group/country-group-by-names
                                         db {:names ["Africa" "Europe"]}))}))]
        (db.stakeholder/update-stakeholder-role
         db (assoc new-profile :role role :review_status review-status))
        (doseq [tag ["general" "seeking" "offering"]]
          (jdbc/insert-multi!
           db :stakeholder_tag (associate-tags db {:stakeholder (:id new-profile)} tag)))
        (jdbc/insert-multi!
         db :stakeholder_geo_coverage
         (associate-geo db {:stakeholder (:id new-profile)} ["Africa" "Europe"]))
        (db.stakeholder/stakeholder-by-id db new-profile)))))

(defn submit-dummy-event [db my-email my-name]
  (let [profile (get-or-create-profile db my-email my-name "ADMIN" "APPROVED")
        dummies (map-indexed (fn [idx data]
                               (-> data
                                   (assoc :title (str "Dummy Event - " idx)
                                          :description lorem
                                          :start_date "2022-01-01"
                                          :end_date "2022-01-01"
                                          :resource_language_url [{:language "English"
                                                                   :url "https://akvo.org"}]
                                          :review_status "SUBMITTED"
                                          :created_by (:id profile)
                                          :geo_coverage_type "regional"
                                          :city "Yogyakarta"
                                          :image "https://directory.growasia.org/wp-content/uploads/solution_logos/0.jpg"
                                          :country (get-country-id db "NLD"))
                                   (dissoc :id :languages :url)))
                             (seeder/get-data "events"))]
    (if (= 0 (-> (db.event/dummy db) first :count))
      (doseq [data dummies]
        (let [event {:event (:id (db.event/new-event db data))}]
          (jdbc/insert-multi! db :event_tag (associate-tags db event "events"))
          (jdbc/insert-multi! db :event_geo_coverage (associate-geo db event ["Africa" "Europe"]))
          (jdbc/insert-multi! db :event_language_url (associate-url db event))))
      (print "You have already seed dummy event"))))

(defn submit-dummy-initiative [db my-email my-name]
  (let [admin (get-or-create-profile db my-email my-name "ADMIN" "APPROVED")
        submission (seeder/parse-data
                    (slurp (io/resource "examples/submission-initiative.json"))
                    {:keywords? true})
        data (db.initiative/new-initiative
              db (assoc submission
                        :created_by (:id admin)
                        :version 1
                        :q23 {(keyword (str (get-country-id db "NLD"))) "Netherlands"}))]
    (db.initiative/initiative-by-id db data)))

(comment

  (def db (-> (dev-system)
              (ig/init [:duct.database.sql/hikaricp])
              :duct.database.sql/hikaricp
              :spec))

;; Create New Account as Admin
  (get-or-create-profile db "test@akvo.org" "Testing Profile" "ADMIN" "APPROVED")
  ;; Create New Account as Unapproved user
  (get-or-create-profile db "anothertest@akvo.org" "Another Testing" "USER" "SUBMITTED")

  ;; Create New Account or Get Account
  ;; Then create unapproved dummy events with the account
  (submit-dummy-event db "test@akvo.org" "Testing Profile")

  ;; Create New Account or Get Account
  ;; Then create unapproved dummy initiative with the account
  (submit-dummy-initiative db "test@akvo.org" "Testing Profile"))

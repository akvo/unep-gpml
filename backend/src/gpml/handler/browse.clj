(ns gpml.handler.browse
  (:require [clojure.string :as str]
            [gpml.db.browse :as db.browse]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(def technology-sample-data [{:id 1
                              :title "The Great Bubble Barrier"
                              :year_founded 2015
                              :country "The Netherlands"
                              :organisation_type "Startup"
                              :development_stage "Scale up"
                              :specifications_provided false
                              :email nil
                              :tags ["collection" "recovery" "partnerships" "funding"]
                              :geo_coverage_type "national"
                              :geo_coverage_countries ["NLD"]
                              :urls [{:url "https://thegreatbubblebarrier.com/" :language "en"}]
                              :attachments []
                              :remarks "Remarks"
                              :created "2021-01-01T00:00:00Z"
                              :modified "2021-01-01T00:00:00Z"}
                             {:id 2
                              :title "Floating Trash Barrier"
                              :year_founded 2010
                              :country "IND"
                              :organisation_type "Startup"
                              :development_stage "Scale up"
                              :specifications_provided true
                              :email nil
                              :tags ["collection" "recovery" "plastics" "waste" "water" "customers"]
                              :geo_coverage_type "national"
                              :geo_coverage_countries ["IND"]
                              :urls [{:url "https://www.alphamers.com/" :language "en"}]
                              :attachments []
                              :remarks "Remarks"
                              :created "2021-01-01T00:00:00Z"
                              :modified "2021-01-01T00:00:00Z"}])

(def event-sample-data [{:id 1
                         :title "Event 1"
                         :start_date "2021-01-01T10:00:00Z"
                         :end_date "2021-01-01T12:00:00Z"
                         :description "Description of the event"
                         :image nil
                         :geo_coverage_type "national"
                         :geo_coverage_countries ["KEN"]
                         :remarks "Remarks"
                         :tags ["microplastics" "sea-land interface" "state of knowledge"]
                         :urls [{:url "http://example.com/events/en/event1.html" :language "en"}
                                {:url "http://example.com/events/zh/event2.html" :language "zh"}]
                         :created "2021-01-01T00:00:00Z"
                         :modified "2021-01-01T00:00:00Z"}
                        {:id 2
                         :title "Event 2"
                         :start_date "2021-10-03T10:00:00Z"
                         :end_date "2021-10-03T12:00:00Z"
                         :description "Description of the event 2"
                         :image nil
                         :geo_coverage_type "global"
                         :geo_coverage_countries []
                         :remarks "Remarks"
                         :tags ["best practice" "inventory" "macroplastics"]
                         :urls [{:url "http://example.com/events/en/event2.html" :language "en"}
                                {:url "http://example.com/events/zh/event2.html" :language "zh"}]
                         :created "2021-01-01T00:00:00Z"
                         :modified "2021-01-01T00:00:00Z"}])

(def policy-sample-data [{:id 1
                          :title "Environment (Protection) Act, 1986 (No. 29 of 1986)"
                          :original_title "The Environment (Protection)Act, 1986"
                          :data_source "FAOLEX"
                          :country "IND"
                          :abstract "An Act to provide for the protection and improvement of environment and for matters connected therewith"
                          :type_of_law "Legislation"
                          :record_number "LEX-FAOC021695"
                          :implementing_mea nil
                          :first_publication_date "2015-12-03T00:00:00Z"
                          :latest_amendment_date nil
                          :status "In force"
                          :tags ["product ban"]
                          :geo_coverage_type "national"
                          :geo_coverage_countries ["IND"]
                          :urls [{:url "http://extwprlegs1.fao.org/docs/pdf/guy152293.pdf" :language "en"}]
                          :attachments ["http://extwprlegs1.fao.org/docs/pdf/guy152293.pdf"]
                          :remarks "Remarks"
                          :created "2021-01-01T00:00:00Z"
                          :modified "2021-01-01T00:00:00Z"}
                         {:id 2
                          :title "Waste Management Framework Law No.16 of 2020"
                          :original_title nil
                          :data_source "FAOLEX"
                          :country "Jordan"
                          :abstract "Abstract"
                          :type_of_law "Legislation"
                          :record_number "LEX-FAOC193637"
                          :implementing_mea "Basel Convention"
                          :first_publication_date "1998-01-01T00:00:00Z"
                          :latest_amendment_date nil
                          :status "In force"
                          :tags []
                          :geo_coverage_type "national"
                          :geo_coverage_countries ["JOR"]
                          :urls [{:url "https://www.legislation.gov.au/Details/F2012C00858" :language "en"}]
                          :attachments ["https://www.legislation.gov.au/Details/F2012C00858"]
                          :remarks "Remarks"
                          :created "2021-01-01T00:00:00Z"
                          :modified "2021-01-01T00:00:00Z"}])

(def resource-sample-data [{:id 1
                            :title "Resource 1"
                            :type "Financial Resource"
                            :publish_year 2020
                            :summary "Summary of the resource"
                            :value 100000
                            :value_currency "USD"
                            :image nil
                            :valid_from "2020-01-01T00:00:00Z"
                            :valid_to "2020-12-31T00:00:00Z"
                            :geo_coverage_type "national"
                            :geo_coverage_countries ["KEN"]
                            :attachments ["http://example.com/foo.pdf"]
                            :organisations ["GRID Arendal" "The Global Partnership of Marine Litter" "United Nation Environmental Programme"]
                            :tags ["microplastics" "sea-land interface" "state of knowledge"]
                            :urls [{:url "http://example.com/en/foo1.pdf" :language "en"}
                                   {:url "http://example.com/zh/foo1.pdf" :language "zh"}]
                            :remarks "Remarks"
                            :created "2021-01-01T00:00:00Z"
                            :modified "2021-01-01T00:00:00Z"}
                           {:id 2
                            :title "Resource 2"
                            :type "Technical Resource"
                            :publish_year 2020
                            :summary "Summary of the resource"
                            :value nil
                            :value_currency nil
                            :image nil
                            :valid_from "2020-01-01T00:00:00Z"
                            :valid_to "2020-12-31T00:00:00Z"
                            :geo_coverage_type "global with elements in specific areas"
                            :geo_coverage_countries ["KEN" "DEU" "IND"]
                            :attachments ["http://example.com/foo.pdf"]
                            :organisations ["GRID Arendal" "The Global Partnership of Marine Litter" "United Nation Environmental Programme"]
                            :tags ["mechanism" "best practice" "inland" "inventory" "macroplastics" "minimization" "prevention" "state of knowledge"]
                            :urls [{:url "http://example.com/en/foo1.pdf" :language "en"}
                                   {:url "http://example.com/zh/foo1.pdf" :language "zh"}]
                            :remarks "Remarks"
                            :created "2021-01-01T00:00:00Z"
                            :modified "2021-01-01T00:00:00Z"}])

(def project-sample-data [{:id 1
                           :title "Project 1"
                           :summary "Summary of the project"
                           :geo_coverage_type "national"
                           :geo_coverage_countries ["KEN"]
                           :attachments ["http://example.com/foo.pdf"]
                           :organisations ["GRID Arendal" "The Global Partnership of Marine Litter" "United Nation Environmental Programme"]
                           :tags ["microplastics" "sea-land interface" "state of knowledge"]
                           :remarks "Remarks"
                           :created "2021-01-01T00:00:00Z"
                           :modified "2021-01-01T00:00:00Z"}
                          {:id 2
                           :title "Resource 2"
                           :summary "Summary of the project"
                           :geo_coverage_type "global with elements in specific areas"
                           :geo_coverage_countries ["KEN" "DEU" "IND"]
                           :organisations ["GRID Arendal" "The Global Partnership of Marine Litter" "United Nation Environmental Programme"]
                           :tags ["mechanism" "best practice" "inland" "inventory" "macroplastics" "minimization" "prevention" "state of knowledge"]
                           :remarks "Remarks"
                           :created "2021-01-01T00:00:00Z"
                           :modified "2021-01-01T00:00:00Z"}])

(def sample-data
  (flatten [(map #(assoc % :type "event") event-sample-data)
            (take 1 (map #(assoc % :type "technology") technology-sample-data))
            (take 1 (map #(assoc % :type "resource") resource-sample-data))
            (take 1 (map #(assoc % :type "project") project-sample-data))
            (take 1 (map #(assoc % :type "policy") policy-sample-data))]))

(def country-re #"^(\p{Upper}{3})((,\p{Upper}{3})+)?$")
(def topics (vec (sort ["people" "event" "technology" "policy" "resource" "project"])))
(def topic-re (re-pattern (format "^(%1$s)((,(%1$s))+)?$" (str/join "|" topics))))

(def query-params
  [:map
   [:country {:optional true
              :swagger {:description "Comma separated list of country codes (ISO 3166-1 Alpha-3 code)"}}
    [:or
     [:string {:max 0}]
     [:re country-re]]]
   [:topic {:optional true
            :swagger {:description (format "Comma separated list of topics to filter: %s" (str/join "|" topics))}}
    [:or
     [:string {:max 0}]
     [:re topic-re]]]
   [:q {:optional true
        :swagger {:description "Text search term to be found on the different topics"}}
    [:string]]])

(defn get-db-filter
  [{:keys [q country topic]}]
  (merge {}
         (when (seq country)
           {:geo-coverage (conj (set (str/split country #",")) "***")})
         (when (seq topic)
           {:topic (set (str/split topic #","))})
         (when (seq q)
           {:search-text (-> q
                             (str/replace #"&" "")
                             (str/replace #" " " & "))})))

(defn results [query db]
  (let [data (->> query
                  (get-db-filter)
                  (db.browse/filter-topic db)
                  (map (fn [{:keys [json geo_coverage_iso_code topic]}]
                         (merge
                          (assoc json
                                 :type topic)
                          (when geo_coverage_iso_code
                            {:geo_coverage_countries [geo_coverage_iso_code]})))))]
    (tap> data)
    data))

(defmethod ig/init-key :gpml.handler.browse/get [_ {:keys [db]}]
  (fn [{{:keys [query]} :parameters}]

    (resp/response {:results (#'results query (:spec db))})))

(defmethod ig/init-key :gpml.handler.browse/query-params [_ _]
  query-params)

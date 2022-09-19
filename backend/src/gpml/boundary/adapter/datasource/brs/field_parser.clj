(ns gpml.boundary.adapter.datasource.brs.field-parser
  (:require [clojure.set :as set]
            [clojure.string :as str]
            [gpml.domain.event :as dom.event]
            [gpml.util :as util]
            [java-time :as jt]
            [java-time.temporal])
  (:import [org.jsoup Jsoup]
           [org.jsoup.nodes Entities]))

(def ^:private projects-url-template
  "http://www.basel.int/tabid/8783/pid/%d/Default.aspx")

(def ^:private brs-field->gpml-field
  {:publication {:description :summary
                 :files :info_docs
                 :updated :brs_api_modified
                 :id :brs_api_id
                 :thumbnailUrl :image
                 :keywords :tags}
   :meeting {:start :start_date
             :end :end_date
             :id :brs_api_id
             :updated :brs_api_modified
             :brs_linkRecording :recording
             :brs_linkRegistration :link_registration
             :imageUrl :image
             :brs_terms :tags
             :city :geo_coverage_type
             :country :geo_coverage
             :type :sub_content_type}
   :project {:ts :url
             :id :brs_api_id
             :updated :brs_api_modified
             :Beneficiaries :geo_coverage
             :Implementedby :entity_connections
             :Donors :entity_connections
             :isGlobal :geo_coverage_type
             :name :q2
             :description :q3
             :statusName :status
             :budget :q36
             :imagesurl :qimage
             :datestart :start_date
             :dateend :end_date
             :Terms :tags}})

;; Looks like all descriptions coming from BRS API are enclosed in
;; escaped or plain HTML. So, we always unescape first and then parse
;; the HTML to finally get the text from it.
(defn- html->plain-text
  [html]
  (.text (Jsoup/parse (Entities/unescape html))))

(defn- get-project-geo-coverage-type
  [beneficiaries global?]
  (cond
    global?
    :global

    (> (count beneficiaries) 1)
    :transnational

    :else
    :national))

(defn- get-meeting-geo-coverage-type
  [country]
  (if (seq country)
    :national
    :global))

(defn- value->instant
  [value]
  (-> value
      (java-time/local-date-time)
      (.atZone (java-time/zone-id "UTC"))
      (java-time/instant)))

(defn- value->geo-coverage
  [brs-api-id value]
  (map (fn [{:keys [country]}]
         (let [country-code (str/upper-case country)]
           (cond-> {:brs_api_id brs-api-id}
             (= (count country) 2)
             (assoc :iso_code_a2 country-code)

             (= (count country) 3)
             (assoc :iso_code_a3 country-code))))
       value))

(defn- value->entity-connections
  [brs-api-id value role]
  (map (fn [{:keys [Name]}]
         {:brs_api_id brs-api-id
          :name Name
          :role role})
       value))

(defn- value->tags
  [brs-api-id value]
  (reduce (fn [acc tag]
            (if (seq tag)
              (conj acc {:tag (str/trim tag)
                         :brs_api_id brs-api-id})
              acc))
          []
          value))

(defn- value->translations
  ([brs-api-id resource-name field value]
   (value->translations brs-api-id resource-name field value false))
  ([brs-api-id resource-name field value html->plain-text?]
   (reduce (fn [acc {:keys [value language]}]
             (if (seq value)
               (conj acc {:value (if-not html->plain-text?
                                   value
                                   (html->plain-text value))
                          :language language
                          :brs_api_id brs-api-id
                          :translatable_field (name (get-in brs-field->gpml-field [resource-name field] field))})
               acc))
           []
           value)))

(defmulti ^:private parse-brs-field
  (fn [_ _ resource-name field _]
    [resource-name field]))

(defmethod parse-brs-field [:publication :title]
  [_ brs-api-id resource-name field value]
  (value->translations brs-api-id resource-name field value))

(defmethod parse-brs-field [:publication :description]
  [_ brs-api-id resource-name field value]
  (value->translations brs-api-id resource-name field value true))

(defmethod parse-brs-field [:publication :tags]
  [_ brs-api-id _ _ value]
  (value->tags brs-api-id (map :value value)))

(defmethod parse-brs-field [:publication :keywords]
  [_ brs-api-id _ _ value]
  (value->tags brs-api-id (map :termValueInEnglish value)))

(defmethod parse-brs-field [:publication :published]
  [_ _ _ _ value]
  (when (seq value)
    (jt/as (jt/local-date-time value) :year)))

(defmethod parse-brs-field [:publication :updated]
  [_ _ _ _ value]
  (when (seq value)
    (value->instant value)))

(defmethod parse-brs-field [:publication :files]
  [_ brs-api-id resource-name field value]
  (value->translations brs-api-id resource-name field (map #(set/rename-keys % {:url :value}) value)))

(defmethod parse-brs-field [:meeting :description]
  [_ brs-api-id resource-name field value]
  (when (seq value)
    (value->translations brs-api-id resource-name field [{:value value :language "en"}] true)))

(defmethod parse-brs-field [:meeting :title]
  [_ brs-api-id resource-name field value]
  (when (seq value)
    (value->translations brs-api-id resource-name field [{:value value :language "en"}])))

(defmethod parse-brs-field [:meeting :brs_terms]
  [_ brs-api-id _ _ value]
  (when (seq value)
    (value->tags brs-api-id (str/split value #","))))

(defmethod parse-brs-field [:meeting :brs_linkRegistration]
  [_ brs-api-id resource-name field value]
  (when (seq value)
    (value->translations brs-api-id resource-name field [{:value value :language "en"}])))

(defmethod parse-brs-field [:meeting :country]
  [_ brs-api-id _ _ value]
  (when (seq value)
    (value->geo-coverage brs-api-id [{:country value}])))

(defmethod parse-brs-field [:meeting :type]
  [_ _ _ _ value]
  (when (seq value)
    (some (fn [s]
            (when (str/includes? (str/lower-case s) value)
              s))
          dom.event/sub-content-types)))

;; FIXME: uncomment this once BRS API fixes the Meeting dates.
;; (defmethod parse-brs-field [:meeting :updated]
;;   [_ _ _ _ value]
;;   (value->instant value))

(defmethod parse-brs-field [:project :name]
  [_ brs-api-id resource-name field value]
  (value->translations brs-api-id resource-name field [{:language "en" :value value}] true))

(defmethod parse-brs-field [:project :description]
  [_ brs-api-id resource-name field value]
  (value->translations brs-api-id resource-name field [{:language "en" :value value}] true))

(defmethod parse-brs-field [:project :objectives]
  [_ _ _ _ value]
  (html->plain-text value))

(defmethod parse-brs-field [:project :activities]
  [_ _ _ _ value]
  (html->plain-text value))

(defmethod parse-brs-field [:project :ts]
  [_ _ _ _ value]
  (format projects-url-template value))

(defmethod parse-brs-field [:project :datestart]
  [_ _ _ _ value]
  (value->instant value))

(defmethod parse-brs-field [:project :dateend]
  [_ _ _ _ value]
  (value->instant value))

(defmethod parse-brs-field [:project :updated]
  [_ _ _ _ value]
  (value->instant value))

(defmethod parse-brs-field [:project :Beneficiaries]
  [_ brs-api-id _ _ value]
  (value->geo-coverage brs-api-id value))

(defmethod parse-brs-field [:project :Implementedby]
  [_ brs-api-id _ _ value]
  (value->entity-connections brs-api-id value :implementor))

(defmethod parse-brs-field [:project :Donors]
  [_ brs-api-id _ _ value]
  (value->entity-connections brs-api-id value :donor))

(defmethod parse-brs-field [:project :budget]
  [_ _ _ _ value]
  (when (seq value)
    (Double/parseDouble value)))

(defmethod parse-brs-field [:project :Terms]
  [_ brs-api-id _ _ value]
  (value->tags brs-api-id (map :term value)))

(defmethod parse-brs-field :default
  [_ _ _ _ value]
  value)

(defn- brs-resource->gpml-resource*
  [config resource-name {:keys [id] :as odata-map}]
  (reduce (fn [acc [brs-field value]]
            (let [gpml-field (get-in brs-field->gpml-field [resource-name brs-field] brs-field)
                  parsed-value (parse-brs-field config id resource-name brs-field value)]
              (if (and (= :files brs-field) (= :publication resource-name))
                (assoc acc
                       gpml-field parsed-value
                       :url (->> parsed-value (filter #(= (:language %) "en")) first :value))
                (assoc acc
                       gpml-field
                       (cond
                         (get #{:tags :keywords} brs-field)
                         (concat (:tags acc) parsed-value)

                         (get #{:Implementedby :Donors} brs-field)
                         (concat (:entity_connections acc) parsed-value)

                         (= :isGlobal brs-field)
                         (get-project-geo-coverage-type (:Beneficiaries odata-map) parsed-value)

                         (= :city brs-field)
                         (get-meeting-geo-coverage-type (:country odata-map))

                         :else
                         parsed-value)))))
          {}
          odata-map))

(defn brs-entity->gpml-entity
  "FIXME"
  [config resource-name odata-map]
  (-> (brs-resource->gpml-resource* config resource-name odata-map)
       ;; Publication resources have the tags separated in multiple
       ;; keys. So, when parsing the fields we merge them together and
       ;; that could generate duplicates. We make sure here we don't
       ;; return duplicates.
      (util/update-if-not-nil :tags #(->> %
                                          (group-by (comp str/lower-case :tag))
                                          vals
                                          (map first)))))

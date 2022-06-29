(ns gpml.scheduler.leap-api-policy-importer
  (:require [clj-http.client :as client]
            [clojure.string :as str]
            [clojure.walk :as w]
            [duct.logger :refer [log]]
            [gpml.db.country :as db.country]
            [gpml.db.detail :as db.detail]
            [gpml.db.language :as db.language]
            [gpml.db.policy :as db.policy]
            [gpml.pg-util :as pg-util]                      ;; TODO: Merge this ns with sql-util one.
            [gpml.util :as util]
            [integrant.core :as ig]
            [java-time :as jt]
            [java-time.core]
            [java-time.local]
            [java-time.temporal]
            [jsonista.core :as j]
            [gpml.sql-util :as sql-util]
            [twarc.core :refer [defjob]]))

(defonce ^:private leap-api-base-url "https://leap.unep.org/informea/api/2.0/legislation")
(defonce ^:private leap-api-conn-timeout-ms 60000)
(defonce ^:private leap-api-max-items-per-page 500)
;; TODO: To decide over a sensible value here. We should just get a couple of pages when filtering is working fine.
(defonce ^:private leap-api-max-pages-to-process 2000)
;; TODO: This should be placed somewhere else to be re-used and be more visible.
(defonce ^:private default-lang :en)
;; TODO: These should be placed somewhere (to-create Domain layer) else to be re-used and be more visible.
(defonce ^:private policy-types-of-law #{"Legislation"
                                         "Regulation"
                                         "Miscellaneous"
                                         "Constitution"})

(defonce ^:private policy-status-opts #{"In force"
                                        "Repealed"
                                        "Not yet in force"})

(defonce ^:private policy-sub-content-types
  #{"Bans and Restrictions"
    "Combined Actions"
    "Economic Instruments"
    "Extended Producer Responsability (EPR) Schemes"
    "Other Actions"
    "Product standards Certification and Labeling requirements"
    "Waste Management Legislation"})

;; TODO: Move this to a shared space, as we are doing the same for Auth0
(defn- parse-response-body [response]
  (->> response
       :body
       j/read-value
       w/keywordize-keys))

(defn fetch-policies-from-leap-api
  "Calls to an API endpoint to retrieve policies from LEAP API

   It hardcodes a toolkit filter that should be always in place.

   It uses URL, connection parameters, page and items per page as options for the service.

   We are not interested on throwing exceptions as we are handling them ourselves.

   JSON is the supported format for this service so it is hardcoded there."
  [{:keys [base-url conn-timeout page items-per-page]}]
  (client/get (format "%s?toolkit=plastic&page=%s&items_per_page=%s"
                      base-url
                      page
                      items-per-page)
              {:content-type :json
               :throw-exceptions false
               :socket-timeout conn-timeout
               :connection-timeout conn-timeout}))

(defmulti parse-policy-leap-api-field
  "Parse a policy field from LEAP API for the canonical domain representation, by `field-type`

           `:translated-field` --> Given a language it tries to get the value out of a map, falling back to getting
           the first value from that map. It returns the value or nil if it is not there or it is empty.

           `:iso-code` --> Given options collection grouped by iso-code, it returns the value of an option using the
           iso-code as the field value to find it among all the options.
           The field value can be put inside a single-element array, sometimes, so there is a flag to indicate that.

           `:predefined-opt` --> Given a set of options it tries to match one of those given the field value.
           The field value can be put inside a single-item array and it might need to be normalized as well.
           There is an extra functionality to coerce a value depending on a condition.

           `:date` --> Parse a string-formatted date into a local java date.

           `:timestamp` --> Parse a string-formatted timestamp into a java time instant (UTC).

           `:collection` --> Parses a collection as field value, mapping a specific property for the collection,
           dealing with outputting empty or nil value depending on the options given as well.

           `:nilable-str` --> Returns either the input string or `nil` if the string was empty.

           `:uuid` --> Returns a native UUID from a given string field representing a UUID."
  (fn [field-type _ & _] field-type))

;; TODO: Currently this get only default translation, but we will need to see if we are going to keep it like that
;; or store all the translations somehow (which requires quite more effort but it looks to be what is needed).
(defmethod parse-policy-leap-api-field :translated-field
  [_ field-value & {:keys [target-lang]}]
  (let [value (or (get field-value target-lang)
                  (first (vals field-value)))]
    (when (seq value)
      value)))

;; TODO: Make sure we also populate "policy_geo_coverage" linking the policy and the country (not really to be done here but).
(defmethod parse-policy-leap-api-field :iso-code
  [_ field-value & {:keys [opts-by-iso-code single-item-array-val?]}]
  (let [iso-val (if single-item-array-val?
                  (first field-value)
                  field-value)]
    (get-in opts-by-iso-code [iso-val 0 :id])))

(defmethod parse-policy-leap-api-field :predefined-opt
  [_ field-value & {:keys [available-opts single-item-array-val? capitalize? coercion]}]
  (let [value (if single-item-array-val?
                (first field-value)
                field-value)
        parsed-value (if (and value capitalize?)
                       (str/capitalize value)
                       value)]
    (if (:condition-met? coercion)
      (:value coercion)
      (when (contains? available-opts parsed-value)
        parsed-value))))

(defmethod parse-policy-leap-api-field :date
  [_ field-value & _]
  (when (seq field-value)
    (jt/local-date field-value)))

(defmethod parse-policy-leap-api-field :timestamp
  [_ field-value & _]
  (when (seq field-value)
    (jt/instant field-value)))

(defmethod parse-policy-leap-api-field :collection
  [_ field-value & {:keys [target-prop-key allow-empty?]}]
  (let [value (mapv #(if target-prop-key
                       (get % target-prop-key)
                       %)
                    field-value)]
    (cond (and allow-empty?
               (empty? value)) value
          (empty? value)  nil
          :else value)))

(defmethod parse-policy-leap-api-field :nilable-str
  [_ field-value & _]
  (when (seq field-value)
    field-value))

(defmethod parse-policy-leap-api-field :uuid
  [_ field-value & _]
  (util/uuid field-value))

(defn- is-repealed-policy?
  [{:keys [isRepealed]}]
  isRepealed)

;; TODO: Not sure if we should refer to "persistence" instead of "db". Here the layering has "db".
(defn- policy->db-policy
  "Transform policy to be ready to be persisted in DB

   We want to have a specific function for this, since thus we can keep untouched
   the canonical entity representation."
  [policy]
  (-> policy
      (util/update-if-exists :geo_coverage_type #(sql-util/keyword->pg-enum % "geo_coverage_type"))
      (util/update-if-exists :review_status #(sql-util/keyword->pg-enum % "review_status"))
      (util/update-if-exists :leap_api_modified #(sql-util/instant->sql-timestamp %))
      (util/update-if-exists :first_publication_date jt/sql-date)
      (util/update-if-exists :latest_amendment_date jt/sql-date)
      (util/update-if-exists :attachments sql-util/coll->pg-jsonb)
      (util/update-if-exists :topics #(pg-util/->JDBCArray % "text"))))

(defn- build-policy-item-data
  "Given a batch policy item (from LEAP API) and options return the data needed for
   representing the canonical Policy entity.

   There is a multimethod to process each field given similar characteristics. In that way, this can be better
   maintained.

   `:sub_content_type` field need to be checked once we get some value from LEAP API, as we are not sure if the
   way to transform the data will be the right one.

   `:leap_api_modified` field can be already transformed into a java time instant, if we are coming from the Update
    flow, so that is why we apply a conditional transformation there."
  [{:keys [title originalTitle source country abstract type
           dateOfText lastAmendmentDate status files link regulatoryApproach
           topics language id updated] :as policy-raw}
   {:keys [default-lang
           countries-by-iso-code
           languages-by-iso-code
           policy-types-of-law
           policy-status-opts
           policy-sub-content-types]}]
  {:title (parse-policy-leap-api-field :translated-field title :target-lang default-lang)
   :original_title (parse-policy-leap-api-field :nilable-str originalTitle)
   :data_source (parse-policy-leap-api-field :nilable-str source)
   :country (parse-policy-leap-api-field
             :iso-code
             country
             :opts-by-iso-code
             countries-by-iso-code
             :single-item-array-val?
             true)
   :abstract (parse-policy-leap-api-field :translated-field abstract :target-lang default-lang)
   :type_of_law (parse-policy-leap-api-field
                 :predefined-opt
                 type
                 :available-opts
                 policy-types-of-law
                 :single-item-array-val?
                 true)
   :first_publication_date (parse-policy-leap-api-field :date dateOfText)
   :latest_amendment_date (parse-policy-leap-api-field :date lastAmendmentDate)
   :status (parse-policy-leap-api-field
            :predefined-opt
            status
            :available-opts
            policy-status-opts
            :capitalize?
            true
            :coercion {:condition-met? (is-repealed-policy? policy-raw)
                       :value "Repealed"})
   :geo_coverage_type :national
   :attachments (parse-policy-leap-api-field
                 :collection
                 files
                 :target-prop-key
                 :url
                 :allow-empty?
                 true)
   :review_status :APPROVED
   :url (parse-policy-leap-api-field :nilable-str link)
   :sub_content_type (parse-policy-leap-api-field ;; TODO: Check expected format when we get something!
                      :predefined-opt
                      regulatoryApproach
                      :available-opts
                      policy-sub-content-types)
   :topics (parse-policy-leap-api-field :collection topics)
   :language (parse-policy-leap-api-field
              :iso-code
              language
              :opts-by-iso-code
              languages-by-iso-code)
   :leap_api_id (parse-policy-leap-api-field :uuid id)
   :leap_api_modified (if-not (jt/instant? updated)
                        (parse-policy-leap-api-field :timestamp updated)
                        updated)})

(defn- processed-new-policies-from-batch
  "Process each batch item to generate policies data for creation"
  [policies-batch-items opts]
  (reduce (fn [policies-acc policy-batch-item]
            (let [policy (build-policy-item-data policy-batch-item opts)]
              (vec (conj policies-acc policy))))
          []
          policies-batch-items))

(defn- processed-policies-to-update-from-batch
  "Process each existing policy to add the respective batch item info

   Only existing policy id is needed to be kept for the update as no more data is going to be updated."
  [existing-policies policies-batch-items-lookup opts]
  (reduce (fn [policies-acc {:keys [leap_api_id] :as existing-policy}]
            (let [str-leap-api-id (str leap_api_id)
                  policy-batch-item (get-in policies-batch-items-lookup [str-leap-api-id 0])
                  policy-to-update (merge (select-keys existing-policy [:id])
                                          (build-policy-item-data policy-batch-item opts))]
              (vec (conj policies-acc policy-to-update))))
          []
          existing-policies))

(defn- update-policies-batch
  "Update policies batch one by one

   Here a generic resource update function is used. We just need to pass the entity's id and its data as `updates`
   per each batch item to update.
   We also specify the table's name for the query.

   It doesn't return anything since it is not needed.

   `:skip-casting?` flag need to be passed as true in order to avoid casting when building the update queries, since
   we are already transforming the data before using the DB query generation function, as that is more explicit and
   that way we can re-use same transformation functions as for the creation of policies."
  [db-conn policies-to-update]
  (doseq [{:keys [id] :as policy-to-update} policies-to-update]
    (db.detail/update-resource-table
     db-conn
     {:table "policy"
      :id id
      :skip-casting? true
      :updates (dissoc policy-to-update :id :leap_api_id)})))

(defn- handle-policy-creation-batch
  "Create policies from a batch

   Given a collection of policies we persist them in the DB.
   For that we need to provide the columns of the policy entity and the values in the right shape for the DB layer.

   It returns the generated policy ids.

   The operation is atomic in the sense that either all the policies are persisted or no one, as that is more performant
   and easier to handle."
  [db-conn new-policies opts]
  (let [processed-new-policies (processed-new-policies-from-batch new-policies opts)
        processed-new-db-policies (mapv policy->db-policy processed-new-policies)
        policy-columns (sql-util/get-insert-columns-from-entity-col processed-new-db-policies)
        processed-new-policies-vals (when (seq processed-new-db-policies)
                                      (sql-util/entity-col->persistence-entity-col processed-new-db-policies))]
    (when (seq processed-new-policies-vals)
      (db.policy/create-policies db-conn {:insert-cols policy-columns
                                          :policies processed-new-policies-vals}))))

(defn- handle-policy-update-batch
  "Update policies from a batch, given their reference from DB

   In order to be more accurate, we only update the policies that have been modified more recently than the last time
   they were modified. We check that with a field that is coming for each batch item, so we compare the value stored in
   the DB with the one coming from the batch (API): `updated`.

   Before we can persist the data we need to apply some transformations to give it the right shape for the DB layer."
  [db-conn batch-items existing-policies opts]
  (let [batch-items-parsed-modif-dates (mapv #(update
                                               %
                                               :updated
                                               (fn [updated]
                                                 (when updated
                                                   (jt/instant updated))))
                                             batch-items)
        policy-batch-lookup (group-by :id batch-items-parsed-modif-dates)
        policies-to-update (filter (fn [{:keys [leap_api_id leap_api_modified]}]
                                     (let [str-leap-api-id (str leap_api_id)
                                           leap-api-new-modif (get-in policy-batch-lookup [str-leap-api-id 0 :updated])]
                                       (and leap-api-new-modif
                                            leap_api_modified
                                            (jt/after? leap-api-new-modif
                                                       (sql-util/sql-timestamp->instant leap_api_modified)))))
                                   existing-policies)
        processed-policies-to-update (processed-policies-to-update-from-batch
                                      policies-to-update
                                      policy-batch-lookup
                                      opts)
        processed-db-policies-to-update (mapv policy->db-policy processed-policies-to-update)]
    (when (seq processed-db-policies-to-update)
      (update-policies-batch db-conn processed-db-policies-to-update))
    (count processed-db-policies-to-update)))

(defn- handle-policy-import-batch
  "Handle creation and update of policies based on given batch

   It returns the number of created and updated policies.

   The way to know which policies need to be created and which ones updated is by trying to match the policies
   coming from the LEAP API batch, using the `leap_api_id` (as batch item id) field to find them in the DB.
   Once the existing ones are found, we know that the policies to create are the remaining ones."
  [{:keys [db]} batch-items opts]
  (let [conn (:spec db)
        batch-item-ids (mapv #(util/uuid (:id %))
                             batch-items)
        existing-policies (db.policy/filtered-policies conn {:leap_api_ids batch-item-ids})
        existing-policies-set (set (mapv #(get % :leap_api_id)
                                         existing-policies))
        new-policies (filter #(not (contains? existing-policies-set
                                              (-> % :id util/uuid)))
                             batch-items)
        created-policy-ids (handle-policy-creation-batch conn new-policies opts)
        num-policies-to-update (handle-policy-update-batch conn batch-items existing-policies opts)]
    {:created-policies (count created-policy-ids)
     :updated-policies num-policies-to-update}))

;; TODO: Handle retrials in smart way, as it is not worth to implement simplistic retrial since it is unlikely
;; that we get a different result without any additional delay if we just make subsequent attempts.
(defn- handle-policy-import-batches
  "Handle the import of all batches of policies coming from LEAP API

   Given some configuration about the number of batches and the items per batch, this function is executed recursively
   until either all the batches are processed, some predefined limit is reached or there is an error processing any
   of those batches.

   When any error occurs, it is logged, along the status information about how many batches and items have been processed
   until that point.

   If there are no results for a given batch, we consider there are no more batches to process.

   For each batch processed we accumulate info about created and updated policies, which is outputted at the end."
  [{:keys [logger] :as config}
   {:keys [leap-api-base-url leap-api-conn-timeout-ms leap-api-max-items-per-page
           leap-api-max-pages-to-process default-lang countries-by-iso-code
           languages-by-iso-code policy-types-of-law policy-status-opts policy-sub-content-types]}]
  (loop [batch-data-acc {:batch-idx 0
                         :operation-result {:created-policies 0
                                            :updated-policies 0}}]
    (let [batch-idx (:batch-idx batch-data-acc)
          operation-status {:processed-batches batch-idx
                            :created-policies (get-in batch-data-acc [:operation-result :created-policies])
                            :updated-policies (get-in batch-data-acc [:operation-result :updated-policies])}]
      (if (< batch-idx leap-api-max-pages-to-process)
        (let [{:keys [status] :as leap-policies-resp} (fetch-policies-from-leap-api
                                                       {:base-url leap-api-base-url
                                                        :conn-timeout leap-api-conn-timeout-ms
                                                        :page batch-idx
                                                        :items-per-page leap-api-max-items-per-page})]
          (if (= 200 status)
            (let [parsed-policy-batch-items (parse-response-body leap-policies-resp)]
              (if (seq parsed-policy-batch-items)
                (let [import-result (handle-policy-import-batch
                                     config
                                     parsed-policy-batch-items
                                     {:default-lang default-lang
                                      :countries-by-iso-code countries-by-iso-code
                                      :languages-by-iso-code languages-by-iso-code
                                      :policy-types-of-law policy-types-of-law
                                      :policy-status-opts policy-status-opts
                                      :policy-sub-content-types policy-sub-content-types})]
                  (recur (-> batch-data-acc
                             (update :operation-result #(merge-with + % import-result))
                             (update :batch-idx inc))))
                (log logger :info ::leap-api-policy-importer.import-completed
                     {:result (merge {:success? true}
                                     operation-status)})))
            (log logger :error ::leap-api-policy-importer.import-failed
                 (merge {:success? false}
                        (select-keys leap-policies-resp [:status :reason-phrase])
                        operation-status))))
        (log logger :info ::leap-api-policy-importer.import-completed-with-limit
             {:result (merge {:success? true}
                             operation-status)})))))

(defn- import-policies-from-leap-api
  "Import policies from LEAP API

   Given a set of predefined options it performs importation of policies (create and update).
   All the options defined as constants are provided here to inner functions to keep them pure.

   Any error is caught and logged during the process.
   If there are no errors some info logs are generated as well."
  [{:keys [logger db] :as config}]
  (try
    (let [conn (:spec db)
          all-countries (db.country/all-countries conn)
          countries-by-iso-code (when (seq all-countries)
                                  (group-by :iso_code all-countries))
          all-languages (db.language/all-languages conn)
          languages-by-iso-code (when (seq all-languages)
                                  (group-by :iso_code all-languages))]
      (handle-policy-import-batches config {:leap-api-base-url leap-api-base-url
                                            :leap-api-conn-timeout-ms leap-api-conn-timeout-ms
                                            :leap-api-max-items-per-page leap-api-max-items-per-page
                                            :leap-api-max-pages-to-process leap-api-max-pages-to-process
                                            :default-lang default-lang
                                            :countries-by-iso-code countries-by-iso-code
                                            :languages-by-iso-code languages-by-iso-code
                                            :policy-types-of-law policy-types-of-law
                                            :policy-status-opts policy-status-opts
                                            :policy-sub-content-types policy-sub-content-types}))
    (catch Throwable e
      (let [error-details {:error-code (class e)
                           :message (.getMessage e)}]
        (log logger :error ::leap-api-policy-importer.import-failed error-details)))))

(defjob handle-leap-api-policy-import-job
  [_scheduler config]
  (import-policies-from-leap-api config))

(defn- schedule-job [{:keys [scheduler logger] :as config} scheduler-config]
  (let [time-zone (java.util.TimeZone/getTimeZone (:time-zone scheduler-config))]
    (log logger :info :handle-leap-api-policy-import scheduler-config)
    (handle-leap-api-policy-import-job scheduler
                                       [config]
                                       :trigger {:cron {:expression (:cron scheduler-config)
                                                        :misfire-handling :fire-and-process
                                                        :time-zone time-zone}}
                                       :job {:identity (:identity scheduler-config)})))

(defmethod ig/init-key :gpml.scheduler/leap-api-policy-importer
  [_ {:keys [config scheduler-config]}]
  (schedule-job config scheduler-config))

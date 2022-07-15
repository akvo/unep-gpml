(ns gpml.scheduler.leap-api-policy-importer
  (:require [clj-http.client :as client]
            [clojure.java.jdbc :as jdbc]
            [clojure.string :as str]
            [clojure.walk :as w]
            [duct.logger :refer [log]]
            [gpml.db.country :as db.country]
            [gpml.db.country-group :as db.country-group]
            [gpml.db.detail :as db.detail]
            [gpml.db.language :as db.language]
            [gpml.db.policy :as db.policy]
            [gpml.db.resource.tag :as db.resource.tag]
            [gpml.db.tag :as db.tag]
            [gpml.util :as util]
            [gpml.util.sql :as sql-util]
            [integrant.core :as ig]
            [java-time :as jt]
            [java-time.core]
            [java-time.local]
            [java-time.temporal]
            [jsonista.core :as j]
            [twarc.core :refer [defjob]]))

(defonce ^:private leap-api-base-url "https://leap.unep.org/informea/api/2.0/legislation")
(defonce ^:private leap-api-conn-timeout-ms 60000)
(defonce ^:private leap-api-max-items-per-page 500)
;; TODO: To decide over a sensible value here. We should just get a couple of pages when filtering is working fine.
(defonce ^:private leap-api-max-pages-to-process 2000)
;; TODO: This should be placed somewhere else to be re-used and be more visible.
(defonce ^:private default-lang :en)
(defonce ^:private policy-tag-category-name "leap api")
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

   `:uuid` --> Returns a native UUID from a given string field representing a UUID.

   `:tags` --> Get a collection of tags from different properties provided as `tag-groups`.
   Each tag group can use `target-prop-key` param to access each tag item content.

   In this function, we build some metadata for each tag item in order to be able to identify its related
   policy once that is created (leap-api-id) and be able to compare the name with existing tags
   (normalized-tag-name), adding its id in case the tag already exists, to be handled properly.

   In this function duplicated/empty tags are also removed.

   `:implementing-meas` --> Given implementing meas collection grouped by name, it returns the value of an option using
    the name as the field value to find it among all the options. Then its id is used as replacement for the value.

    For now only the first value found is stored since the model and the function will need to be changed to support
    storing multiple values."
  (fn [field-type _ & _] field-type))

(defmethod parse-policy-leap-api-field :translated-field
  [_ field-value & {:keys [target-lang]}]
  (let [value (or (get field-value target-lang)
                  (first (vals field-value)))]
    (when (seq value)
      value)))

(defmethod parse-policy-leap-api-field :iso-code
  [_ field-value & {:keys [opts-by-iso-code single-item-array-val?]}]
  (let [iso-val (if single-item-array-val?
                  (first field-value)
                  field-value)]
    (get-in opts-by-iso-code [iso-val 0 :id])))

;; TODO: Extend this to support storing multiple values.
;; TODO: Improve this by checking normalized values.
;; Right now the model doesn't support it so we get only the first value from the collection.
(defmethod parse-policy-leap-api-field :implementing-meas
  [_ field-value & {:keys [opts-by-name]}]
  (let [implementing-mea-name (first field-value)]
    (get-in opts-by-name [implementing-mea-name 0 :id])))

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

(defn- parse-leap-api-policy-tag
  "Given a tag name, it tries to find its related data, comparing its normalized name against the provided collection

   If an existing tag is found, its id is provided as part of the metadata item, to be handled accordingly.

   Regardless of the tag to be new or not, its normalized and raw name are added as properties, since the relation
   will need to be registered.

   Additionally, `leap-api-id` field is used to later identify the policy (to be created) related to the tag."
  [leap-api-id tags-by-normalized-name tag-name]
  (let [normalized-tag-name (str/lower-case tag-name)
        existing-tag (get-in tags-by-normalized-name [normalized-tag-name 0])
        tag-id (:id existing-tag)]
    {:normalized-tag-name normalized-tag-name
     :tag-name tag-name
     :tag-id tag-id
     :leap-api-id (util/uuid leap-api-id)}))

(defn- add-policy-field-tags
  "Add policy field tags to accumulator from a given tag group

   Given the values as a collection of the tag group involved (a specific raw policy's property), it adds
   the parsed tags to the accumulator, checking no duplicates are added.

   In order to parse the different tags for the group, it uses provided `target-prop-key` if present, in order
   to access the target property where the tag content is. Some tag groups do have this and others not."
  [tags-acc tag-group-vals leap-api-id tags-by-normalized-name target-prop-key]
  (reduce (fn [current-tags-acc field-value-item]
            (let [registered-tags-set (->> current-tags-acc
                                           (mapv #(get % :normalized-tag-name))
                                           set)
                  parsed-val (if target-prop-key
                               (get field-value-item target-prop-key)
                               field-value-item)
                  parsed-tag (when (seq parsed-val)
                               (parse-leap-api-policy-tag leap-api-id tags-by-normalized-name parsed-val))]
              (if (and (not (get registered-tags-set (:normalized-tag-name parsed-tag)))
                       (seq parsed-tag))
                (vec (conj current-tags-acc parsed-tag))
                current-tags-acc)))
          tags-acc
          tag-group-vals))

(defmethod parse-policy-leap-api-field :tags
  [_ field-value & {:keys [tag-groups leap-api-id tags-by-normalized-name]}]
  (reduce (fn [tags-acc {:keys [policy-item-key target-prop-key]}]
            (let [tag-group-vals (get field-value policy-item-key [])]
              (add-policy-field-tags
               tags-acc
               tag-group-vals
               leap-api-id
               tags-by-normalized-name
               target-prop-key)))
          []
          tag-groups))

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
           topics language id updated implementingMeas] :as policy-raw}
   {:keys [default-lang
           countries-by-iso-code
           languages-by-iso-code
           tags-by-normalized-name
           mea-country-groups-by-name
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
   :sub_content_type (parse-policy-leap-api-field
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
                        updated)
   :tags (parse-policy-leap-api-field
          :tags
          policy-raw
          :tag-groups
          [{:policy-item-key :keywords
            :target-prop-key :term}
           {:policy-item-key :plasticToolkitTags}]
          :leap-api-id
          id
          :tags-by-normalized-name
          tags-by-normalized-name)
   :implementing_mea (parse-policy-leap-api-field
                      :implementing-meas
                      implementingMeas
                      :opts-by-name
                      mea-country-groups-by-name)})

(defn- processed-new-policies-from-batch
  "Process each batch item to generate policies data for creation

   Regarding the policies data, new tags are registered for creation, as well as policy-tags (the relationships
   between policy and tag entities), skipping duplicated data, by comparing normalized tag names to detect those.
   Besides, we also register policy-geo-coverage data, that are relationships similar to policy-tags ones.

   In order to detect the new tags to be created we filter all the collection to get the ones that do not have an id."
  [policies-batch-items opts]
  (let [policies-data-acc {:new-tags []
                           :policy-tags []
                           :policies []
                           :policy-geo-coverage []}]
    (reduce (fn [policies-acc policy-batch-item]
              (let [policy (build-policy-item-data policy-batch-item opts)
                    {:keys [country leap_api_id]} policy
                    tags (:tags policy)
                    registered-tags-set (->> policies-acc
                                             :new-tags
                                             (mapv #(get % :normalized-tag-name))
                                             set)
                    new-tags (->> tags
                                  (filter #(nil? (:tag-id %)))
                                  (filter #(not (get registered-tags-set (:normalized-tag-name %)))))
                    policies-acc-with-geo-coverage (if-not (nil? country)
                                                     (update
                                                      policies-acc
                                                      :policy-geo-coverage
                                                      #(vec (conj % {:country-id country
                                                                     :leap-api-id leap_api_id})))
                                                     policies-acc)
                    updated-policies-acc (-> policies-acc-with-geo-coverage
                                             (update :policy-tags #(vec (concat % tags)))
                                             (update :policies #(vec (conj % policy))))]
                (if (seq new-tags)
                  (update updated-policies-acc :new-tags #(vec (concat % new-tags)))
                  updated-policies-acc)))
            policies-data-acc
            policies-batch-items)))

(defn- processed-policies-to-update-from-batch
  "Process each existing policy to add the respective batch item info

   Only existing policy id is needed to be kept for the update as no more data is going to be updated.

   In order to build new tags, policy-tags and policy-geo-coverage data we use the same strategy as when creating
   policies."
  [existing-policies policies-batch-items-lookup opts]
  (let [policies-data-acc {:new-tags []
                           :policy-tags []
                           :policies []
                           :policy-geo-coverage []}]
    (reduce (fn [policies-acc {:keys [country leap_api_id] :as existing-policy}]
              (let [str-leap-api-id (str leap_api_id)
                    policy-batch-item (get-in policies-batch-items-lookup [str-leap-api-id 0])
                    policy-to-update (merge (select-keys existing-policy [:id])
                                            (build-policy-item-data policy-batch-item opts))
                    tags (:tags policy-to-update)
                    registered-tags-set (->> policies-acc
                                             :new-tags
                                             (mapv #(get % :normalized-tag-name))
                                             set)
                    new-tags (->> tags
                                  (filter #(nil? (:tag-id %)))
                                  (filter #(not (get registered-tags-set (:normalized-tag-name %)))))

                    policies-acc-with-geo-coverage (if-not (nil? country)
                                                     (update
                                                      policies-acc
                                                      :policy-geo-coverage
                                                      #(vec (conj % {:country-id country
                                                                     :leap-api-id leap_api_id})))
                                                     policies-acc)
                    updated-policies-acc (-> policies-acc-with-geo-coverage
                                             (update :policy-tags #(vec (concat % tags)))
                                             (update :policies #(vec (conj % policy-to-update))))]
                (if (seq new-tags)
                  (update updated-policies-acc :new-tags #(vec (concat % new-tags)))
                  updated-policies-acc)))
            policies-data-acc
            existing-policies)))

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

;; TODO: Split a bit this function.
(defn- handle-policy-and-dependent-entities-creation
  "Handle atomically the creation of policy and dependent entities

   We use a DB transaction to ensure that all the target entities are persisted or none of them.
   It returns a map with created policies and tags (as we need to share this info to avoid additional
   queries to the DB).

   For now the dependent entities are tags and geo-coverage related data."
  [main-conn
   processed-new-policies-vals
   policy-columns
   new-tags-by-norm-name
   policy-tags
   processed-policies-geo-coverage]
  (jdbc/with-db-transaction
    [trans-conn main-conn]
    (let [created-policies (when (seq processed-new-policies-vals)
                             (db.policy/create-policies trans-conn {:insert-cols policy-columns
                                                                    :policies processed-new-policies-vals}))
          policies-by-leap-api-id (when (seq created-policies)
                                    (group-by :leap_api_id created-policies))
          processed-policy-tags (mapv (fn [{:keys [leap-api-id normalized-tag-name tag-id]}]
                                        (let [target-policy (get-in policies-by-leap-api-id [leap-api-id 0])
                                              target-tag (when (nil? tag-id)
                                                           (get-in new-tags-by-norm-name [normalized-tag-name 0]))
                                              resolved-tag-id (or tag-id
                                                                  (:id target-tag))]
                                          {:policy (:id target-policy)
                                           :tag resolved-tag-id}))
                                      policy-tags)
          policies-geo-coverage (mapv (fn [{:keys [leap-api-id country-id]}]
                                        (let [target-policy (get-in policies-by-leap-api-id [leap-api-id 0])]
                                          {:policy (:id target-policy)
                                           :country country-id}))
                                      processed-policies-geo-coverage)
          policy-geo-cov-columns (sql-util/get-insert-columns-from-entity-col policies-geo-coverage)
          policy-geo-cov-vals (when (seq policies-geo-coverage)
                                (sql-util/entity-col->persistence-entity-col policies-geo-coverage))
          policy-tag-insert-keys [:policy :tag]
          processed-policy-tag-values (when (seq processed-policy-tags)
                                        (sql-util/entity-col->persistence-entity-col
                                         processed-policy-tags
                                         :insert-keys
                                         policy-tag-insert-keys))]
      (when (seq processed-policy-tags)
        (db.resource.tag/create-resource-tags
         trans-conn
         {:table "policy_tag"
          :resource-col "policy"
          :tags processed-policy-tag-values}))
      (when (seq policy-geo-cov-vals)
        (db.policy/add-policies-geo
         trans-conn
         {:insert-cols policy-geo-cov-columns
          :geo policy-geo-cov-vals}))
      {:created-policies created-policies
       :new-tags-by-norm-name new-tags-by-norm-name})))

;; TODO: Split this function/organize it better.
(defn- handle-policy-creation-batch
  "Create policies from a batch

   Given a collection of policies we persist them in the DB.
   For that we need to provide the columns of the policy entity and the values in the right shape for the DB layer.

   It returns a map with generated policy ids and new tags (as map indexed by normalized tag name).

   The operation is atomic in the sense that either all the policies are persisted or no one, as that is more performant
   and easier to handle. However, tags are anyway created, since there is no point on rolling back that, as eventually
   those tags will be used by the incoming policies."
  [db-conn new-policies {:keys [policy-tag-category-id] :as opts}]
  (let [processed-new-policies-data (processed-new-policies-from-batch new-policies opts)
        processed-new-tags (mapv (fn [{:keys [tag-name]}]
                                   {:tag tag-name
                                    :tag_category policy-tag-category-id
                                    :review_status :SUBMITTED})
                                 (:new-tags processed-new-policies-data))
        processed-new-db-tags (mapv db.tag/tag->db-tag processed-new-tags)
        tags-columns (sql-util/get-insert-columns-from-entity-col processed-new-db-tags)
        processed-new-tag-vals (when (seq processed-new-db-tags)
                                 (sql-util/entity-col->persistence-entity-col processed-new-db-tags))
        created-tags (when (seq processed-new-db-tags)
                       (db.tag/new-tags db-conn {:insert-cols tags-columns
                                                 :tags processed-new-tag-vals}))
        new-tags-by-norm-name (when (seq created-tags)
                                (group-by #(str/lower-case (:tag %)) created-tags))
        processed-new-policies (:policies processed-new-policies-data)
        processed-new-db-policies (mapv db.policy/policy->db-policy processed-new-policies)
        policy-columns (sql-util/get-insert-columns-from-entity-col processed-new-db-policies)
        processed-new-policies-vals (when (seq processed-new-db-policies)
                                      (sql-util/entity-col->persistence-entity-col processed-new-db-policies))
        processed-policies-geo-coverage (:policy-geo-coverage processed-new-policies-data)]
    (handle-policy-and-dependent-entities-creation
     db-conn
     processed-new-policies-vals
     policy-columns
     new-tags-by-norm-name
     (:policy-tags processed-new-policies-data)
     processed-policies-geo-coverage)))

(defn- handle-policy-and-dependent-entities-update
  "Handle atomically the update of policy and creation of dependent entities, like policy-tags and
   policy-geo-coverage.

   The strategy is similar as when creating policy, policy-tags and policy-geo-coverage entities, but in this case,
   we only add policy-tag entities that have been not created already.
   For updating policy-geo-coverage entities, we just delete the previous entries and re-create all again, including
   updated values, since Leap API is the only source of truth for this field.

   For this process, we ignore the row's ids that have no meaning and we consider only what it really
   represents a row in a policy-tag table: the unique combination of policy and tag ids (FKs). We need to
   do it in this way, since we are going to remove soon the artificial id that is the current PK of the table,
   so this function is prepared already for that. Besides, we don't have such Unique constraint yet.

   At the end the number of updated policies and created tags is returned, so we can use the updated tags map
   to be used in subsequent batch imports without querying all the existing tags again.

   All the policy-tags are created in one go in order to re-use existing code and make the process more perfomant
   and simpler."
  [main-conn processed-db-policies-to-update new-tags-by-norm-name policy-tags processed-policies-geo-coverage]
  (jdbc/with-db-transaction
    [trans-conn main-conn]
    (let [policies-by-leap-api-id (when (seq processed-db-policies-to-update)
                                    (group-by :leap_api_id processed-db-policies-to-update))
          processed-policy-tags (mapv (fn [{:keys [leap-api-id normalized-tag-name tag-id]}]
                                        (let [target-policy (get-in policies-by-leap-api-id [leap-api-id 0])
                                              target-tag (when (nil? tag-id)
                                                           (get-in new-tags-by-norm-name [normalized-tag-name 0]))
                                              resolved-tag-id (or tag-id
                                                                  (:id target-tag))]
                                          {:policy (:id target-policy)
                                           :tag resolved-tag-id}))
                                      policy-tags)
          existing-policy-tags (when (seq processed-policy-tags)
                                 (db.resource.tag/get-tags-from-resources
                                  trans-conn
                                  {:table "policy_tag"
                                   :resource-col "policy"
                                   :resource-ids (mapv #(get % :policy)
                                                       processed-policy-tags)}))
          existing-policy-tags-set (->> existing-policy-tags
                                        (mapv #(vector (get % :policy)
                                                       (get % :tag)))
                                        set)
          not-existing-processed-policy-tags (filter #(not (get existing-policy-tags-set [(:policy %)
                                                                                          (:tag %)]))
                                                     processed-policy-tags)
          policy-tag-insert-keys [:policy :tag]
          processed-policy-tag-values (when (seq not-existing-processed-policy-tags)
                                        (sql-util/entity-col->persistence-entity-col
                                         not-existing-processed-policy-tags
                                         :insert-keys
                                         policy-tag-insert-keys))
          policies-geo-coverage (mapv (fn [{:keys [leap-api-id country-id]}]
                                        (let [target-policy (get-in policies-by-leap-api-id [leap-api-id 0])]
                                          {:policy (:id target-policy)
                                           :country country-id}))
                                      processed-policies-geo-coverage)
          policy-geo-cov-columns (sql-util/get-insert-columns-from-entity-col policies-geo-coverage)
          policy-geo-cov-vals (when (seq policies-geo-coverage)
                                (sql-util/entity-col->persistence-entity-col policies-geo-coverage))]
      (when (seq not-existing-processed-policy-tags)
        (db.resource.tag/create-resource-tags
         trans-conn
         {:table "policy_tag"
          :resource-col "policy"
          :tags processed-policy-tag-values}))
      (when (seq policy-geo-cov-vals)
        (db.policy/delete-policies-geo
         trans-conn
         {:policies (mapv #(get % :policy)
                          policies-geo-coverage)})
        (db.policy/add-policies-geo
         trans-conn
         {:insert-cols policy-geo-cov-columns
          :geo policy-geo-cov-vals}))
      (when (seq processed-db-policies-to-update)
        (update-policies-batch trans-conn processed-db-policies-to-update))
      {:num-updated-policies (count processed-db-policies-to-update)
       :new-tags-by-norm-name new-tags-by-norm-name})))

;; TODO: Extract duplicated code to a shared function (tags creation for example).
(defn- handle-policy-update-batch
  "Update policies from a batch, given their reference from DB

   In order to be more accurate, we only update the policies that have been modified more recently than the last time
   they were modified. We check that with a field that is coming for each batch item, so we compare the value stored in
   the DB with the one coming from the batch (API): `updated`.

   Before we can persist the data we need to apply some transformations to give it the right shape for the DB layer.

   Apart than updating policy entities, we also handle the addition of related policy-tag entities, creating new tag
   entities as well, in a similar way as we do when creating the policies."
  [db-conn batch-items existing-policies {:keys [policy-tag-category-id] :as opts}]
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
        processed-policies-to-update-data (processed-policies-to-update-from-batch
                                           policies-to-update
                                           policy-batch-lookup
                                           opts)
        processed-policies-to-update (:policies processed-policies-to-update-data)
        ;; New tags creation code start marker
        processed-new-tags (mapv (fn [{:keys [tag-name]}]
                                   {:tag tag-name
                                    :tag_category policy-tag-category-id
                                    :review_status :SUBMITTED})
                                 (:new-tags processed-policies-to-update-data))
        processed-new-db-tags (mapv db.tag/tag->db-tag processed-new-tags)
        tags-columns (sql-util/get-insert-columns-from-entity-col processed-new-db-tags)
        processed-new-tag-vals (when (seq processed-new-db-tags)
                                 (sql-util/entity-col->persistence-entity-col processed-new-db-tags))
        created-tags (when (seq processed-new-db-tags)
                       (db.tag/new-tags db-conn {:insert-cols tags-columns
                                                 :tags processed-new-tag-vals}))
        new-tags-by-norm-name (when (seq created-tags)
                                (group-by #(str/lower-case (:tag %)) created-tags))
        ;; New tags creation code end marker
        processed-db-policies-to-update (mapv db.policy/policy->db-policy processed-policies-to-update)
        processed-policies-geo-coverage (:policy-geo-coverage processed-policies-to-update-data)]
    (handle-policy-and-dependent-entities-update
     db-conn
     processed-db-policies-to-update
     new-tags-by-norm-name
     (:policy-tags processed-policies-to-update-data)
     processed-policies-geo-coverage)))

(defn- handle-policy-import-batch
  "Handle creation and update of policies based on given batch

   It returns the number of created and updated policies, along all the created tags data during the process, in
   order to share it for next batch imports.

   The way to know which policies need to be created and which ones updated is by trying to match the policies
   coming from the LEAP API batch, using the `leap_api_id` (as batch item id) field to find them in the DB.
   Once the existing ones are found, we know that the policies to create are the remaining ones.

   Regarding the created tags handling, once the creation of policies is processed for a given batch, we merge
   the generated new tags info back into the original existing tags map passed to the update policies handling
   function, so we can use this info without querying the existing tags again from the DB.
   At the end we return the merged finally created tags map, so it can be merged with existing tags for the next
   batches."
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
        created-policies-data (handle-policy-creation-batch conn new-policies opts)
        new-tags-from-policy-creation (:new-tags-by-norm-name created-policies-data)
        updated-opts (update opts :tags-by-normalized-name #(merge % new-tags-from-policy-creation))
        updated-policies-data (handle-policy-update-batch conn batch-items existing-policies updated-opts)
        new-tags-from-policy-update (:new-tags-by-norm-name updated-policies-data)]
    {:created-policies (count (:created-policies created-policies-data))
     :created-tags (merge new-tags-from-policy-creation new-tags-from-policy-update)
     :updated-policies (:num-updated-policies updated-policies-data)}))

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
           languages-by-iso-code tags-by-normalized-name mea-country-groups-by-name
           policy-types-of-law policy-status-opts policy-sub-content-types policy-tag-category-id]}]
  (loop [batch-data-acc {:batch-idx 0
                         :tags-by-normalized-name tags-by-normalized-name
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
                                      :tags-by-normalized-name (:tags-by-normalized-name batch-data-acc)
                                      :mea-country-groups-by-name mea-country-groups-by-name
                                      :policy-types-of-law policy-types-of-law
                                      :policy-status-opts policy-status-opts
                                      :policy-sub-content-types policy-sub-content-types
                                      :policy-tag-category-id policy-tag-category-id})]
                  (recur (-> batch-data-acc
                             (update :operation-result #(merge-with + % (dissoc import-result :created-tags)))
                             (update :batch-idx inc)
                             (update :tags-by-normalized-name #(merge % (:created-tags import-result))))))
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
                                  (group-by :iso_code all-languages))
          all-tags (db.tag/get-flat-tags conn)
          all-tags-normalized (mapv #(assoc % :normalized-tag (str/lower-case (:tag %)))
                                    all-tags)
          tags-by-normalized-name (when (seq all-tags-normalized)
                                    (group-by :normalized-tag all-tags-normalized))
          policy-tag-category (db.tag/tag-category-by-category-name conn {:category policy-tag-category-name})
          all-mea-country-groups (db.country-group/get-country-groups-by-type
                                  conn
                                  {:type (sql-util/keyword->pg-enum :mea "country_group_type")})
          mea-country-groups-by-name (when (seq all-mea-country-groups)
                                       (group-by :name all-mea-country-groups))]
      (handle-policy-import-batches config {:leap-api-base-url leap-api-base-url
                                            :leap-api-conn-timeout-ms leap-api-conn-timeout-ms
                                            :leap-api-max-items-per-page leap-api-max-items-per-page
                                            :leap-api-max-pages-to-process leap-api-max-pages-to-process
                                            :default-lang default-lang
                                            :countries-by-iso-code countries-by-iso-code
                                            :languages-by-iso-code languages-by-iso-code
                                            :tags-by-normalized-name tags-by-normalized-name
                                            :mea-country-groups-by-name mea-country-groups-by-name
                                            :policy-types-of-law policy-types-of-law
                                            :policy-status-opts policy-status-opts
                                            :policy-sub-content-types policy-sub-content-types
                                            :policy-tag-category-id (:id policy-tag-category)}))
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

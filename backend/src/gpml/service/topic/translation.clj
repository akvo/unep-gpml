(ns gpml.service.topic.translation
  (:require
   [clojure.set]
   [clojure.string]
   [gpml.boundary.port.translate :as port.translate]
   [gpml.db.topic.translation :as db.topic.translation]
   [gpml.domain.translation :as dom.translation]
   [gpml.util.result :refer [failure]]))

(defn upsert-bulk-topic-translations
  "Upserts multiple topic translations in bulk"
  [config translations-data]
  (try
    (if (empty? translations-data)
      {:success? true :upserted-count 0}
      (let [conn (:spec (:db config))
            ;; Convert from service layer format to database layer format
            db-translations (mapv (fn [{:keys [topic-type topic-id language content]}]
                                    [topic-type topic-id language content])
                                  translations-data)
            result (db.topic.translation/upsert-bulk-topic-translations conn {:translations db-translations})]
        {:success? true :upserted-count result}))
    (catch org.postgresql.util.PSQLException e
      (cond
        (re-find #"violates foreign key constraint" (.getMessage e))
        (failure {:reason :foreign-key-constraint-violation
                  :error-details {:message "Invalid language code"}})

        (re-find #"value too long for type character varying\(3\)" (.getMessage e))
        (failure {:reason :invalid-language-format
                  :error-details {:message "Language code must be 3 characters or less"}})

        :else
        (failure {:reason :database-error
                  :error-details {:message (.getMessage e)}})))
    (catch java.sql.BatchUpdateException e
      (cond
        (re-find #"violates foreign key constraint" (.getMessage e))
        (failure {:reason :foreign-key-constraint-violation
                  :error-details {:message "Invalid language code"}})

        :else
        (failure {:reason :database-error
                  :error-details {:message (.getMessage e)}})))
    (catch Exception e
      (failure {:reason :unexpected-error
                :error-details {:message (.getMessage e)}}))))

(defn- filter-content-fields
  "Filter content fields to intersection of available and requested fields, or return full content if no intersection"
  [translation fields]
  (let [content (:content translation)
        content-keys (set (map name (keys content)))
        requested-fields (set fields)
        available-requested-fields (clojure.set/intersection content-keys requested-fields)]
    (if (seq available-requested-fields)
      ;; Some requested fields exist - filter to intersection
      (update translation :content #(select-keys % (map keyword available-requested-fields)))
      ;; No requested fields exist - return full content
      translation)))

(defn get-bulk-topic-translations
  "Gets bulk topic translations for multiple topics in a single language with optional field filtering"
  [config topic-filters language fields]
  (try
    (let [conn (:spec (:db config))
          ;; Convert from service layer format to database layer format
          db-topic-filters (mapv (fn [{:keys [topic-type topic-id]}]
                                   [topic-type topic-id])
                                 topic-filters)
          result (db.topic.translation/get-bulk-topic-translations conn {:topic-filters db-topic-filters :language language})
          filtered-result (if (and fields (seq fields))
                            (mapv #(filter-content-fields % fields) result)
                            result)]
      {:success? true :translations filtered-result})
    (catch Exception e
      (failure {:reason :unexpected-error
                :error-details {:message (.getMessage e)}}))))

(defn delete-bulk-topic-translations
  "Deletes bulk topic translations for multiple topics (all languages)"
  [config topic-filters]
  (try
    (let [conn (:spec (:db config))
          ;; Convert from service layer format to database layer format
          db-topic-filters (mapv (fn [{:keys [topic-type topic-id]}]
                                   [topic-type topic-id])
                                 topic-filters)
          result (db.topic.translation/delete-bulk-topic-translations conn {:topic-filters db-topic-filters})]
      {:success? true :deleted-count result})
    (catch Exception e
      (failure {:reason :unexpected-error
                :error-details {:message (.getMessage e)}}))))

(defn delete-topic-translations
  "Deletes all translations for a specific topic (all languages).
   Used for cache invalidation when source content is updated.

   Parameters:
   - config: Configuration map with :db key
   - topic-type: Topic type string (e.g., 'policy', 'event')
   - topic-id: Topic ID integer

   Returns:
   {:success? true :deleted-count N}
   OR
   {:success? false :reason :error-key :error-details {...}}"
  [config topic-type topic-id]
  (try
    (let [conn (:spec (:db config))
          result (db.topic.translation/delete-topic-translations conn {:topic-type topic-type :topic-id topic-id})]
      {:success? true :deleted-count result})
    (catch Exception e
      (failure {:reason :unexpected-error
                :error-details {:message (.getMessage e)}}))))

;; Auto-translation helper functions

(defn- missing-topic-filters
  "Identify topic filters that don't have complete translations in the database.
   Returns vector of topic-filters that need translation."
  [topic-filters existing-translations]
  (let [existing-set (set (map (fn [t] [(:topic_type t) (:topic_id t)]) existing-translations))
        topic-filter-tuples (mapv (fn [{:keys [topic-type topic-id]}] [topic-type topic-id]) topic-filters)]
    (->> topic-filter-tuples
         (remove existing-set)
         (mapv (fn [[topic-type topic-id]] {:topic-type topic-type :topic-id topic-id})))))

(defn- filter-same-language-records
  "Filter out records where source language equals target language.
   Returns map with :to-translate and :skip-translation keys."
  [source-data target-language]
  (let [grouped (group-by (fn [record]
                            (if (= (:language record) target-language)
                              :skip-translation
                              :to-translate))
                          source-data)]
    {:to-translate (get grouped :to-translate [])
     :skip-translation (get grouped :skip-translation [])}))

(defn- group-by-source-language
  "Group source records by language for efficient batching.
   Returns map of {language [records]}."
  [records]
  (group-by :language records))

(defn- extract-translatable-texts
  "Extract all translatable text fields from source data.
   Returns {:texts [vector of text strings]
            :index-map [vector of {:topic-key [type id] :field field-keyword}]}

   The index-map allows mapping translated texts back to their source resource/field."
  [source-data-records]
  (let [texts (atom [])
        index-map (atom [])]
    (doseq [record source-data-records]
      (let [topic-type (:topic_type record)
            topic-id (:topic_id record)
            translatable-fields (get dom.translation/translatable-fields-by-topic topic-type #{})]
        (doseq [field translatable-fields]
          (when-let [text (get record field)]
            (when (and (string? text) (not (clojure.string/blank? text)))
              (swap! texts conj text)
              (swap! index-map conj {:topic-key [topic-type topic-id]
                                     :field field}))))))
    {:texts @texts :index-map @index-map}))

(defn- map-translations-back
  "Map translated texts back to their original resource/field locations.
   Returns map of {[topic-type topic-id] {:content {field translated-text}}}}"
  [translated-texts index-map]
  (reduce (fn [acc [text {:keys [topic-key field]}]]
            (assoc-in acc [topic-key :content field] text))
          {}
          (map vector translated-texts index-map)))

(defn- build-translation-records
  "Build translation records from mapped translations for service layer.
   Returns vector of {:topic-type :topic-id :language :content} maps for upserting."
  [translations-map language]
  (mapv (fn [[[topic-type topic-id] data]]
          {:topic-type topic-type
           :topic-id topic-id
           :language language
           :content (:content data)})
        translations-map))

(defn- build-translation-response-records
  "Build translation records for response (matches DB format with underscored keys).
   Returns vector of {:topic_type :topic_id :language :content} maps."
  [translations-map language]
  (mapv (fn [[[topic-type topic-id] data]]
          {:topic_type topic-type
           :topic_id topic-id
           :language language
           :content (:content data)})
        translations-map))

(defn- build-same-language-records
  "Build translation records for same-language sources (copy source content as-is).
   Returns map of {[topic-type topic-id] {:content {field value}}}."
  [source-records]
  (reduce (fn [acc record]
            (let [topic-type (:topic_type record)
                  topic-id (:topic_id record)
                  topic-key [topic-type topic-id]
                  translatable-fields (get dom.translation/translatable-fields-by-topic topic-type #{})
                  content (select-keys record translatable-fields)]
              (assoc acc topic-key {:content content})))
          {}
          source-records))

(defn get-bulk-translations-with-auto-translate
  "Gets bulk topic translations with automatic translation of missing content.

   This function:
   1. Checks DB for existing translations (complete translations only)
   2. Identifies missing translations
   3. If missing translations exist and auto-translate is enabled:
      a. Fetches source data for missing topics (ALL translatable fields, including language column)
      b. Filters same-language records (skip translation if source language == target language)
      c. Groups remaining records by source language for efficient batching
      d. Translates each source language group separately (passes correct source language to Google)
      e. Builds records for same-language sources (copies source content as-is)
      f. Maps translated texts back to resources
      g. Saves ALL translated fields to DB (complete translations, including same-language copies)
   4. Filters response by fields parameter
   5. Returns combined results (DB + newly translated + same-language, filtered by fields)

   Source Language Detection:
   - Each topic record has exactly ONE language in its source table (policy, event, etc.)
   - If source language == target language (e.g., Spanish→Spanish), skips translation and copies content
   - If source language != target language, translates with correct source language passed to Google
   - Multiple source languages in single request are handled efficiently (grouped batches)

   Parameters:
   - config: Configuration map with :db, :translate-adapter, :auto-translate keys
   - topic-filters: Vector of {:topic-type :topic-id} maps
   - language: Target language ISO code (e.g., 'es', 'fr')
   - fields: Optional vector of field names to include in response (filters response only, not translation)

   Returns:
   {:success? true :translations [filtered translation records]}
   OR
   {:success? false :reason :error-key :error-details {...}}"
  [config topic-filters language fields]
  (try
    (let [conn (:spec (:db config))
          translate-adapter (:translate-adapter config)

          ;; Step 1: Get existing translations from DB
          db-topic-filters (mapv (fn [{:keys [topic-type topic-id]}] [topic-type topic-id]) topic-filters)
          existing-translations (db.topic.translation/get-bulk-topic-translations
                                  conn
                                  {:topic-filters db-topic-filters :language language})

          ;; Step 2: Identify missing translations
          missing-filters (missing-topic-filters topic-filters existing-translations)]

      (if (empty? missing-filters)
        ;; All translations exist in DB - just filter and return
        (let [filtered-result (if (and fields (seq fields))
                                (mapv #(filter-content-fields % fields) existing-translations)
                                existing-translations)]
          {:success? true :translations filtered-result})

        ;; Step 3: Auto-translate missing translations (if enabled)
        (if-not translate-adapter
          ;; Auto-translate not available - return only what we have from DB
          (let [filtered-result (if (and fields (seq fields))
                                  (mapv #(filter-content-fields % fields) existing-translations)
                                  existing-translations)]
            {:success? true :translations filtered-result})

          ;; Auto-translate is available - proceed with translation
          (try
            (let [;; Step 3a: Fetch source data for missing topics (ALL translatable fields, includes language column)
                  missing-db-filters (mapv (fn [{:keys [topic-type topic-id]}] [topic-type topic-id]) missing-filters)
                  source-data (db.topic.translation/get-bulk-source-data conn missing-db-filters)

                  ;; Step 3b: Filter same-language records (skip translation if source == target)
                  {:keys [to-translate skip-translation]} (filter-same-language-records source-data language)

                  ;; Step 3c: Group records by source language for efficient batching
                  grouped-by-language (group-by-source-language to-translate)]

              (if (and (empty? to-translate) (empty? skip-translation))
                ;; No source data found - return only DB results
                (let [filtered-result (if (and fields (seq fields))
                                        (mapv #(filter-content-fields % fields) existing-translations)
                                        existing-translations)]
                  {:success? true :translations filtered-result})

                ;; Step 3d: Translate records grouped by source language
                (let [;; Translate each source language group separately
                      translated-maps
                      (reduce (fn [acc [source-lang records]]
                                (let [{:keys [texts index-map]} (extract-translatable-texts records)
                                      translated-texts (port.translate/translate-texts
                                                         translate-adapter texts language source-lang)
                                      mapped (map-translations-back translated-texts index-map)]
                                  (merge acc mapped)))
                              {}
                              grouped-by-language)

                      ;; Step 3e: Build records for same-language sources (copy source content)
                      same-lang-map (build-same-language-records skip-translation)

                      ;; Step 3f: Combine translated and same-language results
                      all-translations-map (merge translated-maps same-lang-map)

                      ;; Step 3g: Build translation records for DB upsert
                      upsert-records (build-translation-records all-translations-map language)

                      ;; Step 3h: Save ALL translated fields to DB
                      _ (when (seq upsert-records)
                          (upsert-bulk-topic-translations config upsert-records))

                      ;; Step 3i: Build translation records for response (underscored keys)
                      response-records (build-translation-response-records all-translations-map language)

                      ;; Step 4: Combine DB results with newly translated results
                      all-translations (concat existing-translations response-records)

                      ;; Step 5: Filter response by fields parameter
                      filtered-result (if (and fields (seq fields))
                                        (mapv #(filter-content-fields % fields) all-translations)
                                        all-translations)]

                  {:success? true :translations filtered-result})))

            (catch Exception _e
              ;; Translation failed - return what we have from DB
              (let [filtered-result (if (and fields (seq fields))
                                      (mapv #(filter-content-fields % fields) existing-translations)
                                      existing-translations)]
                ;; TODO: Log error for monitoring
                {:success? true :translations filtered-result}))))))

    (catch Exception e
      (failure {:reason :unexpected-error
                :error-details {:message (.getMessage e)}}))))
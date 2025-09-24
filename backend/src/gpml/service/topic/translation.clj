(ns gpml.service.topic.translation
  (:require
   [gpml.db.topic.translation :as db.topic.translation]
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

(defn get-bulk-topic-translations
  "Gets bulk topic translations for multiple topics in a single language"
  [config topic-filters language]
  (try
    (let [conn (:spec (:db config))
          ;; Convert from service layer format to database layer format
          db-topic-filters (mapv (fn [{:keys [topic-type topic-id]}]
                                   [topic-type topic-id])
                                 topic-filters)
          result (db.topic.translation/get-bulk-topic-translations conn {:topic-filters db-topic-filters :language language})]
      {:success? true :translations result})
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
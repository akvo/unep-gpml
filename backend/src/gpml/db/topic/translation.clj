(ns gpml.db.topic.translation
  (:require
   [gpml.domain.translation :as dom.translation]
   [hugsql.core :as hugsql]))

(declare get-bulk-topic-translations
         upsert-bulk-topic-translations
         delete-bulk-topic-translations
         delete-topic-translations
         get-policy-source-data
         get-event-source-data
         get-resource-source-data
         get-technology-source-data
         get-initiative-source-data
         get-case-study-source-data
         get-project-source-data)

(hugsql/def-db-fns "gpml/db/topic/translation.sql" {:quoting :ansi})

;; Source data fetching functions

(defn- get-source-data-for-type
  "Fetch source data for a specific topic type.
   Dispatches to the appropriate query based on topic-type."
  [conn topic-type topic-ids]
  (case topic-type
    "policy"
    (get-policy-source-data conn {:topic-ids topic-ids})

    "event"
    (get-event-source-data conn {:topic-ids topic-ids})

    ("resource" "financing_resource" "technical_resource" "action_plan" "data_catalog")
    (get-resource-source-data conn {:topic-type topic-type :topic-ids topic-ids})

    "technology"
    (get-technology-source-data conn {:topic-ids topic-ids})

    "initiative"
    (get-initiative-source-data conn {:topic-ids topic-ids})

    "case_study"
    (get-case-study-source-data conn {:topic-ids topic-ids})

    "project"
    (get-project-source-data conn {:topic-ids topic-ids})

    ;; Unsupported topic type
    []))

(defn get-bulk-source-data
  "Fetch source language data for multiple topics.

   Parameters:
   - conn: Database connection
   - topic-filters: Vector of [topic-type topic-id] tuples
     Example: [[\"policy\" 1] [\"event\" 2] [\"policy\" 3]]

   Returns:
   Vector of maps containing source data for each topic.
   Each map includes :topic-type, :topic-id, and all translatable fields.

   Example:
   [{:topic_type \"policy\" :topic_id 1 :title \"...\" :abstract \"...\" :remarks \"...\" :info_docs \"...\"}
    {:topic_type \"event\" :topic_id 2 :title \"...\" :description \"...\" :remarks \"...\" :info_docs \"...\"}]

   Notes:
   - Only fetches topics that exist in database
   - Missing resources are silently skipped
   - Returns empty vector if no topics found
   - Groups requests by topic-type for efficient querying"
  [conn topic-filters]
  (if (empty? topic-filters)
    []
    ;; Group topic-filters by type for efficient batch querying
    (let [grouped (group-by first topic-filters)]
      (->> grouped
           (mapcat (fn [[topic-type filters]]
                     (let [topic-ids (mapv second filters)]
                       (get-source-data-for-type conn topic-type topic-ids))))
           (vec)))))

(comment
  ;; Manual REPL-driven tests for source data fetching
  ;; Requires test data in database
  ;;
  ;; Usage:
  ;; 1. Start REPL: make lein-repl
  ;; 2. Evaluate expressions below

  ;; Get database connection
  @(def conn (dev/db-conn))

  ;; Test 1: Fetch single policy
  (get-bulk-source-data conn [["policy" 1]])
  ;; Expected: Vector with one map containing policy data

  ;; Test 2: Fetch multiple policies
  (get-bulk-source-data conn [["policy" 1] ["policy" 2] ["policy" 3]])
  ;; Expected: Vector with multiple policy records

  ;; Test 3: Fetch mixed resource types
  (get-bulk-source-data conn [["policy" 1]
                              ["event" 1]
                              ["resource" 1]
                              ["technology" 1]])
  ;; Expected: Vector with mixed topic types, each with appropriate fields

  ;; Test 4: Fetch resource sub-types
  (get-bulk-source-data conn [["financing_resource" 1]
                              ["technical_resource" 2]
                              ["action_plan" 3]])
  ;; Expected: Vector with resource data, topic_type shows sub-type

  ;; Test 5: Empty input
  (get-bulk-source-data conn [])
  ;; Expected: []

  ;; Test 6: Non-existent resources (graceful handling)
  (get-bulk-source-data conn [["policy" 999999]])
  ;; Expected: [] (no error, just empty result)

  ;; Test 7: Check field structure for technology (uses 'name' not 'title')
  (get-bulk-source-data conn [["technology" 1]])
  ;; Expected: Map with :name field instead of :title

  ;; Test 8: Check field structure for initiative (many q fields)
  (get-bulk-source-data conn [["initiative" 1]])
  ;; Expected: Map with :q2, :q3, ... :q24, :title, :summary, :info_docs

  ;; Test 9: Large batch (10+ items of same type)
  (get-bulk-source-data conn (mapv (fn [id] ["policy" id]) (range 1 11)))
  ;; Expected: Up to 10 policy records (depending on what exists in DB)

  ;; Test 10: Verify grouping efficiency (check logs for query count)
  ;; Should make 2 queries (one for policy, one for event), not 3
  (get-bulk-source-data conn [["policy" 1]
                              ["event" 1]
                              ["policy" 2]])

  ;; Helper: Check available translatable fields for a type
  (get dom.translation/translatable-fields-by-topic "policy")
  ;; Expected: #{:title :abstract :remarks :info_docs}

  ;; Helper: Check table mapping
  (get dom.translation/topic-type->table "financing_resource")
  ;; Expected: "resource"

  ;;
  )
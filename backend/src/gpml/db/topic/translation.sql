-- :name get-bulk-topic-translations :? :*
-- Get translations for multiple topics in a single language
SELECT topic_type, topic_id, language, content
FROM topic_translation
WHERE (topic_type, topic_id) IN (:t*:topic-filters)
AND language = :language
ORDER BY topic_type, topic_id;

-- :name upsert-bulk-topic-translations :! :n
-- Upsert translations for multiple topics in a single language
INSERT INTO topic_translation (topic_type, topic_id, language, content)
VALUES :t*:translations
ON CONFLICT (topic_type, topic_id, language)
DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = now();

-- :name delete-bulk-topic-translations :! :n
-- Delete all translations for multiple topics (all languages)
DELETE FROM topic_translation
WHERE (topic_type, topic_id) IN (:t*:topic-filters);

-- :name delete-topic-translations :! :n
-- Delete all translations for a specific topic (all languages)
-- Used for cache invalidation when source content is updated
DELETE FROM topic_translation
WHERE topic_type = :topic-type
  AND topic_id = :topic-id;

-- :name delete-topic-translations-by-type :! :n
-- Delete all translations for a specific topic type (all topics, all languages)
-- Admin only - use with caution - requires confirmation parameter
DELETE FROM topic_translation
WHERE topic_type = :topic-type;

-- Source data fetching queries (for auto-translation)
-- Each resource type has its own query due to different table structures

-- :name get-policy-source-data :? :*
-- Get source language content for policies
-- Returns normalized field names to match detail API schema
SELECT
  'policy' AS topic_type,
  id AS topic_id,
  language,
  title,
  abstract AS summary,  -- Normalize to match detail API
  remarks,
  info_docs
FROM policy
WHERE id IN (:v*:topic-ids);

-- :name get-event-source-data :? :*
-- Get source language content for events
-- Returns normalized field names to match detail API schema
SELECT
  'event' AS topic_type,
  id AS topic_id,
  language,
  title,
  description AS summary,  -- Normalize to match detail API
  remarks,
  info_docs
FROM event
WHERE id IN (:v*:topic-ids);

-- :name get-resource-source-data :? :*
-- Get source language content for resources (includes sub-types)
SELECT
  :topic-type AS topic_type,
  id AS topic_id,
  language,
  title,
  summary,
  remarks,
  value_remarks,
  info_docs
FROM resource
WHERE id IN (:v*:topic-ids);

-- :name get-technology-source-data :? :*
-- Get source language content for technologies
-- Returns normalized field names to match detail API schema
SELECT
  'technology' AS topic_type,
  id AS topic_id,
  language,
  name AS title,      -- Normalize to match detail API
  remarks AS summary, -- Normalize to match detail API
  info_docs
FROM technology
WHERE id IN (:v*:topic-ids);

-- :name get-initiative-source-data :? :*
-- Get source language content for initiatives
-- Returns normalized field names to match detail API schema
-- Note: q2 and q3 are JSONB, cast to text and trim quotes to normalize
SELECT
  'initiative' AS topic_type,
  id AS topic_id,
  language,
  btrim((q2)::text, '"') AS title,    -- Normalize JSONB q2 to title (matches detail API)
  btrim((q3)::text, '"') AS summary,  -- Normalize JSONB q3 to summary (matches detail API)
  q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, q14,
  q15, q16, q17, q18, q19, q20, q21, q22, q23, q24,
  info_docs
FROM initiative
WHERE id IN (:v*:topic-ids);

-- :name get-case-study-source-data :? :*
-- Get source language content for case studies
-- Returns normalized field names to match detail API schema
SELECT
  'case_study' AS topic_type,
  id AS topic_id,
  language,
  title,
  description AS summary,  -- Normalize to match detail API
  challenge_and_solution   -- Add missing translatable field
FROM case_study
WHERE id IN (:v*:topic-ids);

-- :name get-project-source-data :? :*
-- Get source language content for projects
-- FIXED: Removed non-existent 'description' column, added missing text fields
-- Includes JSONB array fields (highlights, outcomes) for translation
SELECT
  'project' AS topic_type,
  id AS topic_id,
  language,
  title,
  summary,
  background,  -- Add missing translatable text field
  purpose,     -- Add missing translatable text field
  info_docs,   -- Add missing translatable field
  highlights,  -- JSONB array field (list of text items)
  outcomes     -- JSONB array field (list of text items)
FROM project
WHERE id IN (:v*:topic-ids);
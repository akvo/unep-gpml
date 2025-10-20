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

-- Source data fetching queries (for auto-translation)
-- Each resource type has its own query due to different table structures

-- :name get-policy-source-data :? :*
-- Get source language content for policies
SELECT
  'policy' AS topic_type,
  id AS topic_id,
  title,
  abstract,
  remarks,
  info_docs
FROM policy
WHERE id IN (:v*:topic-ids);

-- :name get-event-source-data :? :*
-- Get source language content for events
SELECT
  'event' AS topic_type,
  id AS topic_id,
  title,
  description,
  remarks,
  info_docs
FROM event
WHERE id IN (:v*:topic-ids);

-- :name get-resource-source-data :? :*
-- Get source language content for resources (includes sub-types)
SELECT
  :topic-type AS topic_type,
  id AS topic_id,
  title,
  summary,
  remarks,
  value_remarks,
  info_docs
FROM resource
WHERE id IN (:v*:topic-ids);

-- :name get-technology-source-data :? :*
-- Get source language content for technologies
-- Note: uses 'name' column, not 'title'
SELECT
  'technology' AS topic_type,
  id AS topic_id,
  name,
  remarks,
  info_docs
FROM technology
WHERE id IN (:v*:topic-ids);

-- :name get-initiative-source-data :? :*
-- Get source language content for initiatives
SELECT
  'initiative' AS topic_type,
  id AS topic_id,
  q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, q14,
  q15, q16, q17, q18, q19, q20, q21, q22, q23, q24,
  title,
  summary,
  info_docs
FROM initiative
WHERE id IN (:v*:topic-ids);

-- :name get-case-study-source-data :? :*
-- Get source language content for case studies
SELECT
  'case_study' AS topic_type,
  id AS topic_id,
  title,
  description
FROM case_study
WHERE id IN (:v*:topic-ids);

-- :name get-project-source-data :? :*
-- Get source language content for projects
SELECT
  'project' AS topic_type,
  id AS topic_id,
  title,
  description,
  summary
FROM project
WHERE id IN (:v*:topic-ids);
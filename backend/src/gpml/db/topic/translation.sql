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
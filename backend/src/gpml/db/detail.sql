-- :name get-detail :? :1
-- :doc Get details about a particular topic
SELECT json
  FROM v_topic
 WHERE topic = :topic-type
   AND (json->>'id')::int = :topic-id

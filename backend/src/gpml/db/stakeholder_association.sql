-- :name get-stakeholder-associated-topics :? :*
-- :doc Get stakeholder associatiated topics based on the association type
-- :require [gpml.db.topic]
--~ (#'gpml.db.topic/generate-topic-query {} gpml.db.topic/generic-cte-opts)
,
stakeholder_association AS (
    SELECT
        REPLACE(LOWER(r.type), ' ', '_') AS topic,
        sr.stakeholder,
        sr.resource AS id,
        sr.association::text AS association,
        sr.remarks
    FROM
        stakeholder_resource sr JOIN resource r ON r.id = sr.resource
    UNION ALL
    SELECT
        'event'::text AS topic,
        stakeholder_event.stakeholder,
        stakeholder_event.event AS id,
        stakeholder_event.association::text AS association,
        stakeholder_event.remarks
    FROM
        stakeholder_event
    UNION ALL
    SELECT
        'technology'::text AS topic,
        stakeholder_technology.stakeholder,
        stakeholder_technology.technology AS id,
        stakeholder_technology.association::text AS association,
        stakeholder_technology.remarks
    FROM
        stakeholder_technology
    UNION ALL
    SELECT
        'policy'::text AS topic,
        stakeholder_policy.stakeholder,
        stakeholder_policy.policy AS id,
        stakeholder_policy.association::text AS association,
        stakeholder_policy.remarks
    FROM
        stakeholder_policy
    UNION ALL
    SELECT
        'initiative'::text AS topic,
        stakeholder_initiative.stakeholder,
        stakeholder_initiative.initiative AS id,
        stakeholder_initiative.association::text AS association,
        stakeholder_initiative.remarks
    FROM
        stakeholder_initiative
),
associated_topics AS (
SELECT DISTINCT ON (t.topic, (COALESCE(t.json ->> 'start_date', t.json ->> 'created'))::timestamptz, (t.json ->> 'id')::int) t.topic, t.geo_coverage, t.json
FROM
    cte_topic t
    JOIN stakeholder_association sa ON sa.id = (t.json->>'id')::int AND sa.topic = t.topic
    WHERE sa.association = :association AND sa.stakeholder = :stakeholder-id
)
--~(if (:count-only? params) "SELECT COUNT(*) FROM associated_topics;" "SELECT * FROM associated_topics LIMIT :limit OFFSET :offset;")

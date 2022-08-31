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
        sr.remarks,
        json_agg(json_build_object('id', sr.id, 'stakeholder_id', sr.stakeholder, 'role', sr.association, 'stakeholder',
        concat_ws(' ', s.first_name, s.last_name), 'image', s.picture,  'stakeholder_role', s.role)) AS stakeholder_connections,
        json_agg(json_build_object('id', orgr.id, 'entity_id', orgr.organisation, 'role', orgr.association, 'entity',
        o.name, 'image', o.logo))
        AS entity_connections
    FROM
        stakeholder_resource sr
        JOIN resource r ON r.id = sr.resource
        LEFT JOIN stakeholder s ON s.id = sr.stakeholder
        LEFT JOIN organisation_resource orgr ON orgr.resource = sr.resource
        LEFT JOIN organisation o ON orgr.organisation = o.id
    GROUP BY
          r.type, sr.stakeholder, sr.resource, sr.association, sr.remarks
    UNION ALL
    SELECT
        'event'::text AS topic,
        se.stakeholder,
        se.event AS id,
        se.association::text AS association,
        se.remarks,
        json_agg(json_build_object('id', se.id, 'stakeholder_id', se.stakeholder, 'role', se.association, 'stakeholder',
        concat_ws(' ', s.first_name, s.last_name), 'image', s.picture,  'stakeholder_role', s.role)) AS stakeholder_connections,
        json_agg(json_build_object('id', oe.id, 'entity_id', oe.organisation, 'role', oe.association, 'entity', o.name,
        'image', o.logo)) AS
        entity_connections
    FROM
        stakeholder_event se
        LEFT JOIN stakeholder s ON se.stakeholder = s.id
        LEFT JOIN organisation_event oe ON oe.event = se.event
        LEFT JOIN organisation o ON o.id = oe.organisation
    GROUP BY
        se.stakeholder, se.event, se.association, se.remarks
    UNION ALL
    SELECT
        'technology'::text AS topic,
        st.stakeholder,
        st.technology AS id,
        st.association::text AS association,
        st.remarks,
        json_agg(json_build_object('id', st.id, 'stakeholder_id', st.stakeholder, 'role', st.association, 'stakeholder',
        concat_ws(' ', s.first_name, s.last_name), 'image', s.picture,  'stakeholder_role', s.role)) AS stakeholder_connections,
        json_agg(json_build_object('id', ot.id, 'entity_id', ot.organisation, 'role', ot.association, 'entity', o.name,
        'image', o.logo)) AS
        entity_connections
    FROM
        stakeholder_technology st
        LEFT JOIN stakeholder s ON s.id = st.stakeholder
        LEFT JOIN organisation_technology ot ON ot.technology = st.technology
        LEFT JOIN organisation o ON o.id = ot.organisation
    GROUP BY
        st.stakeholder, st.technology, st.association, st.remarks
    UNION ALL
    SELECT
        'policy'::text AS topic,
        sp.stakeholder,
        sp.policy AS id,
        sp.association::text AS association,
        sp.remarks,
        json_agg(json_build_object('id', sp.id, 'stakeholder_id', sp.stakeholder, 'role', sp.association, 'stakeholder',
        concat_ws(' ', s.first_name, s.last_name), 'image', s.picture,  'stakeholder_role', s.role)) AS stakeholder_connections,
        json_agg(json_build_object('id', op.id, 'entity_id', op.organisation, 'role', op.association, 'entity', o.name,
        'image', o.logo)) AS
        entity_connections
    FROM
        stakeholder_policy sp
        LEFT JOIN stakeholder s ON sp.stakeholder = s.id
        LEFT JOIN organisation_policy op ON op.policy = sp.policy
        LEFT JOIN organisation o ON o.id = op.organisation
    GROUP BY
        sp.stakeholder, sp.policy, sp.association, sp.remarks
    UNION ALL
    SELECT
        'initiative'::text AS topic,
        si.stakeholder,
        si.initiative AS id,
        si.association::text AS association,
        si.remarks,
        json_agg(json_build_object('id', si.id, 'stakeholder_id', si.stakeholder, 'role', si.association, 'stakeholder',
        concat_ws(' ', s.first_name, s.last_name), 'image', s.picture,  'stakeholder_role', s.role)) AS stakeholder_connections,
        json_agg(json_build_object('id', oi.id, 'entity_id', oi.organisation, 'role', oi.association, 'entity', o.name,
        'image', o.logo)) AS
        entity_connections
    FROM
        stakeholder_initiative si
        LEFT JOIN stakeholder s ON s.id = si.stakeholder
        LEFT JOIN organisation_initiative oi ON oi.initiative = si.initiative
        LEFT JOIN organisation o ON o.id = oi.organisation
    GROUP BY
        si.stakeholder, si.initiative, si.association, si.remarks
),
associated_topics AS (
SELECT DISTINCT ON (t.topic, (COALESCE(t.json ->> 'start_date', t.json ->> 'created'))::timestamptz,
    (t.json ->> 'id')::int) t.topic, t.json, sa.stakeholder_connections, sa.entity_connections
FROM
    cte_topic t
    JOIN stakeholder_association sa ON sa.id = (t.json->>'id')::int AND sa.topic = t.topic
    WHERE sa.association = :association AND sa.stakeholder = :stakeholder-id
)
--~(if (:count-only? params) "SELECT COUNT(*) FROM associated_topics;" "SELECT * FROM associated_topics LIMIT :limit OFFSET :offset;")

-- :name get-stakeholder-resource-association :? :*
-- :doc Gets the association record of a stakeholder and a resource
-- :require [gpml.db.stakeholder-association]
--~(#'gpml.db.stakeholder-association/generate-stakeholder-association-query params)

-- :name get-detail :? :1
-- :doc Get details about a particular topic
SELECT json::jsonb,
COALESCE(json_agg(authz.stakeholder) FILTER (WHERE authz.stakeholder IS NOT NULL), '[]') as owners
 FROM (
    --~ (#'gpml.db.topic/generate-topic-query {} gpml.db.topic/generic-cte-opts)
    SELECT * FROM cte_topic
    ) t
   left join topic_stakeholder_auth authz ON authz.topic_type::text=t.topic AND authz.topic_id=(t.json->>'id')::int
 WHERE topic = :topic-type
   AND (json->>'id')::int = :topic-id
   GROUP BY json::jsonb;

-- :name get-stakeholder-tags :? :1
-- :doc Get Stakehodler tags
SELECT json_object_agg(category,tag) AS data FROM (
    SELECT string_agg(t.tag,', ') AS tag, tc.category FROM stakeholder_tag st
    LEFT JOIN tag t ON st.tag = t.id
    LEFT JOIN tag_category tc ON t.tag_category = tc.id
WHERE st.stakeholder = :id
GROUP BY tc.category) AS data;

-- :name update-initiative :! :n
-- :doc Update the specified initiative row
-- :require [gpml.sql-util]
UPDATE initiative SET
--~ (#'gpml.sql-util/generate-update-initiative params)
WHERE id = :id;

-- :name update-resource-table :! :n
-- :doc Update the resource specified by table and id
-- :require [gpml.sql-util]
update :i:table set
--~ (#'gpml.sql-util/generate-update-resource params)
where id = :id

-- :name delete-resource-related-data :! :n
-- :doc Delete the data related to a specified resource
delete from :i:table where :i:resource_type = :id

-- :name add-resource-related-tags :<! :*
-- :doc Add tags to a resource
insert into :i:table (:i:resource_type, tag)
values :t*:tags RETURNING id;

-- :name add-resource-related-language-urls :<! :*
-- :doc Add language URLs to a resource
insert into :i:table (:i:resource_type, language, url)
values :t*:urls RETURNING id;

-- :name add-resource-related-geo :<! :*
-- :doc Add geo coverage values to a resource
insert into :i:table (:i:resource_type, country_group, country)
values :t*:geo RETURNING id;

-- :name add-resource-related-org :<! :1
-- :doc Add an organisation related to a resource
insert into :i:table (:i:resource_type, organisation)
values (:id, :organisation) RETURNING id;

-- :name get-content-by-org :? :*
-- :doc Get all content types belonging to a particular organisation
SELECT
  r.id, r.title, r.type, r.summary,
  json_agg(json_build_object('id', sr.id, 'stakeholder_id', sr.stakeholder, 'role', sr.association, 'stakeholder',
    concat_ws(' ', s.first_name, s.last_name), 'image', s.picture)) AS stakeholder_connections,
  json_agg(json_build_object('id', orgr.id, 'entity_id', orgr.organisation, 'role', orgr.association, 'entity', o.name,
    'image', o.logo)) AS entity_connections
  FROM resource r
  LEFT JOIN stakeholder_resource sr
  ON sr.resource=r.id
  LEFT JOIN stakeholder s
  ON s.id = sr.stakeholder AND sr.resource = r.id
  LEFT JOIN organisation_resource orgr
  ON orgr.resource = r.id
  LEFT JOIN organisation o
  ON o.id = orgr.organisation AND orgr.resource = r.id
  WHERE r.created_by IN
    (SELECT id FROM stakeholder
     WHERE affiliation = :id)
  GROUP BY r.id
UNION ALL
SELECT
  e.id, e.title, 'Event' AS type, e.description AS summary,
  json_agg(json_build_object('id', se.id, 'stakeholder_id', se.stakeholder, 'role', se.association, 'stakeholder',
    concat_ws(' ', s.first_name, s.last_name), 'image', s.picture)) AS stakeholder_connections,
  json_agg(json_build_object('id', oe.id, 'entity_id', oe.organisation, 'role', oe.association, 'entity', o.name,
    'image', o.logo)) AS entity_connections
  FROM event e
  LEFT JOIN stakeholder_event se
  ON se.event=e.id
  LEFT JOIN stakeholder s
  ON s.id = se.stakeholder AND se.event = e.id
  LEFT JOIN organisation_event oe
  ON oe.event = e.id
  LEFT JOIN organisation o
  ON o.id = oe.organisation AND oe.event = e.id
  WHERE e.created_by IN
    (SELECT id FROM stakeholder
     WHERE affiliation = :id)
  GROUP BY e.id
UNION ALL
SELECT
  i.id, i.q2::text AS title, 'Initiative' AS type, i.q3::text AS summary,
  json_agg(json_build_object('id', si.id, 'stakeholder_id', si.stakeholder, 'role', si.association, 'stakeholder',
    concat_ws(' ', s.first_name, s.last_name), 'image', s.picture)) AS stakeholder_connections,
  json_agg(json_build_object('id', oi.id, 'entity_id', oi.organisation, 'role', oi.association, 'entity', o.name,
    'image', o.logo)) AS entity_connections
  FROM initiative i
  LEFT JOIN stakeholder_initiative si
  ON si.initiative=i.id
  LEFT JOIN stakeholder s
  ON s.id = si.stakeholder AND si.initiative = i.id
  LEFT JOIN organisation_initiative oi
  ON oi.initiative = i.id
  LEFT JOIN organisation o
  ON o.id = oi.organisation AND oi.initiative = i.id
  WHERE i.created_by IN
    (SELECT id FROM stakeholder
     WHERE affiliation = :id)
  GROUP BY i.id
UNION ALL
SELECT
  p.id, p.title, 'Policy' AS type, p.abstract AS summary,
  json_agg(json_build_object('id', sp.id, 'stakeholder_id', sp.stakeholder, 'role', sp.association, 'stakeholder',
    concat_ws(' ', s.first_name, s.last_name), 'image', s.picture)) AS stakeholder_connections,
  json_agg(json_build_object('id', op.id, 'entity_id', op.organisation, 'role', op.association, 'entity', o.name,
    'image', o.logo)) AS entity_connections
  FROM policy p
  LEFT JOIN stakeholder_policy sp
  ON sp.policy = p.id
  LEFT JOIN stakeholder s
  ON s.id = sp.stakeholder AND sp.policy = p.id
  LEFT JOIN organisation_policy op
  ON op.policy = p.id
  LEFT JOIN organisation o
  ON o.id = op.organisation AND op.policy = p.id
  WHERE p.created_by IN
    (SELECT id FROM stakeholder
     WHERE affiliation = :id)
  GROUP BY p.id
UNION ALL
SELECT
  t.id, t.name AS title, 'Technology' AS type, t.remarks AS summary,
  json_agg(json_build_object('id', st.id, 'stakeholder_id', st.stakeholder, 'role', st.association, 'stakeholder',
    concat_ws(' ', s.first_name, s.last_name), 'image', s.picture)) AS stakeholder_connections,
  json_agg(json_build_object('id', ot.id, 'entity_id', ot.organisation, 'role', ot.association, 'entity', o.name,
    'image', o.logo)) AS entity_connections
  FROM technology t
  LEFT JOIN stakeholder_technology st
  ON st.technology=t.id
  LEFT JOIN stakeholder s
  ON s.id = st.stakeholder AND st.technology = t.id
  LEFT JOIN organisation_technology ot
  ON ot.technology = t.id
  LEFT JOIN organisation o
  ON o.id = ot.organisation AND ot.technology = t.id
  WHERE t.created_by IN
    (SELECT id FROM stakeholder
     WHERE affiliation = :id)
  GROUP BY t.id;

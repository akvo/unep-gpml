-- :name get-content-by-org :? :*
-- :doc Get all content types belonging to a particular organisation
WITH owned_content AS (
SELECT
  r.id, r.title, r.type, r.summary,
  json_agg(json_build_object('id', sr.id, 'stakeholder_id', sr.stakeholder, 'role', sr.association, 'stakeholder',
    concat_ws(' ', s.first_name, s.last_name), 'image', s.picture, 'stakeholder_role', s.role)) AS stakeholder_connections,
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
    concat_ws(' ', s.first_name, s.last_name), 'image', s.picture,  'stakeholder_role', s.role)) AS stakeholder_connections,
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
    concat_ws(' ', s.first_name, s.last_name), 'image', s.picture,  'stakeholder_role', s.role)) AS stakeholder_connections,
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
    concat_ws(' ', s.first_name, s.last_name), 'image', s.picture,  'stakeholder_role', s.role)) AS stakeholder_connections,
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
    concat_ws(' ', s.first_name, s.last_name), 'image', s.picture,  'stakeholder_role', s.role)) AS stakeholder_connections,
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
  GROUP BY t.id)
--~(if (:count-only? params) "SELECT COUNT(*) FROM owned_content;" "SELECT * FROM owned_content LIMIT :limit OFFSET :offset;")


-- :name get-associated-content-by-org :? :*
-- :doc Get all content types belonging to a particular organisation
WITH associated_content AS (
SELECT
  r.id, r.title, r.type, r.summary, ores.association::text AS association,
  json_agg(json_build_object('id', sr.id, 'stakeholder_id', sr.stakeholder, 'role', sr.association, 'stakeholder',
    concat_ws(' ', s.first_name, s.last_name), 'image', s.picture,  'stakeholder_role', s.role)) AS stakeholder_connections,
  json_agg(json_build_object('id', orgr.id, 'entity_id', orgr.organisation, 'role', orgr.association, 'entity', o.name,
    'image', o.logo)) AS entity_connections
  FROM resource r
  JOIN organisation_resource ores
  ON ores.resource = r.id AND ores.organisation = :id
  LEFT JOIN stakeholder_resource sr
  ON sr.resource=r.id
  LEFT JOIN stakeholder s
  ON s.id = sr.stakeholder AND sr.resource = r.id
  LEFT JOIN organisation_resource orgr
  ON orgr.resource = r.id
  LEFT JOIN organisation o
  ON o.id = orgr.organisation AND orgr.resource = r.id
  GROUP BY r.id,ores.association
UNION ALL
SELECT
  e.id, e.title, 'Event' AS type, e.description AS summary, orge.association::text AS association,
  json_agg(json_build_object('id', se.id, 'stakeholder_id', se.stakeholder, 'role', se.association, 'stakeholder',
    concat_ws(' ', s.first_name, s.last_name), 'image', s.picture,  'stakeholder_role', s.role)) AS stakeholder_connections,
  json_agg(json_build_object('id', oe.id, 'entity_id', oe.organisation, 'role', oe.association, 'entity', o.name,
    'image', o.logo)) AS entity_connections
  FROM event e
  JOIN organisation_event orge
  ON orge.event = e.id AND orge.organisation = :id
  LEFT JOIN stakeholder_event se
  ON se.event=e.id
  LEFT JOIN stakeholder s
  ON s.id = se.stakeholder AND se.event = e.id
  LEFT JOIN organisation_event oe
  ON oe.event = e.id
  LEFT JOIN organisation o
  ON o.id = oe.organisation AND oe.event = e.id
  GROUP BY e.id, orge.association
UNION ALL
SELECT
  i.id, i.q2::text AS title, 'Initiative' AS type, i.q3::text AS summary, orgi.association::text AS association,
  json_agg(json_build_object('id', si.id, 'stakeholder_id', si.stakeholder, 'role', si.association, 'stakeholder',
    concat_ws(' ', s.first_name, s.last_name), 'image', s.picture,  'stakeholder_role', s.role)) AS stakeholder_connections,
  json_agg(json_build_object('id', oi.id, 'entity_id', oi.organisation, 'role', oi.association, 'entity', o.name,
    'image', o.logo)) AS entity_connections
  FROM initiative i
  JOIN organisation_initiative orgi
  ON orgi.initiative = i.id AND orgi.organisation = :id
  LEFT JOIN stakeholder_initiative si
  ON si.initiative=i.id
  LEFT JOIN stakeholder s
  ON s.id = si.stakeholder AND si.initiative = i.id
  LEFT JOIN organisation_initiative oi
  ON oi.initiative = i.id
  LEFT JOIN organisation o
  ON o.id = oi.organisation AND oi.initiative = i.id
  GROUP BY i.id, orgi.association
UNION ALL
SELECT
  p.id, p.title, 'Policy' AS type, p.abstract AS summary, orgp.association::text AS association,
  json_agg(json_build_object('id', sp.id, 'stakeholder_id', sp.stakeholder, 'role', sp.association, 'stakeholder',
    concat_ws(' ', s.first_name, s.last_name), 'image', s.picture,  'stakeholder_role', s.role)) AS stakeholder_connections,
  json_agg(json_build_object('id', op.id, 'entity_id', op.organisation, 'role', op.association, 'entity', o.name,
    'image', o.logo)) AS entity_connections
  FROM policy p
  JOIN organisation_policy orgp
  ON orgp.policy = p.id AND orgp.organisation = :id
  LEFT JOIN stakeholder_policy sp
  ON sp.policy = p.id
  LEFT JOIN stakeholder s
  ON s.id = sp.stakeholder AND sp.policy = p.id
  LEFT JOIN organisation_policy op
  ON op.policy = p.id
  LEFT JOIN organisation o
  ON o.id = op.organisation AND op.policy = p.id
  GROUP BY p.id, orgp.association
UNION ALL
SELECT
  t.id, t.name AS title, 'Technology' AS type, t.remarks AS summary, orgt.association::text AS association,
  json_agg(json_build_object('id', st.id, 'stakeholder_id', st.stakeholder, 'role', st.association, 'stakeholder',
    concat_ws(' ', s.first_name, s.last_name), 'image', s.picture,  'stakeholder_role', s.role)) AS stakeholder_connections,
  json_agg(json_build_object('id', ot.id, 'entity_id', ot.organisation, 'role', ot.association, 'entity', o.name,
    'image', o.logo)) AS entity_connections
  FROM technology t
  JOIN organisation_technology orgt
  ON orgt.technology = t.id AND orgt.organisation = :id
  LEFT JOIN stakeholder_technology st
  ON st.technology=t.id
  LEFT JOIN stakeholder s
  ON s.id = st.stakeholder AND st.technology = t.id
  LEFT JOIN organisation_technology ot
  ON ot.technology = t.id
  LEFT JOIN organisation o
  ON o.id = ot.organisation AND ot.technology = t.id
  GROUP BY t.id, orgt.association)
--~(if (:count-only? params) "SELECT COUNT(*) FROM associated_content;" "SELECT * FROM associated_content LIMIT :limit OFFSET :offset;")

-- :name get-org-members :? :*
-- :doc Get all members belonging to a particular organisation
WITH org_members AS(
  SELECT
    id, concat_ws(' ', s.first_name, s.last_name) as name, picture, email, linked_in, twitter, url, about
  FROM stakeholder s
  WHERE affiliation = :id)
--~(if (:count-only? params) "SELECT COUNT(*) FROM org_members;" "SELECT * FROM org_members LIMIT :limit OFFSET :offset;")

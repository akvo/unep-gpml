-- :name new-initiative :<! :1
-- :doc Insert a new initiative
-- :require [gpml.sql-util]
insert into initiative(
--~ (#'gpml.sql-util/generate-insert params)
) values (
--~ (#'gpml.sql-util/generate-jsonb params)
) returning id;

-- :name initiative-by-id :? :1
SELECT initiative.*, COALESCE(json_agg(authz.stakeholder) FILTER (WHERE authz.stakeholder IS NOT NULL), '[]') as owners
FROM initiative
LEFT JOIN topic_stakeholder_auth authz ON authz.topic_type::text='initiative' AND authz.topic_id=initiative.id
WHERE initiative.id = :id
GROUP BY initiative.id

-- :name update-initiative :! :n
UPDATE initiative SET
--~ (#'gpml.sql-util/generate-update params)
WHERE id = :id;

-- :name initiative-detail-by-id :? :1
SELECT id,
json_agg(DISTINCT jsonb_build_object('name', focus_names.value)) AS focus_area,
jsonb_build_object('name', STRING_AGG(DISTINCT outcome_names.value, ', ')) AS outcome_and_impact,
jsonb_build_object('reports', report.value) AS is_action_being_reported,
jsonb_build_object('name', term.value) AS activity_term,
json_agg(DISTINCT jsonb_build_object('name', implementing_entity_names.value)) AS activity_owner,
json_agg(DISTINCT jsonb_build_object('name', main_focus_names.value)) AS main_focus,
json_agg(DISTINCT jsonb_build_object('name', infos.value)) AS info_resource_links,
json_agg(DISTINCT jsonb_build_object('name', sector_names.value)) AS sector,
json_agg(DISTINCT jsonb_build_object('name', phase_names.value)) AS lifecycle_phase,
json_agg(DISTINCT jsonb_build_object('name', organisation.value)) AS organisation,
json_agg(DISTINCT jsonb_build_object('name', SUBSTR(currency_amount_invested.key,1, POSITION(' ' IN currency_amount_invested.value)))) AS currency_amount_invested,
json_agg(DISTINCT jsonb_build_object('name', SUBSTR(currency_in_kind_contribution.key,1, POSITION(' ' IN currency_in_kind_contribution.value)))) AS currency_in_kind_contribution,
jsonb_build_object('name', STRING_AGG(DISTINCT donor_names.value,', '), 'types', json_agg(DISTINCT jsonb_build_object('name', funding_type.value))) AS funding

  FROM initiative i
  LEFT JOIN jsonb_array_elements(q40) infos ON true
  LEFT JOIN jsonb_array_elements(q4) main_focus ON true
  LEFT JOIN jsonb_each_text(main_focus) main_focus_names ON true

  LEFT JOIN jsonb_array_elements(q16) implementing_entity ON true
  LEFT JOIN jsonb_each_text(implementing_entity) implementing_entity_names ON true

  LEFT JOIN jsonb_each_text(q1_1) organisation ON true
  LEFT JOIN jsonb_each_text(q36_1) currency_amount_invested ON true
  LEFT JOIN jsonb_each_text(q37_1) currency_in_kind_contribution ON true

  LEFT JOIN jsonb_each_text(q35) funding_type ON true
  LEFT JOIN jsonb_each_text(q38) term ON true
  LEFT JOIN jsonb_each_text(q5) report ON true

  LEFT JOIN jsonb_array_elements(q26) phase ON true
  LEFT JOIN jsonb_each_text(phase) phase_names ON true
  LEFT JOIN jsonb_array_elements(q11) outcomes ON true
  LEFT JOIN jsonb_each_text(outcomes) outcome_names ON true
  LEFT JOIN jsonb_array_elements(q20) donors ON true
  LEFT JOIN jsonb_each_text(donors) donor_names ON true
  LEFT JOIN jsonb_array_elements(q28) focus ON true
  LEFT JOIN jsonb_each_text(focus) focus_names ON true
  LEFT JOIN jsonb_array_elements(q30) sectors ON true
  LEFT JOIN jsonb_each_text(sectors) sector_names ON true

  WHERE id = :id

  GROUP BY id, term.value, report.value;


-- :name add-initiative-geo-coverage :<! :1
-- :doc Add specified countries or country groups to an initiative
insert into initiative_geo_coverage(initiative, country_group, country)
values :t*:geo RETURNING id;

-- :name delete-initiative-geo-coverage :! :n
-- :doc Remove specified countries or country groups from an initiative
delete from initiative_geo_coverage where initiative=:id;

-- :name entity-connections-by-id
-- :doc Get entity connections by id
select oi.id, oi.association as role, org.id as entity_id, org.name as entity, org.logo as image
 from organisation_initiative oi
 left join organisation org
 on oi.organisation = org.id
 where oi.initiative = :id

-- :name stakeholder-connections-by-id
-- :doc Get stakeholder connections by id
select si.id, si.association as role, s.id as stakeholder_id, concat_ws(' ', s.first_name, s.last_name) as stakeholder,
 s.picture as image, s.role as stakeholder_role
  from stakeholder_initiative si
  left join stakeholder s
  on si.stakeholder = s.id
  where si.initiative = :id
  and si.is_bookmark = false;

-- :name all-initiatives
-- :doc List all initiatives
select id, q2 as title
  from initiative;

-- :name add-initiative-tags :<! :1
-- :doc add initiative tags
insert into initiative_tag(initiative, tag)
values :t*:tags RETURNING id;

-- :name related-content-by-id
-- :doc Get related content by id
select init.id, init.q2 as title, init.q3 as description from initiative i
  left join initiative init
  on init.id = ANY(i.related_content)
  where i.id = :id

-- :name new-initiative :<! :1
-- :doc Insert a new initiative
-- :require [gpml.sql-util]
insert into initiative(
--~ (#'gpml.sql-util/generate-insert params)
) values (
--~ (#'gpml.sql-util/generate-jsonb params)
) returning id;

-- :name initiative-by-id :? :1
SELECT * FROM initiative WHERE id = :id;

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
json_agg(DISTINCT jsonb_build_object('name', activity_names.value)) AS activity_owner,
json_agg(DISTINCT jsonb_build_object('name', infos.value)) AS info_resource_links,
json_agg(DISTINCT jsonb_build_object('name', sector_names.value)) AS sector,
json_agg(DISTINCT jsonb_build_object('name', phase_names.value)) AS lifecycle_phase,
json_agg(DISTINCT jsonb_build_object('name', country.value)) AS organisation,

json_agg(DISTINCT jsonb_build_object('name', SUBSTR(currency_amount_invested.value,1, POSITION(' ' IN currency_amount_invested.value)))) AS currency_amount_invested,
json_agg(DISTINCT jsonb_build_object('name', SUBSTR(currency_in_kind_contribution.value,1, POSITION(' ' IN currency_in_kind_contribution.value)))) AS currency_in_kind_contribution,
jsonb_build_object('name', STRING_AGG(DISTINCT donor_names.value,', '), 'types', json_agg(DISTINCT jsonb_build_object('name', funding_type.value))) AS funding

  FROM initiative i
  LEFT JOIN jsonb_array_elements(q40) infos ON true
  LEFT JOIN jsonb_array_elements(q4) activities ON true
  LEFT JOIN jsonb_each_text(activities) activity_names ON true

  LEFT JOIN jsonb_each_text(q1_1) country ON true
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


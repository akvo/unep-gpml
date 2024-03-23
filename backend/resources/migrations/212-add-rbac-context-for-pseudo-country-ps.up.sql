INSERT INTO rbac_context (context_type_name, resource_id, id, parent)
SELECT
  'plastic-strategy' AS context_type_name,
  plastic_strategy.id AS resource_id,
  uuid_generate_v4() AS id,
  '00000000-0000-0000-0000-000000000000'::uuid AS parent
FROM
  plastic_strategy
INNER JOIN
  country ON plastic_strategy.country_id = country.id
WHERE
  country.iso_code_a2 = '0A';

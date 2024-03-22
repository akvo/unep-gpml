INSERT INTO rbac_context (context_type_name, resource_id, id, parent)
VALUES ('plastic-strategy',
       (SELECT plastic_strategy.id FROM plastic_strategy INNER JOIN country ON iso_code_a2 = '0A'),
       uuid_generate_v4(),
       '00000000-0000-0000-0000-000000000000'::uuid);

BEGIN;
--;;
--;; Drop dependent (legacy) views related to 'policy' table.
DROP VIEW IF EXISTS v_policy;
--;;
DROP VIEW IF EXISTS v_policy_data;
--;;
--;; Delete legacy table related to policy once the dependent views have been deleted too.
DROP TABLE IF EXISTS policy_language_url;
--;;
COMMIT;
BEGIN;
--;;
DROP VIEW v_topic_all;
DROP VIEW v_topic;
DROP VIEW v_stakeholder;
DROP VIEW v_stakeholder_data;
--;;
ALTER TABLE stakeholder
DROP COLUMN representation;
--;;
COMMIT;

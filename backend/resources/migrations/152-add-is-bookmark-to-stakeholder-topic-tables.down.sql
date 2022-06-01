BEGIN;
--;;
ALTER TABLE stakeholder_event
DROP COLUMN is_bookmark;
--;;
ALTER TABLE stakeholder_initiative
DROP COLUMN is_bookmark;
--;;
ALTER TABLE stakeholder_resource
DROP COLUMN is_bookmark;
--;;
ALTER TABLE stakeholder_policy
DROP COLUMN is_bookmark;
--;;
ALTER TABLE stakeholder_technology
DROP COLUMN is_bookmark;
--;;
COMMIT;

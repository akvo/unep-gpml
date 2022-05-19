BEGIN;
--;;
ALTER TABLE stakeholder_tag
DROP COLUMN tag_relation_category;
--;;
COMMIT;

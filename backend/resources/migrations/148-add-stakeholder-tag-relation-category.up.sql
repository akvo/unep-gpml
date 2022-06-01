BEGIN;
--;;
ALTER TABLE stakeholder_tag
ADD COLUMN tag_relation_category TEXT;
--;;
COMMIT;

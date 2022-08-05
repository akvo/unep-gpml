BEGIN;
--;;
DELETE FROM stakeholder_tag WHERE tag_relation_category IS NULL;
--;;
ALTER TABLE IF EXISTS stakeholder_tag
  ALTER COLUMN tag_relation_category SET NOT NULL;
--;;
COMMIT;
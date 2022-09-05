BEGIN;
--;;
CREATE TYPE PROJECT_STAGE AS ENUM('create','implement','report','update');
--;;
ALTER TABLE project
ADD COLUMN stage PROJECT_STAGE;
--;;
UPDATE project SET stage = 'create';
--;;
ALTER TABLE project
ALTER COLUMN stage SET NOT NULL;
--;;
COMMIT;

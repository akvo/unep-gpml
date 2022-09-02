BEGIN;
--;;
CREATE TYPE PROJECT_STAGE AS ENUM('create','implement','report','update');
--;;
ALTER TABLE project
ADD COLUMN stage PROJECT_STAGE NOT NULL;
--;;
COMMIT;

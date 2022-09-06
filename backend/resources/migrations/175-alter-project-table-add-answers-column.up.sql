BEGIN;
--;;
ALTER TABLE project
ADD COLUMN answers JSONB;
--;;
COMMIT;

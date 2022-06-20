BEGIN;
--;;
ALTER TABLE resource
ADD COLUMN thumbnail TEXT;
--;;
ALTER TABLE policy
ADD COLUMN thumbnail TEXT;
--;;
COMMIT;

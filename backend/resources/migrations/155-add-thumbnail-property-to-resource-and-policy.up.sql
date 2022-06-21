BEGIN;
--;;
ALTER TABLE resource
ADD COLUMN thumbnail TEXT;
--;;
ALTER TABLE policy
ADD COLUMN thumbnail TEXT;
--;;
ALTER TABLE initiative
ADD COLUMN thumbnail TEXT;
--;;
ALTER TABLE technology
ADD COLUMN thumbnail TEXT;
--;;
ALTER TABLE event
ADD COLUMN thumbnail TEXT;
--;;
COMMIT;

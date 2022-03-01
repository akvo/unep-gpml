BEGIN;
--;;
ALTER TABLE resource
ADD COLUMN subnational_city TEXT;
--;;
ALTER TABLE event
ADD COLUMN subnational_city TEXT;
--;;
ALTER TABLE initiative
ADD COLUMN q24_subnational_city TEXT;
--;;
ALTER TABLE policy
ADD COLUMN subnational_city TEXT;
--;;
ALTER TABLE technology
ADD COLUMN subnational_city TEXT;
--;;
COMMIT;

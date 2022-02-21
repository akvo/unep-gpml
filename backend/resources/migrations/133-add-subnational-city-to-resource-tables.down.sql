BEGIN;
--;;
ALTER TABLE resource
DROP COLUMN subnational_city;
--;;
ALTER TABLE event
DROP COLUMN subnational_city;
--;;
ALTER TABLE initiative
DROP COLUMN q24_subnational_city;
--;;
ALTER TABLE policy
DROP COLUMN subnational_city;
--;;
ALTER TABLE technology
DROP COLUMN subnational_city;
--;;
COMMIT;

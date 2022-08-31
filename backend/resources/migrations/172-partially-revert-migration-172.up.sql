BEGIN;
--;;
ALTER TABLE policy
ADD COLUMN subnational_city TEXT;
--;;
COMMIT;

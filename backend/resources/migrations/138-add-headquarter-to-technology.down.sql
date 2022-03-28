BEGIN;
--;;
ALTER TABLE technology
DROP COLUMN headquarter;
--;;
ALTER TABLE country
DROP COLUMN headquarter TEXT;
--;;
COMMIT;

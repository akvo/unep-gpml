BEGIN;
--;;
ALTER TABLE technology
ADD COLUMN headquarter TEXT;
--;;
ALTER TABLE country
ADD COLUMN headquarter TEXT;
--;;
COMMIT;
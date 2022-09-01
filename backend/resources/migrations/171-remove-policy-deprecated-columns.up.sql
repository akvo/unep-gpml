BEGIN;
--;;
ALTER TABLE policy
DROP COLUMN subnational_city,
DROP COLUMN regulatory_approach,
DROP COLUMN toolkit_legislation,
DROP COLUMN publication_reference;
--;;
COMMIT;

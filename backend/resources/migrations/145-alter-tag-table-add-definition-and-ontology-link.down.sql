BEGIN;
--;;
ALTER TABLE tag
DROP COLUMN definition,
DROP COLUMN ontology_ref_link;
--;;
COMMIT;

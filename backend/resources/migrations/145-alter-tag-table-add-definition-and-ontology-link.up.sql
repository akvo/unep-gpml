BEGIN;
--;;
ALTER TABLE tag
ADD COLUMN definition TEXT,
ADD COLUMN ontology_ref_link TEXT;
--;;
COMMIT;

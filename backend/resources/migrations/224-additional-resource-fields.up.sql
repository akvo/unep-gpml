BEGIN;

ALTER TABLE resource
ADD COLUMN patent_owner text,
ADD COLUMN registration_url text;

COMMIT;

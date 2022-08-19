BEGIN;
--;;
--;; Create english language in case it does not exist, avoiding errors if it already exists.
--;; We need this to be always available for providing a default language to existing policies.
INSERT INTO language (english_name, native_name, iso_code) VALUES
  ('English', 'English', 'en')
  ON CONFLICT DO NOTHING;
--;;
--;; Alter current `language` column type and set default value for existing rows.
--;; We want to unify the column type to use more meaningful column for the language, as iso-code is unique as well,
--;; so we do not need to deal with the serial id (PK) of the language table and we can simplify translations management.
--;; We do not care about losing stored original languages, since we only can guarantee english content and we do not
--;; support multi-lingual integration with LEAP API policies import.
--;; In order to alter the column, we need to drop current FK constraint and re-create it pointing to the right column.
ALTER TABLE IF EXISTS policy
  DROP CONSTRAINT IF EXISTS policy_language_fkey,
  ALTER COLUMN language TYPE varchar(3) USING 'en',
  ALTER COLUMN language SET NOT NULL,
  ADD CONSTRAINT policy_language_fkey FOREIGN KEY (language) REFERENCES language (iso_code) ON UPDATE CASCADE;
--;;
COMMIT;
BEGIN;
--;; Add mandatory language prop to all resource types, ensuring a default value for existing entities.
--;; Event resource type
--;;
ALTER TABLE IF EXISTS event
  ADD COLUMN IF NOT EXISTS language varchar(3) DEFAULT 'en',
  ALTER COLUMN language SET NOT NULL,
  ADD CONSTRAINT event_language_fkey FOREIGN KEY (language) REFERENCES language (iso_code) ON UPDATE CASCADE;
--;;
--;; Now drop the default value after existing entities have a default language.
ALTER TABLE IF EXISTS event
  ALTER COLUMN language DROP DEFAULT;
--;;
--;; Initiative resource type
ALTER TABLE IF EXISTS initiative
  ADD COLUMN IF NOT EXISTS language varchar(3) DEFAULT 'en',
  ALTER COLUMN language SET NOT NULL,
  ADD CONSTRAINT initiative_language_fkey FOREIGN KEY (language) REFERENCES language (iso_code) ON UPDATE CASCADE;
--;;
--;; Now drop the default value after existing entities have a default language.
ALTER TABLE IF EXISTS initiative
  ALTER COLUMN language DROP DEFAULT;
--;;
--;; Resource resource type
ALTER TABLE IF EXISTS resource
  ADD COLUMN IF NOT EXISTS language varchar(3) DEFAULT 'en',
  ALTER COLUMN language SET NOT NULL,
  ADD CONSTRAINT resource_language_fkey FOREIGN KEY (language) REFERENCES language (iso_code) ON UPDATE CASCADE;
--;;
--;; Now drop the default value after existing entities have a default language.
ALTER TABLE IF EXISTS resource
  ALTER COLUMN language DROP DEFAULT;
--;;
--;; Technology resource type
ALTER TABLE IF EXISTS technology
  ADD COLUMN IF NOT EXISTS language varchar(3) DEFAULT 'en',
  ALTER COLUMN language SET NOT NULL,
  ADD CONSTRAINT technology_language_fkey FOREIGN KEY (language) REFERENCES language (iso_code) ON UPDATE CASCADE;
--;;
--;; Now drop the default value after existing entities have a default language.
ALTER TABLE IF EXISTS technology
  ALTER COLUMN language DROP DEFAULT;
--;;
COMMIT;
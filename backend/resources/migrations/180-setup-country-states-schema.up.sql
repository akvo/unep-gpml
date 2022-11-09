BEGIN;
--;;
CREATE TABLE country_state (
  id SERIAL NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT,
  country_id INTEGER NOT NULL REFERENCES country(id)
);
--;;
ALTER TABLE initiative_geo_coverage
ADD COLUMN country_state INTEGER REFERENCES country_state(id) ON DELETE CASCADE;
--;;
ALTER TABLE policy_geo_coverage
ADD COLUMN country_state INTEGER REFERENCES country_state(id) ON DELETE CASCADE;
--;;
ALTER TABLE event_geo_coverage
ADD COLUMN country_state INTEGER REFERENCES country_state(id) ON DELETE CASCADE;
--;;
ALTER TABLE resource_geo_coverage
ADD COLUMN country_state INTEGER REFERENCES country_state(id) ON DELETE CASCADE;
--;;
ALTER TABLE technology_geo_coverage
ADD COLUMN country_state INTEGER REFERENCES country_state(id) ON DELETE CASCADE;
--;;
ALTER TABLE case_study_geo_coverage
ADD COLUMN country_state INTEGER REFERENCES country_state(id) ON DELETE CASCADE;
--;;
ALTER TABLE project_geo_coverage
ADD COLUMN country_state INTEGER REFERENCES country_state(id) ON DELETE CASCADE;
--;;
ALTER TABLE organisation_geo_coverage
ADD COLUMN country_state INTEGER REFERENCES country_state(id) ON DELETE CASCADE;
--;;
ALTER TABLE project_geo_coverage
RENAME COLUMN project_id TO project;
--;;
ALTER TABLE project_geo_coverage
RENAME COLUMN country_id TO country;
--;;
ALTER TABLE project_geo_coverage
RENAME COLUMN country_group_id TO country_group;
--;;
COMMIT;

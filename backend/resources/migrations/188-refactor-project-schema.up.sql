BEGIN;
--;;
CREATE SEQUENCE project_id_seq AS INTEGER OWNED BY project.id;
--;;
ALTER TABLE project
ADD COLUMN id_old UUID;
--;;
ALTER TABLE project_geo_coverage
ADD COLUMN project_new INTEGER;
--;;
UPDATE project set id_old = id;
--;;
ALTER TABLE project_geo_coverage
DROP CONSTRAINT project_geo_coverage_project_id_fkey;
--;;
DROP INDEX project_geo_coverage_project_country_idx;
--;;
DROP INDEX project_geo_coverage_project_country_group_idx;
--;;
ALTER TABLE project
ALTER COLUMN id SET DATA TYPE INTEGER USING nextval('project_id_seq');
--;;
ALTER TABLE project
ALTER COLUMN id SET DEFAULT nextval('project_id_seq');
--;;
UPDATE project_geo_coverage pgc
SET project_new = p.id
FROM project p
WHERE pgc.project = p.id_old;
--;;
ALTER TABLE project
DROP COLUMN id_old;
--;;
ALTER TABLE project_geo_coverage
DROP COLUMN project;
--;;
ALTER TABLE project_geo_coverage
RENAME COLUMN project_new TO project;
--;;
ALTER TABLE project_geo_coverage
ALTER COLUMN project SET NOT NULL;
--;;
ALTER TABLE project_geo_coverage
ADD CONSTRAINT project_geo_coverage_project_fkey FOREIGN KEY (project) REFERENCES project(id) ON DELETE CASCADE;
--;;
CREATE UNIQUE INDEX IF NOT EXISTS project_geo_coverage_project_country_idx
ON project_geo_coverage (
project,
country);
--;;
CREATE UNIQUE INDEX IF NOT EXISTS project_geo_coverage_project_country_group_idx
ON project_geo_coverage (
project,
country_group);
--;;
CREATE UNIQUE INDEX IF NOT EXISTS project_geo_coverage_project_country_state_idx
ON project_geo_coverage (
project,
country_state);
--;;
COMMIT;

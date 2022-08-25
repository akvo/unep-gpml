BEGIN;
--;;
CREATE TYPE PROJECT_TYPE AS ENUM('action-plan');
--;;
CREATE TABLE project (
       id UUID PRIMARY KEY,
       stakeholder_id INTEGER NOT NULL REFERENCES stakeholder(id) ON DELETE CASCADE,
       type PROJECT_TYPE NOT NULL,
       title TEXT NOT NULL,
       geo_coverage_type GEO_COVERAGE_TYPE NOT NULL,
       checklist JSONB
);
--;;
CREATE TABLE project_geo_coverage (
       project_id UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
       country_id INTEGER REFERENCES country(id) ON DELETE CASCADE ON UPDATE CASCADE,
       country_group_id INTEGER REFERENCES country_group(id) ON DELETE CASCADE ON UPDATE CASCADE
);
--;;
ALTER TABLE project_geo_coverage
ADD CONSTRAINT project_geo_coverage_unique UNIQUE (project_id, country_id, country_group_id);
--;;
CREATE UNIQUE INDEX project_geo_coverage_project_id_country_id_idx ON project_geo_coverage (project_id, country_id) WHERE country_id IS NULL;
--;;
CREATE UNIQUE INDEX project_geo_coverage_project_id_country_group_id_idx ON project_geo_coverage (project_id, country_group_id) WHERE country_group_id IS NULL;
--;;
COMMIT;

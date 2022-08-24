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
COMMIT;

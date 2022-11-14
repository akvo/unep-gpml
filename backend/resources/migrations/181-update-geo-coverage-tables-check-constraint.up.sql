BEGIN;
--;;
ALTER TABLE resource_geo_coverage
DROP CONSTRAINT country_or_group_not_null;
--;;
ALTER TABLE event_geo_coverage
DROP CONSTRAINT check_country_or_group_not_null;
--;;
ALTER TABLE policy_geo_coverage
DROP CONSTRAINT check_country_or_group_not_null;
--;;
ALTER TABLE initiative_geo_coverage
DROP CONSTRAINT check_country_or_group_not_null;
--;;
ALTER TABLE technology_geo_coverage
DROP CONSTRAINT check_country_or_group_not_null;
--;;
ALTER TABLE project_geo_coverage
DROP CONSTRAINT project_geo_coverage_unique;
--;;
DROP INDEX project_geo_coverage_project_id_country_group_id_idx;
--;;
DROP INDEX project_geo_coverage_project_id_country_id_idx;
--;;
ALTER TABLE case_study_geo_coverage
DROP CONSTRAINT case_study_geo_coverage_unique;
--;;
DROP INDEX case_study_geo_coverage_case_study_country_group_idx;
--;;
DROP INDEX case_study_geo_coverage_case_study_country_idx;
--;;
--;; Case Study
--;;
CREATE UNIQUE INDEX IF NOT EXISTS case_study_geo_coverage_case_study_country_idx
ON case_study_geo_coverage (
case_study,
country);
--;;
CREATE UNIQUE INDEX IF NOT EXISTS case_study_geo_coverage_case_study_country_group_idx
ON case_study_geo_coverage (
case_study,
country_group);
--;;
CREATE UNIQUE INDEX IF NOT EXISTS case_study_geo_coverage_case_study_country_group_idx
ON case_study_geo_coverage (
case_study,
country_state);
--;;
--;; Project
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
CREATE UNIQUE INDEX IF NOT EXISTS project_geo_coverage_project_country_group_idx
ON project_geo_coverage (
project,
country_state);
--;;
--;; Resource
--;;
CREATE UNIQUE INDEX IF NOT EXISTS resource_geo_coverage_resource_country_idx
ON resource_geo_coverage (
resource,
country);
--;;
CREATE UNIQUE INDEX IF NOT EXISTS resource_geo_coverage_resource_country_group_idx
ON resource_geo_coverage (
resource,
country_group);
--;;
CREATE UNIQUE INDEX IF NOT EXISTS resource_geo_coverage_resource_country_group_idx
ON resource_geo_coverage (
resource,
country_state);
--;;
--;; Event
--;;
CREATE UNIQUE INDEX IF NOT EXISTS event_geo_coverage_event_country_idx
ON event_geo_coverage (
event,
country);
--;;
CREATE UNIQUE INDEX IF NOT EXISTS event_geo_coverage_event_country_group_idx
ON event_geo_coverage (
event,
country_group);
--;;
CREATE UNIQUE INDEX IF NOT EXISTS event_geo_coverage_event_country_group_idx
ON event_geo_coverage (
event,
country_state);
--;;
--;; Technology
--;;
CREATE UNIQUE INDEX IF NOT EXISTS technology_geo_coverage_technology_country_idx
ON technology_geo_coverage (
technology,
country);
--;;
CREATE UNIQUE INDEX IF NOT EXISTS technology_geo_coverage_technology_country_group_idx
ON technology_geo_coverage (
technology,
country_group);
--;;
CREATE UNIQUE INDEX IF NOT EXISTS technology_geo_coverage_technology_country_group_idx
ON technology_geo_coverage (
technology,
country_state);
--;;
--;; Initiative
--;;
CREATE UNIQUE INDEX IF NOT EXISTS initiative_geo_coverage_initiative_country_idx
ON initiative_geo_coverage (
initiative,
country);
--;;
CREATE UNIQUE INDEX IF NOT EXISTS initiative_geo_coverage_initiative_country_group_idx
ON initiative_geo_coverage (
initiative,
country_group);
--;;
CREATE UNIQUE INDEX IF NOT EXISTS initiative_geo_coverage_initiative_country_group_idx
ON initiative_geo_coverage (
initiative,
country_state);
--;;
--;; Policy
--;;
CREATE UNIQUE INDEX IF NOT EXISTS policy_geo_coverage_policy_country_idx
ON policy_geo_coverage (
policy,
country);
--;;
CREATE UNIQUE INDEX IF NOT EXISTS policy_geo_coverage_policy_country_group_idx
ON policy_geo_coverage (
policy,
country_group);
--;;
CREATE UNIQUE INDEX IF NOT EXISTS policy_geo_coverage_policy_country_group_idx
ON policy_geo_coverage (
policy,
country_state);
--;;
COMMIT;

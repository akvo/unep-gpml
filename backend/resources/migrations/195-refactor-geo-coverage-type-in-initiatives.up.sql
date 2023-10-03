BEGIN;
--;; Drop dependent (legacy) views related to 'initiative' table.
--;;
DROP VIEW IF EXISTS v_initiative_geo CASCADE;
--;;
DROP VIEW IF EXISTS v_initiative_geo_coverage CASCADE;
--;;
DROP VIEW IF EXISTS v_initiative_tag CASCADE;
--;;
DROP VIEW IF EXISTS v_initiative_data CASCADE;
--;;
DROP VIEW IF EXISTS v_initiative_search_text CASCADE;
--;;
DROP VIEW IF EXISTS v_project CASCADE;
--;; Add new column
ALTER TABLE initiative
  ADD COLUMN geo_coverage_type GEO_COVERAGE_TYPE;
--;; Migrate old values of geo_coverage_type to the new column
--;;
UPDATE initiative
  SET geo_coverage_type = (SELECT * FROM jsonb_object_keys(q24) LIMIT 1)::geo_coverage_type;
--;;
--;; Drop legacy columns related to geo_coverage (type and values).
--;; Values are deleted since we already have `initiative_geo_coverage` table for those.
--;;
ALTER TABLE initiative
  DROP COLUMN q22,
  DROP COLUMN q23,
  DROP COLUMN q24,
  DROP COLUMN q24_1,
  DROP COLUMN q24_2,
  DROP COLUMN q24_3,
  DROP COLUMN q24_4,
  DROP COLUMN q24_5,
  DROP COLUMN q24_subnational_city;
--;;
COMMIT;
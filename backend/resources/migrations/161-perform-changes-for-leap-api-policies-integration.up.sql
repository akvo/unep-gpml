BEGIN;
--;; Delete data related to 'policy' entity.
DELETE FROM activity WHERE metadata ->> 'topic' = 'policy';
--;;
DELETE FROM comment WHERE resource_type = 'policy';
--;; Delete all the related content ref rows that have a policy as either source or target.
DELETE FROM related_content WHERE
  resource_table_name = 'policy'::regclass
  OR
  related_resource_table_name = 'policy'::regclass;
--;;
DELETE FROM topic_stakeholder_auth WHERE topic_type = 'policy';
--;;
DELETE FROM organisation_policy;
--;;
DELETE FROM policy_geo_coverage;
--;;
DELETE FROM policy_tag;
--;;
DELETE FROM stakeholder_policy;
--;;
DELETE FROM policy;
--;;
--;; Alter table to make LEAP API Integration related changes
ALTER TABLE IF EXISTS policy
  ADD COLUMN IF NOT EXISTS leap_api_id UUID UNIQUE,
  ADD COLUMN IF NOT EXISTS leap_api_modified TIMESTAMP,
  DROP COLUMN IF EXISTS first_publication_date,
  ADD COLUMN IF NOT EXISTS first_publication_date DATE,
  DROP COLUMN IF EXISTS latest_amendment_date,
  ADD COLUMN IF NOT EXISTS latest_amendment_date DATE;
--;;
--;; Alter related_content table to add new column and enum needed for LEAP API integration
CREATE TYPE related_content_relation_type AS ENUM (
  'implements',
  'amends',
  'repeals'
);
--;;
ALTER TABLE IF EXISTS related_content
  ADD COLUMN IF NOT EXISTS related_content_relation_type related_content_relation_type;
--;;
--;; Add tag category for LEAP API incoming tags
INSERT INTO tag_category (category) VALUES ('leap api');
--;;
COMMIT;

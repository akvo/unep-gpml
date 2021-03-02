--:name drop-constraint :! :n
ALTER TABLE country_group_country
    DROP CONSTRAINT IF EXISTS country_group_countries_country_fkey;
ALTER TABLE stakeholder
    DROP CONSTRAINT IF EXISTS stakeholder_country_fkey;
ALTER TABLE stakeholder_geo_coverage
    DROP CONSTRAINT IF EXISTS stakeholder_geo_coverage_country_fkey;
ALTER TABLE event
    DROP CONSTRAINT IF EXISTS event_country_fkey;
ALTER TABLE event_geo_coverage
    DROP CONSTRAINT IF EXISTS event_geo_coverage_country_fkey;
ALTER TABLE policy
    DROP CONSTRAINT IF EXISTS policy_country_fkey;
ALTER TABLE policy_geo_coverage
    DROP CONSTRAINT IF EXISTS policy_geo_coverage_country_fkey;
ALTER TABLE technology
    DROP CONSTRAINT IF EXISTS technology_country_fkey;
ALTER TABLE technology_geo_coverage
    DROP CONSTRAINT IF EXISTS technology_geo_coverage_country_fkey;
ALTER TABLE resource
    DROP CONSTRAINT IF EXISTS resource_country_fkey;
ALTER TABLE resource_geo_coverage
    DROP CONSTRAINT IF EXISTS resource_geo_coverage_country_fkey;
ALTER TABLE project_country
    DROP CONSTRAINT IF EXISTS project_country_country_fkey;
ALTER TABLE organisation
    DROP CONSTRAINT IF EXISTS organisation_country_fkey;
ALTER TABLE organisation_geo_coverage
    DROP CONSTRAINT IF EXISTS organisation_geo_coverage_country_fkey;
TRUNCATE TABLE country;
ALTER TABLE country ALTER COLUMN id SET DEFAULT NULL;
ALTER TABLE country DROP CONSTRAINT IF EXISTS country_pkey;

--:name add-constraint :! :n
ALTER SEQUENCE country_id_seq MINVALUE 0;
SELECT setval('country_id_seq', :id::integer);
ALTER TABLE country ALTER COLUMN id SET DEFAULT nextval('country_id_seq');
ALTER TABLE country ADD CONSTRAINT country_pkey PRIMARY KEY (id);
ALTER TABLE country_group_country
    ADD CONSTRAINT country_group_countries_country_fkey
    FOREIGN KEY (country) REFERENCES country(id);
ALTER TABLE stakeholder
    ADD CONSTRAINT stakeholder_country_fkey
    FOREIGN KEY (country) REFERENCES country(id);
ALTER TABLE stakeholder_geo_coverage
    ADD CONSTRAINT stakeholder_geo_coverage_country_fkey
    FOREIGN KEY (country) REFERENCES country(id);
ALTER TABLE event
    ADD CONSTRAINT event_country_fkey
    FOREIGN KEY (country) REFERENCES country(id);
ALTER TABLE event_geo_coverage
    ADD CONSTRAINT event_geo_coverage_country_fkey
    FOREIGN KEY (country) REFERENCES country(id);
ALTER TABLE policy
    ADD CONSTRAINT policy_country_fkey
    FOREIGN KEY (country) REFERENCES country(id);
ALTER TABLE policy_geo_coverage
    ADD CONSTRAINT policy_geo_coverage_country_fkey
    FOREIGN KEY (country) REFERENCES country(id);
ALTER TABLE technology
    ADD CONSTRAINT technology_country_fkey
    FOREIGN KEY (country) REFERENCES country(id);
ALTER TABLE technology_geo_coverage
    ADD CONSTRAINT technology_geo_coverage_country_fkey
    FOREIGN KEY (country) REFERENCES country(id);
ALTER TABLE resource
    ADD CONSTRAINT resource_country_fkey
    FOREIGN KEY (country) REFERENCES country(id);
ALTER TABLE resource_geo_coverage
    ADD CONSTRAINT resource_geo_coverage_country_fkey
    FOREIGN KEY (country) REFERENCES country(id);
ALTER TABLE project_country
    ADD CONSTRAINT project_country_country_fkey
    FOREIGN KEY (country) REFERENCES country(id);
ALTER TABLE organisation
    ADD CONSTRAINT organisation_country_fkey
    FOREIGN KEY (country) REFERENCES country(id);
ALTER TABLE organisation_geo_coverage
    ADD CONSTRAINT organisation_geo_coverage_country_fkey
    FOREIGN KEY (country) REFERENCES country(id);

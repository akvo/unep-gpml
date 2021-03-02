--:name drop-constraint :! :n
ALTER TABLE resource_organisation
    DROP CONSTRAINT IF EXISTS resource_organisation_organisation_fkey;
ALTER TABLE stakeholder_organisation
    DROP CONSTRAINT IF EXISTS stakeholder_organisation_organisation_fkey;
ALTER TABLE stakeholder
    DROP CONSTRAINT IF EXISTS stakeholder_affiliation_fkey;
ALTER TABLE organisation_geo_coverage
    DROP CONSTRAINT IF EXISTS organisation_geo_coverage_organisation_fkey;
TRUNCATE TABLE organisation_geo_coverage;
ALTER TABLE organisation ALTER COLUMN id SET DEFAULT NULL;
ALTER TABLE organisation DROP CONSTRAINT IF EXISTS organisation_pkey;

--:name add-constraint :! :n
SELECT setval('organisation_id_seq', :id::integer);
ALTER TABLE organisation
    ALTER COLUMN id SET DEFAULT nextval('organisation_id_seq');
ALTER TABLE organisation ADD CONSTRAINT organisation_pkey PRIMARY KEY (id);
ALTER TABLE organisation_geo_coverage
    ADD CONSTRAINT organisation_geo_coverage_organisation_fkey
    FOREIGN KEY (organisation) REFERENCES organisation(id);
ALTER TABLE stakeholder
    ADD CONSTRAINT stakeholder_affiliation_fkey
    FOREIGN KEY (affiliation) REFERENCES organisation(id);
ALTER TABLE stakeholder_organisation
    ADD CONSTRAINT stakeholder_organisation_organisation_fkey
    FOREIGN KEY (organisation) REFERENCES organisation(id);
ALTER TABLE resource_organisation
    ADD CONSTRAINT resource_organisation_organisation_fkey
    FOREIGN KEY (organisation) REFERENCES organisation(id);

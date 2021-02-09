ALTER TABLE organisation DROP COLUMN country_group;
ALTER TABLE organisation ADD COLUMN geo_coverage_type geo_coverage_type;
CREATE TABLE organisation_geo_coverage (
  id serial NOT NULL PRIMARY KEY,
  organisation integer NOT NULL REFERENCES organisation(id),
  country_group integer REFERENCES country_group(id),
  country integer REFERENCES country(id)
);
ALTER TABLE organisation_geo_coverage
ADD CONSTRAINT check_country_or_group_not_null CHECK (num_nonnulls(country_group, country) = 1);

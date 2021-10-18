ALTER TABLE non_member_organisation ADD COLUMN geo_coverage_type geo_coverage_type;
CREATE TABLE non_member_organisation_geo_coverage (
  id serial NOT NULL PRIMARY KEY,
  non_member_organisation integer NOT NULL REFERENCES non_member_organisation(id),
  country_group integer REFERENCES country_group(id),
  country integer REFERENCES country(id)
);
ALTER TABLE non_member_organisation_geo_coverage
ADD CONSTRAINT check_country_or_group_not_null CHECK (num_nonnulls(country_group, country) = 1);

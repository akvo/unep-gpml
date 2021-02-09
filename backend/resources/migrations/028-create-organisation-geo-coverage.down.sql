ALTER TABLE organisation ADD COLUMN country_group integer REFERENCES country_group(id);
ALTER TABLE organisation DROP COLUMN geo_coverage_type;

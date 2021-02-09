ALTER TABLE organisation ADD COLUMN type text;
ALTER TABLE organisation ADD COLUMN country integer REFERENCES country(id);
ALTER TABLE organisation ADD COLUMN country_group integer REFERENCES country_group(id);

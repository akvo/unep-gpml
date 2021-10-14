ALTER TABLE non_member_organisation ADD COLUMN country integer REFERENCES country(id);
ALTER TABLE non_member_organisation ADD COLUMN subnational_area_only text;

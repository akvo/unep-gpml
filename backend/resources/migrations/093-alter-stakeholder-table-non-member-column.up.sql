 ALTER TABLE stakeholder DROP COLUMN company_name;
 ALTER TABLE stakeholder ADD column non_member_organisation integer REFERENCES non_member_organisation(id);

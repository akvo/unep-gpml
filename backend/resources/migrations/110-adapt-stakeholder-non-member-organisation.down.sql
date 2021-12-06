ALTER TABLE stakeholder
      DROP CONSTRAINT stakeholder_non_member_organisation_fkey;
ALTER TABLE stakeholder
      ADD FOREIGN KEY (non_member_organisation) REFERENCES non_member_organisation(id);

ALTER TABLE organisation_initiative
DROP COLUMN association cascade;
--;;
ALTER TABLE organisation_initiative
ADD COLUMN association project_association;
--;;
ALTER TABLE stakeholder_initiative
DROP COLUMN association cascade;
--;;
ALTER TABLE stakeholder_initiative
ADD COLUMN association project_association;
--;;
DROP TYPE initiative_association;
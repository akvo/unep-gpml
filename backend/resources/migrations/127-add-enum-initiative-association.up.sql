CREATE TYPE initiative_association AS
ENUM('owner', 'implementor', 'reviewer', 'user', 'interested in', 'other', 'partner', 'donor');
--;;
ALTER TABLE organisation_initiative
DROP COLUMN association cascade;
--;;
ALTER TABLE organisation_initiative
ADD COLUMN association initiative_association;
--;;
ALTER TABLE stakeholder_initiative
DROP COLUMN association cascade;
--;;
ALTER TABLE stakeholder_initiative
ADD COLUMN association initiative_association;
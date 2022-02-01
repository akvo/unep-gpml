ALTER TABLE stakeholder_resource
DROP CONSTRAINT stakeholder_resource_resource_fkey;
--;;
ALTER TABLE stakeholder_resource
ADD FOREIGN KEY (resource)
REFERENCES resource(id)
ON DELETE CASCADE;
--;;
ALTER TABLE stakeholder_event
DROP CONSTRAINT stakeholder_event_event_fkey;
--;;
ALTER TABLE stakeholder_event
ADD FOREIGN KEY (event)
REFERENCES event(id)
ON DELETE CASCADE;
--;;
ALTER TABLE stakeholder_initiative
DROP CONSTRAINT stakeholder_initiative_initiative_fkey;
--;;
ALTER TABLE stakeholder_initiative
ADD FOREIGN KEY (initiative)
REFERENCES initiative(id)
ON DELETE CASCADE;
--;;
ALTER TABLE stakeholder_policy
DROP CONSTRAINT stakeholder_policy_policy_fkey;
--;;
ALTER TABLE stakeholder_policy
ADD FOREIGN KEY (policy)
REFERENCES policy(id)
ON DELETE CASCADE;
--;;
ALTER TABLE stakeholder_technology
DROP CONSTRAINT stakeholder_technology_technology_fkey;
--;;
ALTER TABLE stakeholder_technology
ADD FOREIGN KEY (technology)
REFERENCES technology(id)
ON DELETE CASCADE;
--;;
ALTER TABLE organisation_resource
DROP CONSTRAINT organisation_resource_resource_fkey;
--;;
ALTER TABLE organisation_resource
ADD FOREIGN KEY (resource)
REFERENCES resource(id)
ON DELETE CASCADE;
--;;
ALTER TABLE organisation_event
DROP CONSTRAINT organisation_event_event_fkey;
--;;
ALTER TABLE organisation_event
ADD FOREIGN KEY (event)
REFERENCES event(id)
ON DELETE CASCADE;
--;;
ALTER TABLE organisation_initiative
DROP CONSTRAINT organisation_initiative_initiative_fkey;
--;;
ALTER TABLE organisation_initiative
ADD FOREIGN KEY (initiative)
REFERENCES initiative(id)
ON DELETE CASCADE;
--;;
ALTER TABLE organisation_policy
DROP CONSTRAINT organisation_policy_policy_fkey;
--;;
ALTER TABLE organisation_policy
ADD FOREIGN KEY (policy)
REFERENCES policy(id)
ON DELETE CASCADE;
--;;
ALTER TABLE organisation_technology
DROP CONSTRAINT organisation_technology_technology_fkey;
--;;
ALTER TABLE organisation_technology
ADD FOREIGN KEY (technology)
REFERENCES technology(id)
ON DELETE CASCADE;

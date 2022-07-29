BEGIN;
--;;
ALTER TABLE event_tag
DROP CONSTRAINT event_tag_event_fkey,
DROP CONSTRAINT event_tag_tag_fkey;
--;;
ALTER TABLE event_tag
ADD CONSTRAINT event_tag_event_fkey FOREIGN KEY (event) REFERENCES event(id) ON DELETE CASCADE,
ADD CONSTRAINT event_tag_tag_fkey FOREIGN KEY (tag) REFERENCES tag(id) ON DELETE CASCADE;
--;;
ALTER TABLE policy_tag
DROP CONSTRAINT policy_tag_policy_fkey,
DROP CONSTRAINT policy_tag_tag_fkey;
--;;
ALTER TABLE policy_tag
ADD CONSTRAINT policy_tag_policy_fkey FOREIGN KEY (policy) REFERENCES policy(id) ON DELETE CASCADE,
ADD CONSTRAINT policy_tag_tag_fkey FOREIGN KEY (tag) REFERENCES tag(id) ON DELETE CASCADE;
--;;
ALTER TABLE technology_tag
DROP CONSTRAINT technology_tag_technology_fkey,
DROP CONSTRAINT technology_tag_tag_fkey;
--;;
ALTER TABLE technology_tag
ADD CONSTRAINT technology_tag_technology_fkey FOREIGN KEY (technology) REFERENCES technology(id) ON DELETE CASCADE,
ADD CONSTRAINT technology_tag_tag_fkey FOREIGN KEY (tag) REFERENCES tag(id) ON DELETE CASCADE;
--;;
ALTER TABLE initiative_tag
DROP CONSTRAINT initiative_tag_initiative_fkey,
DROP CONSTRAINT initiative_tag_tag_fkey;
--;;
ALTER TABLE initiative_tag
ADD CONSTRAINT initiative_tag_initiative_fkey FOREIGN KEY (initiative) REFERENCES initiative(id) ON DELETE CASCADE,
ADD CONSTRAINT initiative_tag_tag_fkey FOREIGN KEY (tag) REFERENCES tag(id) ON DELETE CASCADE;
--;;
ALTER TABLE resource_tag
DROP CONSTRAINT resource_tag_resource_fkey,
DROP CONSTRAINT resource_tag_tag_fkey;
--;;
ALTER TABLE resource_tag
ADD CONSTRAINT resource_tag_resource_fkey FOREIGN KEY (resource) REFERENCES resource(id) ON DELETE CASCADE,
ADD CONSTRAINT resource_tag_tag_fkey FOREIGN KEY (tag) REFERENCES tag(id) ON DELETE CASCADE;
--;;
ALTER TABLE stakeholder_tag
DROP CONSTRAINT stakeholder_tag_stakeholder_fkey,
DROP CONSTRAINT stakeholder_tag_tag_fkey;
--;;
ALTER TABLE stakeholder_tag
ADD CONSTRAINT stakeholder_tag_stakeholder_fkey FOREIGN KEY (stakeholder) REFERENCES stakeholder(id) ON DELETE CASCADE,
ADD CONSTRAINT stakeholder_tag_tag_fkey FOREIGN KEY (tag) REFERENCES tag(id) ON DELETE CASCADE;
--;;
ALTER TABLE organisation_tag
DROP CONSTRAINT organisation_tag_organisation_fkey,
DROP CONSTRAINT organisation_tag_tag_fkey;
--;;
ALTER TABLE organisation_tag
ADD CONSTRAINT organisation_tag_organisation_fkey FOREIGN KEY (organisation) REFERENCES organisation(id) ON DELETE CASCADE,
ADD CONSTRAINT organisation_tag_tag_fkey FOREIGN KEY (tag) REFERENCES tag(id) ON DELETE CASCADE;
--;;
COMMIT;

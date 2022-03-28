BEGIN;
--;;
ALTER TABLE stakeholder_resource
DROP CONSTRAINT stakeholder_resource_stakeholder_fkey;
--;;
ALTER TABLE stakeholder_resource
ADD FOREIGN KEY (stakeholder)
REFERENCES stakeholder(id)
ON DELETE CASCADE;
--;;
ALTER TABLE stakeholder_event
DROP CONSTRAINT stakeholder_event_stakeholder_fkey;
--;;
ALTER TABLE stakeholder_event
ADD FOREIGN KEY (stakeholder)
REFERENCES stakeholder(id)
ON DELETE CASCADE;
--;;
ALTER TABLE stakeholder_initiative
DROP CONSTRAINT stakeholder_project_stakeholder_fkey;
--;;
ALTER TABLE stakeholder_initiative
ADD FOREIGN KEY (stakeholder)
REFERENCES stakeholder(id)
ON DELETE CASCADE;
--;;
ALTER TABLE stakeholder_policy
DROP CONSTRAINT stakeholder_policy_stakeholder_fkey;
--;;
ALTER TABLE stakeholder_policy
ADD FOREIGN KEY (stakeholder)
REFERENCES stakeholder(id)
ON DELETE CASCADE;
--;;
ALTER TABLE stakeholder_technology
DROP CONSTRAINT stakeholder_technology_stakeholder_fkey;
--;;
ALTER TABLE stakeholder_technology
ADD FOREIGN KEY (stakeholder)
REFERENCES stakeholder(id)
ON DELETE CASCADE;
--;;
ALTER TABLE stakeholder_stakeholder
DROP CONSTRAINT stakeholder_stakeholder_stakeholder_fkey,
DROP CONSTRAINT stakeholder_stakeholder_other_stakeholder_fkey;
--;;
ALTER TABLE stakeholder_stakeholder
ADD FOREIGN KEY (stakeholder)
REFERENCES stakeholder(id)
ON DELETE CASCADE,
ADD FOREIGN KEY (other_stakeholder)
REFERENCES stakeholder(id)
ON DELETE CASCADE;
--;;
ALTER TABLE stakeholder_organisation
DROP CONSTRAINT stakeholder_organisation_stakeholder_fkey,
DROP CONSTRAINT stakeholder_organisation_organisation_fkey;
--;;
ALTER TABLE stakeholder_organisation
ADD FOREIGN KEY (stakeholder)
REFERENCES stakeholder(id)
ON DELETE CASCADE,
ADD FOREIGN KEY(organisation)
REFERENCES organisation(id)
ON DELETE CASCADE;
--;;
ALTER TABLE organisation_resource
DROP CONSTRAINT organisation_resource_organisation_fkey;
--;;
ALTER TABLE organisation_resource
ADD FOREIGN KEY (organisation)
REFERENCES organisation(id)
ON DELETE CASCADE;
--;;
ALTER TABLE organisation_event
DROP CONSTRAINT organisation_event_organisation_fkey;
--;;
ALTER TABLE organisation_event
ADD FOREIGN KEY (organisation)
REFERENCES organisation(id)
ON DELETE CASCADE;
--;;
ALTER TABLE organisation_initiative
DROP CONSTRAINT organisation_project_organisation_fkey;
--;;
ALTER TABLE organisation_initiative
ADD FOREIGN KEY (organisation)
REFERENCES organisation(id)
ON DELETE CASCADE;
--;;
ALTER TABLE organisation_policy
DROP CONSTRAINT organisation_policy_organisation_fkey;
--;;
ALTER TABLE organisation_policy
ADD FOREIGN KEY (organisation)
REFERENCES organisation(id)
ON DELETE CASCADE;
--;;
ALTER TABLE organisation_technology
DROP CONSTRAINT organisation_technology_organisation_fkey;
--;;
ALTER TABLE organisation_technology
ADD FOREIGN KEY (organisation)
REFERENCES organisation(id)
ON DELETE CASCADE;
--;;
ALTER TABLE event
DROP CONSTRAINT event_created_by_fkey,
DROP CONSTRAINT event_approved_by_fkey;
--;;
ALTER TABLE event
ADD FOREIGN KEY (created_by)
REFERENCES stakeholder(id)
ON DELETE SET NULL,
ADD FOREIGN KEY (reviewed_by)
REFERENCES stakeholder(id)
ON DELETE SET NULL;
--;;
ALTER TABLE initiative
DROP CONSTRAINT initiative_created_by_fkey,
DROP CONSTRAINT initiative_reviewed_by_fkey;
--;;
ALTER TABLE initiative
ADD FOREIGN KEY (created_by)
REFERENCES stakeholder(id)
ON DELETE SET NULL,
ADD FOREIGN KEY (reviewed_by)
REFERENCES stakeholder(id)
ON DELETE SET NULL;
--;;
ALTER TABLE invitation
DROP CONSTRAINT invitation_organisation_fkey,
DROP CONSTRAINT invitation_stakeholder_fkey;
--;;
ALTER TABLE invitation
ADD FOREIGN KEY (stakeholder)
REFERENCES stakeholder(id)
ON DELETE CASCADE,
ADD FOREIGN KEY (organisation)
REFERENCES organisation(id)
ON DELETE CASCADE;
--;;
ALTER TABLE organisation
DROP CONSTRAINT organisation_created_by_fkey,
DROP CONSTRAINT organisation_reviewed_by_fkey,
DROP CONSTRAINT organisation_second_contact_fkey;
--;;
ALTER TABLE organisation
ADD FOREIGN KEY (created_by)
REFERENCES stakeholder(id)
ON DELETE SET NULL,
ADD FOREIGN KEY (reviewed_by)
REFERENCES stakeholder(id)
ON DELETE SET NULL,
ADD FOREIGN KEY (second_contact)
REFERENCES stakeholder(id)
ON DELETE SET NULL;
--;;
ALTER TABLE policy
DROP CONSTRAINT policy_created_by_fkey,
DROP CONSTRAINT policy_reviewed_by_fkey;
--;;
ALTER TABLE policy
ADD FOREIGN KEY (created_by)
REFERENCES stakeholder(id)
ON DELETE SET NULL,
ADD FOREIGN KEY (reviewed_by)
REFERENCES stakeholder(id)
ON DELETE SET NULL;
--;;
ALTER TABLE resource
DROP CONSTRAINT resource_created_by_fkey,
DROP CONSTRAINT resource_reviewed_by_fkey;
--;;
ALTER TABLE resource
ADD FOREIGN KEY (created_by)
REFERENCES stakeholder(id)
ON DELETE SET NULL,
ADD FOREIGN KEY (reviewed_by)
REFERENCES stakeholder(id)
ON DELETE SET NULL;
--;;
ALTER TABLE review
DROP CONSTRAINT review_assigned_by_fkey,
DROP CONSTRAINT review_reviewer_fkey;
--;;
ALTER TABLE review
ADD FOREIGN KEY (assigned_by)
REFERENCES stakeholder(id)
ON DELETE CASCADE,
ADD FOREIGN KEY (reviewer)
REFERENCES stakeholder(id)
ON DELETE CASCADE;
--;;
ALTER TABLE technology
DROP CONSTRAINT technology_created_by_fkey,
DROP CONSTRAINT technology_reviewed_by_fkey;
--;;
ALTER TABLE technology
ADD FOREIGN KEY (created_by)
REFERENCES stakeholder(id)
ON DELETE SET NULL,
ADD FOREIGN KEY (reviewed_by)
REFERENCES stakeholder(id)
ON DELETE SET NULL;
--;;
ALTER TABLE stakeholder
DROP CONSTRAINT stakeholder_reviewed_by_fkey;
--;;
ALTER TABLE stakeholder
ADD FOREIGN KEY (reviewed_by)
REFERENCES stakeholder(id)
ON DELETE SET NULL;
--;;
ALTER TABLE stakeholder_geo_coverage
DROP CONSTRAINT stakeholder_geo_coverage_stakeholder_fkey;
--;;
ALTER TABLE stakeholder_geo_coverage
ADD FOREIGN KEY (stakeholder)
REFERENCES stakeholder(id)
ON DELETE CASCADE;
--;;
ALTER TABLE organisation_geo_coverage
DROP CONSTRAINT organisation_geo_coverage_organisation_fkey;
--;;
ALTER TABLE organisation_geo_coverage
ADD FOREIGN KEY (organisation)
REFERENCES organisation(id)
ON DELETE CASCADE;
--;;
ALTER TABLE stakeholder_tag
DROP CONSTRAINT stakeholder_tag_stakeholder_fkey;
--;;
ALTER TABLE stakeholder_tag
ADD FOREIGN KEY (stakeholder)
REFERENCES stakeholder(id)
ON DELETE CASCADE;
--;;
ALTER TABLE organisation_tag
DROP CONSTRAINT organisation_tag_organisation_fkey;
--;;
ALTER TABLE organisation_tag
ADD FOREIGN KEY (organisation)
REFERENCES organisation(id)
ON DELETE CASCADE;
--;;
ALTER TABLE tag
DROP CONSTRAINT tag_reviewed_by_fkey;
--;;
ALTER TABLE tag
ADD FOREIGN KEY (reviewed_by)
REFERENCES stakeholder(id)
ON DELETE CASCADE;
--;;
ALTER TABLE topic_stakeholder_auth
DROP CONSTRAINT topic_stakeholder_auth_stakeholder_fkey;
--;;
ALTER TABLE topic_stakeholder_auth
ADD FOREIGN KEY (stakeholder)
REFERENCES stakeholder(id)
ON DELETE CASCADE;
--;;
ALTER TABLE resource_organisation
DROP CONSTRAINT resource_organisation_organisation_fkey;
--;;
ALTER TABLE resource_organisation
ADD FOREIGN KEY (organisation)
REFERENCES organisation(id)
ON DELETE SET NULL;
--;;
DROP TABLE project CASCADE;
--;;
DROP TABLE project_action;
--;;
DROP TABLE project_action_detail;
--;;
DROP TABLE project_country;
--;;
DROP TABLE project_tag;
--;;
COMMIT;

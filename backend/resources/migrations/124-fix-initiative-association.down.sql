ALTER TABLE stakeholder_initiative
RENAME TO stakeholder_project;
--;;
ALTER TABLE stakeholder_project
DROP COLUMN initiative CASCADE;
--;;
ALTER TABLE stakeholder_project
ADD COLUMN project integer NOT NULL REFERENCES project(id);
--;;
CREATE VIEW v_stakeholder_association AS
SELECT 'resource' AS topic, stakeholder, resource AS id, association::text AS association, remarks
 FROM stakeholder_resource
UNION ALL
SELECT 'event' AS topic, stakeholder, event AS id, association::text AS association, remarks
 FROM stakeholder_event
UNION ALL
SELECT 'technology' AS topic, stakeholder, technology AS id, association::text AS association, remarks
 FROM stakeholder_technology
UNION ALL
SELECT 'policy' AS topic, stakeholder, policy AS id, association::text AS association, remarks
 FROM stakeholder_policy
UNION ALL
SELECT 'project' AS topic, stakeholder, project AS id, association::text AS association, remarks
 FROM stakeholder_project;
-- ;;
ALTER TABLE organisation_initiative
RENAME TO organisation_project;
--;;
ALTER TABLE organisation_project
DROP COLUMN initiative CASCADE;
--;;
ALTER TABLE organisation_project
ADD COLUMN project integer NOT NULL REFERENCES project(id);
--;;
CREATE VIEW v_organisation_association AS
SELECT 'resource' AS topic, organisation, resource AS id, association::text AS association, remarks
 FROM organisation_resource
UNION ALL
SELECT 'event' AS topic, organisation, event AS id, association::text AS association, remarks
 FROM organisation_event
UNION ALL
SELECT 'technology' AS topic, organisation, technology AS id, association::text AS association, remarks
 FROM organisation_technology
UNION ALL
SELECT 'policy' AS topic, organisation, policy AS id, association::text AS association, remarks
 FROM organisation_policy
UNION ALL
SELECT 'project' AS topic, organisation, project AS id, association::text AS association, remarks
 FROM organisation_project;
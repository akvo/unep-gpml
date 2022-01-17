ALTER TABLE stakeholder_project
RENAME TO stakeholder_initiative;
--;;
ALTER TABLE stakeholder_initiative
DROP COLUMN project CASCADE;
--;;
ALTER TABLE stakeholder_initiative
ADD COLUMN initiative integer NOT NULL REFERENCES initiative(id);
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
SELECT 'initiative' AS topic, stakeholder, initiative AS id, association::text AS association, remarks
 FROM stakeholder_initiative;
-- ;;
ALTER TABLE organisation_project
RENAME TO organisation_initiative;
--;;
ALTER TABLE organisation_initiative
DROP COLUMN project CASCADE;
--;;
ALTER TABLE organisation_initiative
ADD COLUMN initiative integer NOT NULL REFERENCES initiative(id);
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
SELECT 'initiative' AS topic, organisation, initiative AS id, association::text AS association, remarks
 FROM organisation_initiative;
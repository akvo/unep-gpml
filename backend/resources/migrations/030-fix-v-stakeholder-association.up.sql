CREATE OR REPLACE VIEW v_stakeholder_association AS
SELECT 'resource' AS topic, stakeholder, resource AS id, association::text AS association, remarks
 FROM stakeholder_resource
UNION ALL
SELECT 'event' AS topic, stakeholder, event AS id, association::text AS association, remarks
 FROM stakeholder_event
UNION ALL
SELECT 'technology' AS topic, stakeholder, technology AS id, association::text AS association, remarks
 FROM stakeholder_technology
UNION ALL
SELECT 'stakeholder' AS topic, stakeholder, other_stakeholder AS id, association::text AS association, remarks
 FROM stakeholder_stakeholder
UNION ALL
SELECT 'policy' AS topic, stakeholder, policy AS id, association::text AS association, remarks
 FROM stakeholder_policy
UNION ALL
SELECT 'project' AS topic, stakeholder, project AS id, association::text AS association, remarks
 FROM stakeholder_project;
-- ;;

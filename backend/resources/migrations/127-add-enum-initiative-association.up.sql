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
--;;
CREATE VIEW v_stakeholder_association AS
 SELECT 'resource'::text AS topic,
    stakeholder_resource.stakeholder,
    stakeholder_resource.resource AS id,
    (stakeholder_resource.association)::text AS association,
    stakeholder_resource.remarks
   FROM stakeholder_resource
UNION ALL
 SELECT 'event'::text AS topic,
    stakeholder_event.stakeholder,
    stakeholder_event.event AS id,
    (stakeholder_event.association)::text AS association,
    stakeholder_event.remarks
   FROM stakeholder_event
UNION ALL
 SELECT 'technology'::text AS topic,
    stakeholder_technology.stakeholder,
    stakeholder_technology.technology AS id,
    (stakeholder_technology.association)::text AS association,
    stakeholder_technology.remarks
   FROM stakeholder_technology
UNION ALL
 SELECT 'policy'::text AS topic,
    stakeholder_policy.stakeholder,
    stakeholder_policy.policy AS id,
    (stakeholder_policy.association)::text AS association,
    stakeholder_policy.remarks
   FROM stakeholder_policy
UNION ALL
 SELECT 'initiative'::text AS topic,
    stakeholder_initiative.stakeholder,
    stakeholder_initiative.initiative AS id,
    (stakeholder_initiative.association)::text AS association,
    stakeholder_initiative.remarks
   FROM stakeholder_initiative;

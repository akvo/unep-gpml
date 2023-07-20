BEGIN;
--;;
--;; Application top level RBAC context
INSERT INTO rbac_context(id, context_type_name, resource_id, parent)
VALUES ('00000000-0000-0000-0000-000000000000', 'application', 0, NULL);
--;;
--;; Organisation contexts
INSERT INTO rbac_context(id, context_type_name, resource_id, parent)
SELECT uuid_generate_v4(), 'organisation', id, '00000000-0000-0000-0000-000000000000'
FROM organisation;
--;;
--;; Stakeholder contexts
INSERT INTO rbac_context(id, context_type_name, resource_id, parent)
SELECT uuid_generate_v4(), 'stakeholder', id, '00000000-0000-0000-0000-000000000000'
FROM stakeholder;
--;;
--;; Super admins (only approved users)
INSERT INTO rbac_super_admin(user_id)
SELECT id
FROM stakeholder
WHERE role = 'ADMIN' AND review_status = 'APPROVED';
--;;
--;; Event contexts
INSERT INTO rbac_context(id, context_type_name, resource_id, parent)
SELECT uuid_generate_v4(), 'event', id, '00000000-0000-0000-0000-000000000000'
FROM event
ON CONFLICT DO NOTHING;
--;;
--;; Policy contexts
INSERT INTO rbac_context(id, context_type_name, resource_id, parent)
SELECT uuid_generate_v4(), 'policy', id, '00000000-0000-0000-0000-000000000000'
FROM policy
ON CONFLICT DO NOTHING;
--;;
--;; Technology contexts
INSERT INTO rbac_context(id, context_type_name, resource_id, parent)
SELECT uuid_generate_v4(), 'technology', id, '00000000-0000-0000-0000-000000000000'
FROM technology
ON CONFLICT DO NOTHING;
--;;
--;; Resource contexts
INSERT INTO rbac_context(id, context_type_name, resource_id, parent)
SELECT uuid_generate_v4(), 'resource', id, '00000000-0000-0000-0000-000000000000'
FROM resource
ON CONFLICT DO NOTHING;
--;;
--;; Initiative contexts
INSERT INTO rbac_context(id, context_type_name, resource_id, parent)
SELECT uuid_generate_v4(), 'initiative', id, '00000000-0000-0000-0000-000000000000'
FROM initiative
ON CONFLICT DO NOTHING;
--;;
--;; Case Study contexts
INSERT INTO rbac_context(id, context_type_name, resource_id, parent)
SELECT uuid_generate_v4(), 'case-study', id, '00000000-0000-0000-0000-000000000000'
FROM case_study
ON CONFLICT DO NOTHING;
--;;
--;; Tag contexts
INSERT INTO rbac_context(id, context_type_name, resource_id, parent)
SELECT uuid_generate_v4(), 'tag', id, '00000000-0000-0000-0000-000000000000'
FROM tag;
--;;
--;; Project contexts
INSERT INTO rbac_context(id, context_type_name, resource_id, parent)
SELECT uuid_generate_v4(), 'project', id, '00000000-0000-0000-0000-000000000000'
FROM project;
--;;
--;; Event resource-owner rbac_role_assignment
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '2a06dc77-50f4-4b99-8599-54f73052775b', rc.id, s.id
FROM stakeholder s
INNER JOIN topic_stakeholder_auth tsa ON tsa.stakeholder = s.id AND tsa.topic_type = 'event'
INNER JOIN event r ON r.id = tsa.topic_id
INNER JOIN rbac_context rc ON rc.resource_id = r.id AND rc.context_type_name = 'event'
WHERE tsa.roles ??| array['owner']
GROUP BY s.id, rc.id, r.id;
--;;
--;; Event resource-owner rbac_role_assignment from stakeholder_event table
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '2a06dc77-50f4-4b99-8599-54f73052775b', rc.id, s.id
FROM stakeholder s
INNER JOIN stakeholder_event se ON se.stakeholder = s.id
INNER JOIN event r ON r.id = se.event
INNER JOIN rbac_context rc ON rc.resource_id = r.id AND rc.context_type_name = 'event'
WHERE se.association = 'owner'
GROUP BY s.id, rc.id, r.id
ON CONFLICT DO NOTHING;
--;;
--;; Event resource-editor rbac_role_assignment from stakeholder_event table
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '07b92a69-4504-44e2-ab64-ab6596730a87', rc.id, s.id
FROM stakeholder s
INNER JOIN stakeholder_event se ON se.stakeholder = s.id
INNER JOIN event r ON r.id = se.event
INNER JOIN rbac_context rc ON rc.resource_id = r.id AND rc.context_type_name = 'event'
WHERE se.association = 'resource_editor'
GROUP BY s.id, rc.id, r.id;
--;;
--;; Policy resource-owner rbac_role_assignment
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '2a06dc77-50f4-4b99-8599-54f73052775b', rc.id, s.id
FROM stakeholder s
INNER JOIN topic_stakeholder_auth tsa ON tsa.stakeholder = s.id AND tsa.topic_type = 'policy'
INNER JOIN policy r ON r.id = tsa.topic_id
INNER JOIN rbac_context rc ON rc.resource_id = r.id AND rc.context_type_name = 'policy'
WHERE tsa.roles ??| array['owner']
GROUP BY s.id, rc.id, r.id;
--;;
--;; Policy resource-owner rbac_role_assignment from stakeholder_policy table
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '2a06dc77-50f4-4b99-8599-54f73052775b', rc.id, s.id
FROM stakeholder s
INNER JOIN stakeholder_policy sp ON sp.stakeholder = s.id
INNER JOIN policy r ON r.id = sp.policy
INNER JOIN rbac_context rc ON rc.resource_id = r.id AND rc.context_type_name = 'policy'
WHERE sp.association = 'owner'
GROUP BY s.id, rc.id, r.id
ON CONFLICT DO NOTHING;
--;;
--;; Policy resource-editor rbac_role_assignment from stakeholder_policy table
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '07b92a69-4504-44e2-ab64-ab6596730a87', rc.id, s.id
FROM stakeholder s
INNER JOIN stakeholder_policy sp ON sp.stakeholder = s.id
INNER JOIN policy r ON r.id = sp.policy
INNER JOIN rbac_context rc ON rc.resource_id = r.id AND rc.context_type_name = 'policy'
WHERE sp.association = 'resource_editor'
GROUP BY s.id, rc.id, r.id;
--;;
--;; Technology resource-owner rbac_role_assignment
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '2a06dc77-50f4-4b99-8599-54f73052775b', rc.id, s.id
FROM stakeholder s
INNER JOIN topic_stakeholder_auth tsa ON tsa.stakeholder = s.id AND tsa.topic_type = 'technology'
INNER JOIN technology r ON r.id = tsa.topic_id
INNER JOIN rbac_context rc ON rc.resource_id = r.id AND rc.context_type_name = 'technology'
WHERE tsa.roles ??| array['owner']
GROUP BY s.id, rc.id, r.id;
--;;
--;; Technology resource-owner rbac_role_assignment from stakeholder_technology table
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '2a06dc77-50f4-4b99-8599-54f73052775b', rc.id, s.id
FROM stakeholder s
INNER JOIN stakeholder_technology st ON st.stakeholder = s.id
INNER JOIN technology r ON r.id = st.technology
INNER JOIN rbac_context rc ON rc.resource_id = r.id AND rc.context_type_name = 'technology'
WHERE st.association = 'owner'
GROUP BY s.id, rc.id, r.id
ON CONFLICT DO NOTHING;
--;;
--;; Technology resource-editor rbac_role_assignment from stakeholder_technology table
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '07b92a69-4504-44e2-ab64-ab6596730a87', rc.id, s.id
FROM stakeholder s
INNER JOIN stakeholder_technology st ON st.stakeholder = s.id
INNER JOIN technology r ON r.id = st.technology
INNER JOIN rbac_context rc ON rc.resource_id = r.id AND rc.context_type_name = 'technology'
WHERE st.association = 'resource_editor'
GROUP BY s.id, rc.id, r.id;
--;;
--;; Initiative resource-owner rbac_role_assignment
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '2a06dc77-50f4-4b99-8599-54f73052775b', rc.id, s.id
FROM stakeholder s
INNER JOIN topic_stakeholder_auth tsa ON tsa.stakeholder = s.id AND tsa.topic_type = 'initiative'
INNER JOIN initiative r ON r.id = tsa.topic_id
INNER JOIN rbac_context rc ON rc.resource_id = r.id AND rc.context_type_name = 'initiative'
WHERE tsa.roles ??| array['owner']
GROUP BY s.id, rc.id, r.id;
--;;
--;; Initiative resource-owner rbac_role_assignment from stakeholder_initiative table
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '2a06dc77-50f4-4b99-8599-54f73052775b', rc.id, s.id
FROM stakeholder s
INNER JOIN stakeholder_initiative si ON si.stakeholder = s.id
INNER JOIN initiative r ON r.id = si.initiative
INNER JOIN rbac_context rc ON rc.resource_id = r.id AND rc.context_type_name = 'initiative'
WHERE si.association = 'owner'
GROUP BY s.id, rc.id, r.id
ON CONFLICT DO NOTHING;
--;;
--;; Initiative resource-editor rbac_role_assignment from stakeholder_initiative table
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '07b92a69-4504-44e2-ab64-ab6596730a87', rc.id, s.id
FROM stakeholder s
INNER JOIN stakeholder_initiative si ON si.stakeholder = s.id
INNER JOIN initiative r ON r.id = si.initiative
INNER JOIN rbac_context rc ON rc.resource_id = r.id AND rc.context_type_name = 'initiative'
WHERE si.association = 'resource_editor'
GROUP BY s.id, rc.id, r.id;
--;;
--;; Resource resource-owner rbac_role_assignment
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '2a06dc77-50f4-4b99-8599-54f73052775b', rc.id, s.id
FROM stakeholder s
INNER JOIN topic_stakeholder_auth tsa ON tsa.stakeholder = s.id AND tsa.topic_type = 'resource'
INNER JOIN resource r ON r.id = tsa.topic_id
INNER JOIN rbac_context rc ON rc.resource_id = r.id AND rc.context_type_name = 'resource'
WHERE tsa.roles ??| array['owner']
GROUP BY s.id, rc.id, r.id;
--;;
--;; Resource resource-owner rbac_role_assignment from stakeholder_resource table
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '2a06dc77-50f4-4b99-8599-54f73052775b', rc.id, s.id
FROM stakeholder s
INNER JOIN stakeholder_resource sr ON sr.stakeholder = s.id
INNER JOIN resource r ON r.id = sr.resource
INNER JOIN rbac_context rc ON rc.resource_id = r.id AND rc.context_type_name = 'resource'
WHERE sr.association = 'owner'
GROUP BY s.id, rc.id, r.id
ON CONFLICT DO NOTHING;
--;;
--;; Resource resource-editor rbac_role_assignment from stakeholder_resource table
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '07b92a69-4504-44e2-ab64-ab6596730a87', rc.id, s.id
FROM stakeholder s
INNER JOIN stakeholder_resource sr ON sr.stakeholder = s.id
INNER JOIN resource r ON r.id = sr.resource
INNER JOIN rbac_context rc ON rc.resource_id = r.id AND rc.context_type_name = 'resource'
WHERE sr.association = 'resource_editor'
GROUP BY s.id, rc.id, r.id;
--;;
--;; Case Study resource-owner rbac_role_assignment
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '2a06dc77-50f4-4b99-8599-54f73052775b', rc.id, s.id
FROM stakeholder s
INNER JOIN topic_stakeholder_auth tsa ON tsa.stakeholder = s.id AND tsa.topic_type = 'case_study'
INNER JOIN case_study r ON r.id = tsa.topic_id
INNER JOIN rbac_context rc ON rc.resource_id = r.id AND rc.context_type_name = 'case-study'
WHERE tsa.roles ??| array['owner']
GROUP BY s.id, rc.id, r.id;
--;;
--;; Case Study resource-owner rbac_role_assignment from stakeholder_case_study table
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '2a06dc77-50f4-4b99-8599-54f73052775b', rc.id, s.id
FROM stakeholder s
INNER JOIN stakeholder_case_study scs ON scs.stakeholder = s.id
INNER JOIN case_study r ON r.id = scs.case_study
INNER JOIN rbac_context rc ON rc.resource_id = r.id AND rc.context_type_name = 'case-study'
WHERE scs.association = 'owner'
GROUP BY s.id, rc.id, r.id
ON CONFLICT DO NOTHING;
--;;
--;; Case Study resource-editor rbac_role_assignment from stakeholder_case_study table
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '07b92a69-4504-44e2-ab64-ab6596730a87', rc.id, s.id
FROM stakeholder s
INNER JOIN stakeholder_case_study scs ON scs.stakeholder = s.id
INNER JOIN case_study r ON r.id = scs.case_study
INNER JOIN rbac_context rc ON rc.resource_id = r.id AND rc.context_type_name = 'case-study'
WHERE scs.association = 'resource_editor'
GROUP BY s.id, rc.id, r.id;
--;;
--;; Project resource-owner rbac_role_assignment from project table
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '2a06dc77-50f4-4b99-8599-54f73052775b', rc.id, s.id
FROM stakeholder s
INNER JOIN project p ON p.stakeholder_id = s.id
INNER JOIN rbac_context rc ON rc.resource_id = p.id AND rc.context_type_name = 'project'
GROUP BY s.id, rc.id, p.id;
--;;
--;; Stakeholder approved-user rbac_role_assignment
--;; Regardless of being super admins all the approved users should have this role, in case at some point they stop
--;; being super-admins.
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '2ecb82a5-5aff-47ba-8889-5cfdc3199550', '00000000-0000-0000-0000-000000000000', id
FROM stakeholder
WHERE review_status = 'APPROVED';
--;;
--;; Stakeholder unapproved-user rbac_role_assignment
--;; In this case, it does not make sense super admins have this role, since they could only be rejected once
--;; they have been approved, so they will never go back to `submitted`.
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '6fd14e4b-4b52-4264-98d0-394e225829e0', '00000000-0000-0000-0000-000000000000', id
FROM stakeholder
WHERE review_status = 'SUBMITTED' AND role != 'ADMIN';
--;;
--;; resource-reviewer role assignments
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '10ee926b-cf5c-44eb-82b9-e4c3d283aff1', rc.id, s.id
FROM stakeholder s
INNER JOIN review re ON re.reviewer = s.id
INNER JOIN rbac_context rc ON rc.resource_id = re.topic_id AND rc.context_type_name::topic_type = re.topic_type
WHERE re.topic_type != 'non_member_organisation' AND rc.context_type_name NOT IN ('application', 'project', 'comment')
GROUP BY s.id, rc.id, re.id;
--;;
--;; resource-reviewer role assigments for non member orgs
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '10ee926b-cf5c-44eb-82b9-e4c3d283aff1', rc.id, s.id
FROM stakeholder s
INNER JOIN review re ON re.reviewer = s.id
INNER JOIN rbac_context rc ON rc.resource_id = re.topic_id AND rc.context_type_name = 'organisation'
WHERE re.topic_type = 'non_member_organisation'
GROUP BY s.id, rc.id, re.id;
--;;
--;; organisation_resource resource-owner permission inheritance
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '2a06dc77-50f4-4b99-8599-54f73052775b', rc.id, tsa.stakeholder
FROM organisation_resource orgr
INNER JOIN topic_stakeholder_auth tsa ON orgr.organisation = tsa.topic_id AND tsa.topic_type = 'organisation'
INNER JOIN rbac_context rc ON rc.resource_id = orgr.resource AND rc.context_type_name = 'resource'
WHERE orgr.association = 'owner' AND tsa.roles ??| array['focal-point', 'owner'];
--;;
--;; add focal-point associations to organisation_resource
INSERT INTO stakeholder_organisation (stakeholder, organisation, association)
SELECT tsa.stakeholder, orgr.organisation, 'focal-point'
FROM organisation_resource orgr
INNER JOIN topic_stakeholder_auth tsa ON orgr.organisation = topic_id AND topic_type = 'organisation'
INNER JOIN rbac_context rc ON rc.resource_id = orgr.resource AND rc.context_type_name = 'resource'
WHERE orgr.association = 'owner' AND tsa.roles ??| array['focal-point', 'owner'];
--;;
--;; organisation_event resource-owner permission inheritance
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '2a06dc77-50f4-4b99-8599-54f73052775b', rc.id, tsa.stakeholder
FROM organisation_event orge
INNER JOIN topic_stakeholder_auth tsa ON orge.organisation = tsa.topic_id AND tsa.topic_type = 'organisation'
INNER JOIN rbac_context rc ON rc.resource_id = orge.event AND rc.context_type_name = 'event'
WHERE orge.association = 'owner' AND tsa.roles ??| array['focal-point', 'owner'];
--;;
--;; add focal-point associations to organisation_event
INSERT INTO stakeholder_organisation (stakeholder, organisation, association)
SELECT tsa.stakeholder, orge.organisation, 'focal-point'
FROM organisation_event orge
INNER JOIN topic_stakeholder_auth tsa ON orge.organisation = tsa.topic_id AND tsa.topic_type = 'organisation'
INNER JOIN rbac_context rc ON rc.resource_id = orge.event AND rc.context_type_name = 'event'
WHERE orge.association = 'owner' AND tsa.roles ??| array['focal-point', 'owner'];
--;;
--;; organisation_initiative resource-owner permission inheritance
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '2a06dc77-50f4-4b99-8599-54f73052775b', rc.id, tsa.stakeholder
FROM organisation_initiative orgi
INNER JOIN topic_stakeholder_auth tsa ON orgi.organisation = tsa.topic_id AND tsa.topic_type = 'organisation'
INNER JOIN rbac_context rc ON rc.resource_id = orgi.initiative AND rc.context_type_name = 'initiative'
WHERE orgi.association = 'owner' AND tsa.roles ??| array['focal-point', 'owner'];
--;;
--;; add focal-point associations to organisation_initiative
INSERT INTO stakeholder_organisation (stakeholder, organisation, association)
SELECT tsa.stakeholder, orgi.organisation, 'focal-point'
FROM organisation_initiative orgi
INNER JOIN topic_stakeholder_auth tsa ON orgi.organisation = tsa.topic_id AND tsa.topic_type = 'organisation'
INNER JOIN rbac_context rc ON rc.resource_id = orgi.initiative AND rc.context_type_name = 'initiative'
WHERE orgi.association = 'owner' AND tsa.roles ??| array['focal-point', 'owner'];
--;;
--;; organisation_technology resource-owner permission inheritance
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '2a06dc77-50f4-4b99-8599-54f73052775b', rc.id, tsa.stakeholder
FROM organisation_technology orgt
INNER JOIN topic_stakeholder_auth tsa ON orgt.organisation = tsa.topic_id AND tsa.topic_type = 'organisation'
INNER JOIN rbac_context rc ON rc.resource_id = orgt.technology AND rc.context_type_name = 'technology'
WHERE orgt.association = 'owner' AND tsa.roles ??| array['focal-point', 'owner'];
--;;
--;; add focal-point associations to organisation_technology
INSERT INTO stakeholder_organisation (stakeholder, organisation, association)
SELECT tsa.stakeholder, orgt.organisation, 'focal-point'
FROM organisation_technology orgt
INNER JOIN topic_stakeholder_auth tsa ON orgt.organisation = tsa.topic_id AND tsa.topic_type = 'organisation'
INNER JOIN rbac_context rc ON rc.resource_id = orgt.technology AND rc.context_type_name = 'technology'
WHERE orgt.association = 'owner' AND tsa.roles ??| array['focal-point', 'owner'];
--;;
--;; organisation_policy resource-owner permission inheritance
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '2a06dc77-50f4-4b99-8599-54f73052775b', rc.id, tsa.stakeholder
FROM organisation_policy orgp
INNER JOIN topic_stakeholder_auth tsa ON orgp.organisation = tsa.topic_id AND tsa.topic_type = 'organisation'
INNER JOIN rbac_context rc ON rc.resource_id = orgp.policy AND rc.context_type_name = 'policy'
WHERE orgp.association = 'owner' AND tsa.roles ??| array['focal-point', 'owner'];
--;;
--;; add focal-point associations to organisation_policy
INSERT INTO stakeholder_organisation (stakeholder, organisation, association)
SELECT tsa.stakeholder, orgp.organisation, 'focal-point'
FROM organisation_policy orgp
INNER JOIN topic_stakeholder_auth tsa ON orgp.organisation = tsa.topic_id AND tsa.topic_type = 'organisation'
INNER JOIN rbac_context rc ON rc.resource_id = orgp.policy AND rc.context_type_name = 'policy'
WHERE orgp.association = 'owner' AND tsa.roles ??| array['focal-point', 'owner'];
--;;
--;; organisation_case_study resource-owner permission inheritance
INSERT INTO rbac_role_assignment(role_id, context_id, user_id)
SELECT '2a06dc77-50f4-4b99-8599-54f73052775b', rc.id, tsa.stakeholder
FROM organisation_case_study orgcs
INNER JOIN topic_stakeholder_auth tsa ON orgcs.organisation = tsa.topic_id AND tsa.topic_type = 'organisation'
INNER JOIN rbac_context rc ON rc.resource_id = orgcs.case_study AND rc.context_type_name = 'case_study'
WHERE orgcs.association = 'owner' AND tsa.roles ??| array['focal-point', 'owner'];
--;;
--;; add focal-point associations to organisation_case_study
INSERT INTO stakeholder_organisation (stakeholder, organisation, association)
SELECT tsa.stakeholder, orgcs.organisation, 'focal-point'
FROM organisation_case_study orgcs
INNER JOIN topic_stakeholder_auth tsa ON orgcs.organisation = tsa.topic_id AND tsa.topic_type = 'organisation'
INNER JOIN rbac_context rc ON rc.resource_id = orgcs.case_study AND rc.context_type_name = 'case_study'
WHERE orgcs.association = 'owner' AND tsa.roles ??| array['focal-point', 'owner'];
--;;
COMMIT;

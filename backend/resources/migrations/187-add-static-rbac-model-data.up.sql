BEGIN;
--;;
--;; RBAC CONTEXT TYPES
INSERT INTO rbac_context_type (
    name,
    description)
VALUES (
    'application',
    'General application-level context type'),
(
    'organisation',
    'Organisation-level context type'),
(
    'stakeholder',
    'Stakeholder-level context type'),
(
    'event',
    'Event-level context type'),
(
    'policy',
    'Policy-level context type'),
(
    'technology',
    'Technology-level context type'),
(
    'resource',
    'Resource-level context type (action plan, financial resource and so on)'),
(
    'project',
    'Project-level context type'),
(
    'case-study',
    'Case study-level context type'),
(
    'initiative',
    'Initiative-level context type'),
(
    'tag',
    'Tag-level context type');
--;;
INSERT INTO rbac_permission (
    id,
    name,
    description,
    context_type_name)
VALUES (
    'c093bb0b-8ee4-46d4-a7ec-5a7c7f909cce',
    'application/create-event',
    'Allows creating a new event',
    'application'),
(
    'eb6c20c3-3536-4cf2-a748-429f59db9945',
    'application/create-policy',
    'Allows creating a new policy',
    'application'),
(
    'a736336e-d7d5-4af7-8cd3-8d9fc9c50097',
    'application/create-technology',
    'Allows creating a new technology',
    'application'),
(
    '94a15ea3-a4d5-4dfd-99c0-78134750389d',
    'application/create-project',
    'Allows creating a new project',
    'application'),
(
    '90946fcc-ea08-468e-a21b-542c0429e54b',
    'application/create-resource',
    'Allows creating a “resource',
    'application'),
(
    '08db1c51-fbe9-4333-b8bb-eb42b918ef26',
    'application/create-case-study',
    'Allows creating a new case_study',
    'application'),
(
    '15878911-1ab0-4dc9-8e11-2a764f0b789e',
    'application/create-initiative',
    'Allows creating a new initiative',
    'application'),
(
    'ac1a1be3-449d-41da-96c3-79e73ac67849',
    'application/create-organisation',
    'Allows creating a new organisation (programmatic)',
    'application'),
(
    '710aa378-fd14-4ba2-bc57-8078e0dc96ab',
    'application/suggest-experts',
    'Allows sending an email with suggested experts info to gpml admin',
    'application'),
(
    '8edd1935-5359-4256-a9c3-ca1186dfb13b',
    'application/read-activities',
    'Read activities',
    'application'),
(
    'cefc99d6-aaf3-420c-a153-605dd41b5cff',
    'application/run-brs-importer',
    'Allows running BRS-integration related importing task',
    'application'),
(
    'f22c1ab3-756d-452c-b165-c7a17a8466ea',
    'application/run-leap-importer',
    'Allows running LEAP-integration related importing task',
    'application'),
(
    'ae83ec32-e2cc-4572-987c-489f80e08db8',
    'application/create-country-states',
    'Allows creating new country states (programatic)',
    'application'),
(
    'a1e5b774-ab34-4552-821a-50bf7ed487d2',
    'application/create-comment',
    'Allows creating a new comment',
    'application'),
(
    'd6e94e45-52c1-4f85-ac8c-9e2c56551ec8',
    'application/read-suggested-profiles',
    'Allows reading suggested profiles data',
    'application'),
(
    '31767296-c109-464e-806f-522ab9501893',
    'organisation/read',
    'Allows reading organisation data',
    'organisation'),
(
    'e73f86ad-c0db-4eb1-99a7-123c45a1230a',
    'organisation/update',
    'Allows editing an organisation',
    'organisation'),
(
    'b23c0b80-b3e5-455a-95ad-f3cc97d53a89',
    'organisation/delete',
    'Allows deleting an organisation',
    'organisation'),
(
    'a3e7f7ec-faea-4287-b1cc-9a5b47054450',
    'organisation/review',
    'Allows reviewing an organisation',
    'organisation'),
(
    'd0be4256-35fe-483e-adf0-254381018884',
    'stakeholder/read',
    'Allows reading stakeholder data',
    'stakeholder'),
(
    'aa110699-ac08-4516-bf4e-5e68e035f7c0',
    'stakeholder/update',
    'Allows updating a stakeholder',
    'stakeholder'),
(
    '75502ce6-5fc3-424d-8327-6f1b25a1f718',
    'stakeholder/delete',
    'Allows deleting a stakeholder',
    'stakeholder'),
(
    'a188d7c6-67ed-409b-ab4c-511612c07ab6',
    'stakeholder/review',
    'Allows reviewing a stakeholder',
    'stakeholder'),
(
    '7e609ca4-ef45-4a70-a313-169eaf1f7838',
    'stakeholder/accept-invitation',
    'Allows a stakeholder to be approved',
    'stakeholder'),
(
    '443bc659-d508-4d35-b992-43736f2f21a2',
    'event/update',
    'Allows updating an event',
    'event'),
(
    'fe4de643-44c6-4ec4-ad3a-07da5b57b002',
    'event/delete',
    'Allows deleting an event',
    'event'),
(
    'b5b632dd-5e1a-442f-8583-fd317268d623',
    'event/review',
    'Allows reviewing an event',
    'event'),
(
    'e33e6769-0572-4d8b-800f-7fe8c762d756',
    'event/bookmark',
    'Allows bookmarking a event',
    'event'),
(
    'bed4b800-d125-453b-9d57-dd3634c7fc42',
    'policy/update',
    'Allows updating a policy',
    'policy'),
(
    'fbd732f0-3b3d-4c6f-bdbc-70423694836d',
    'policy/delete',
    'Allows deleting a policy',
    'policy'),
(
    '250b4fc3-2a1e-454c-ab15-c281a75f8644',
    'policy/review',
    'Allows reviewing a policy',
    'policy'),
(
    '2c72189e-4df8-4094-bda5-46ef1966e881',
    'policy/bookmark',
    'Allows bookmarking a policy',
    'policy'),
(
    'ca62191f-9bdc-453f-b4cf-0c5b9875ba05',
    'technology/update',
    'Allows updating a technology',
    'technology'),
(
    'b59917ca-2ef9-41bb-86a6-956290406032',
    'technology/delete',
    'Allows deleting a technology',
    'technology'),
(
    'd01d1eeb-b304-4e4a-8c89-4a6a360fd239',
    'technology/review',
    'Allows reviewing a technology',
    'technology'),
(
    '75aee8ec-2e7c-4db3-9501-48476ccba1c4',
    'technology/bookmark',
    'Allows bookmarking a technology',
    'technology'),
(
    '7bc64778-0eb4-453a-837c-f6545d72e1f7',
    'resource/update',
    'Allows updating a resource',
    'resource'),
(
    'd96a5194-8f82-46b7-9c1f-a9dff39a9f54',
    'resource/delete',
    'Allows deleting a resource',
    'resource'),
(
    '64abcee5-8a7a-4fa4-b526-0a156c6a6035',
    'resource/review',
    'Allows reviewing a resource',
    'resource'),
(
    '4d4e52ca-11a8-408a-87a2-525577909658',
    'resource/bookmark',
    'Allows bookmarking a resource',
    'resource'),
(
    'd3423859-9091-4b5d-a753-7685dbafbe12',
    'initiative/update',
    'Allows updating an initiative',
    'initiative'),
(
    'cf17b3e0-6f10-45a7-a324-c43cfbbac75c',
    'initiative/delete',
    'Allows deleting an initiative',
    'initiative'),
(
    '2d41d51d-1d19-4b32-8b24-7e49d0e0be40',
    'initiative/review',
    'Allows reviewing an initiative',
    'initiative'),
(
    '35d3b83d-f465-49a8-845c-2c4bd271cfe5',
    'initiative/bookmark',
    'Allows bookmark an initiative',
    'initiative'),
(
    'b28a3fdb-80fc-47d5-8bb1-724be9b11f50',
    'project/update',
    'Allows updating a project',
    'project'),
(
    '4ad5d85c-4cf1-4011-82aa-78dd3be68a23',
    'project/delete',
    'Allows deleting a project',
    'project'),
(
    '3ca356ac-a64a-42c9-be95-4898a7f47978',
    'project/review',
    'Allows reviewing a project',
    'project'),
(
    '1cb8f41d-d37f-4564-bcad-80e0ceff5406',
    'project/bookmark',
    'Allows bookmarking a project',
    'project'),
(
    '934fa824-229e-4fe3-8c73-f4de4ce69eba',
    'project/read',
    'Allows reading the information of a project',
    'project'),
(
    'be3a9fc5-d0e5-4c34-949e-d81f93506b9a',
    'case-study/update',
    'Allows updating a case study',
    'case-study'),
(
    '181eb01d-be82-4e4b-9a35-88a89daf2031',
    'case-study/delete',
    'Allows deleting a case study',
    'case-study'),
(
    'f17e0b53-8bb9-4537-9261-c66d80714765',
    'case-study/review',
    'Allows reviewing a case study',
    'case-study'),
(
    'd4a80431-de1f-4c97-9824-7249ea7a7a50',
    'case-study/bookmark',
    'Allows bookmarking a case study',
    'case-study'),
(
    '7fac407c-f16f-4579-8bea-3f98474e6ad4',
    'tag/review',
    'Allows reviewing a tag',
    'tag');
--;;
INSERT INTO rbac_role (
    id,
    name,
    description)
VALUES (
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    'approved-user',
    'Approved and registered user'),
(
    '10ee926b-cf5c-44eb-82b9-e4c3d283aff1',
    'resource-reviewer',
    'Reviewer of any resource'),
(
    '2a06dc77-50f4-4b99-8599-54f73052775b',
    'resource-owner',
    'The owner of a resource'),
(
    '6fd14e4b-4b52-4264-98d0-394e225829e0',
    'unapproved-user',
    'Registered but not approved user (pending or so)'),
(
    '07b92a69-4504-44e2-ab64-ab6596730a87',
    'resource-editor',
    'Editor of a resource');
--;;
INSERT INTO rbac_role_permission (
    role_id,
    permission_id,
    permission_value)
VALUES (
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    'c093bb0b-8ee4-46d4-a7ec-5a7c7f909cce',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    'eb6c20c3-3536-4cf2-a748-429f59db9945',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    'a736336e-d7d5-4af7-8cd3-8d9fc9c50097',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    '94a15ea3-a4d5-4dfd-99c0-78134750389d',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    '90946fcc-ea08-468e-a21b-542c0429e54b',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    '08db1c51-fbe9-4333-b8bb-eb42b918ef26',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    '15878911-1ab0-4dc9-8e11-2a764f0b789e',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    'a1e5b774-ab34-4552-821a-50bf7ed487d2',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    'ac1a1be3-449d-41da-96c3-79e73ac67849',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    '8edd1935-5359-4256-a9c3-ca1186dfb13b',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    '710aa378-fd14-4ba2-bc57-8078e0dc96ab',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    '31767296-c109-464e-806f-522ab9501893',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    'd0be4256-35fe-483e-adf0-254381018884',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    'e33e6769-0572-4d8b-800f-7fe8c762d756',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    '2c72189e-4df8-4094-bda5-46ef1966e881',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    '75aee8ec-2e7c-4db3-9501-48476ccba1c4',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    '4d4e52ca-11a8-408a-87a2-525577909658',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    '35d3b83d-f465-49a8-845c-2c4bd271cfe5',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    '1cb8f41d-d37f-4564-bcad-80e0ceff5406',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    'd4a80431-de1f-4c97-9824-7249ea7a7a50',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    'd6e94e45-52c1-4f85-ac8c-9e2c56551ec8',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    '934fa824-229e-4fe3-8c73-f4de4ce69eba',
    1),
(
    '10ee926b-cf5c-44eb-82b9-e4c3d283aff1',
    'a3e7f7ec-faea-4287-b1cc-9a5b47054450',
    1),
(
    '10ee926b-cf5c-44eb-82b9-e4c3d283aff1',
    'a188d7c6-67ed-409b-ab4c-511612c07ab6',
    1),
(
    '10ee926b-cf5c-44eb-82b9-e4c3d283aff1',
    'b5b632dd-5e1a-442f-8583-fd317268d623',
    1),
(
    '10ee926b-cf5c-44eb-82b9-e4c3d283aff1',
    '250b4fc3-2a1e-454c-ab15-c281a75f8644',
    1),
(
    '10ee926b-cf5c-44eb-82b9-e4c3d283aff1',
    'd01d1eeb-b304-4e4a-8c89-4a6a360fd239',
    1),
(
    '10ee926b-cf5c-44eb-82b9-e4c3d283aff1',
    '64abcee5-8a7a-4fa4-b526-0a156c6a6035',
    1),
(
    '10ee926b-cf5c-44eb-82b9-e4c3d283aff1',
    '2d41d51d-1d19-4b32-8b24-7e49d0e0be40',
    1),
(
    '10ee926b-cf5c-44eb-82b9-e4c3d283aff1',
    '3ca356ac-a64a-42c9-be95-4898a7f47978',
    1),
(
    '10ee926b-cf5c-44eb-82b9-e4c3d283aff1',
    'f17e0b53-8bb9-4537-9261-c66d80714765',
    1),
(
    '10ee926b-cf5c-44eb-82b9-e4c3d283aff1',
    '7fac407c-f16f-4579-8bea-3f98474e6ad4',
    1),
(
    '2a06dc77-50f4-4b99-8599-54f73052775b',
    '443bc659-d508-4d35-b992-43736f2f21a2',
    1),
(
    '2a06dc77-50f4-4b99-8599-54f73052775b',
    'fe4de643-44c6-4ec4-ad3a-07da5b57b002',
    1),
(
    '2a06dc77-50f4-4b99-8599-54f73052775b',
    'bed4b800-d125-453b-9d57-dd3634c7fc42',
    1),
(
    '2a06dc77-50f4-4b99-8599-54f73052775b',
    'fbd732f0-3b3d-4c6f-bdbc-70423694836d',
    1),
(
    '2a06dc77-50f4-4b99-8599-54f73052775b',
    'ca62191f-9bdc-453f-b4cf-0c5b9875ba05',
    1),
(
    '2a06dc77-50f4-4b99-8599-54f73052775b',
    'b59917ca-2ef9-41bb-86a6-956290406032',
    1),
(
    '2a06dc77-50f4-4b99-8599-54f73052775b',
    '7bc64778-0eb4-453a-837c-f6545d72e1f7',
    1),
(
    '2a06dc77-50f4-4b99-8599-54f73052775b',
    'd96a5194-8f82-46b7-9c1f-a9dff39a9f54',
    1),
(
    '2a06dc77-50f4-4b99-8599-54f73052775b',
    'd3423859-9091-4b5d-a753-7685dbafbe12',
    1),
(
    '2a06dc77-50f4-4b99-8599-54f73052775b',
    'cf17b3e0-6f10-45a7-a324-c43cfbbac75c',
    1),
(
    '2a06dc77-50f4-4b99-8599-54f73052775b',
    'b28a3fdb-80fc-47d5-8bb1-724be9b11f50',
    1),
(
    '2a06dc77-50f4-4b99-8599-54f73052775b',
    '4ad5d85c-4cf1-4011-82aa-78dd3be68a23',
    1),
(
    '2a06dc77-50f4-4b99-8599-54f73052775b',
    'be3a9fc5-d0e5-4c34-949e-d81f93506b9a',
    1),
(
    '2a06dc77-50f4-4b99-8599-54f73052775b',
    '181eb01d-be82-4e4b-9a35-88a89daf2031',
    1),
(
    '2a06dc77-50f4-4b99-8599-54f73052775b',
    'aa110699-ac08-4516-bf4e-5e68e035f7c0',
    1),
(
    '2a06dc77-50f4-4b99-8599-54f73052775b',
    'e73f86ad-c0db-4eb1-99a7-123c45a1230a',
    1),
(
    '6fd14e4b-4b52-4264-98d0-394e225829e0',
    'aa110699-ac08-4516-bf4e-5e68e035f7c0',
    1),
(
    '6fd14e4b-4b52-4264-98d0-394e225829e0',
    'e73f86ad-c0db-4eb1-99a7-123c45a1230a',
    1),
(
    '6fd14e4b-4b52-4264-98d0-394e225829e0',
    'ac1a1be3-449d-41da-96c3-79e73ac67849',
    1),
(
    '6fd14e4b-4b52-4264-98d0-394e225829e0',
    '7e609ca4-ef45-4a70-a313-169eaf1f7838',
    1),
(
    '07b92a69-4504-44e2-ab64-ab6596730a87',
    '443bc659-d508-4d35-b992-43736f2f21a2',
    1),
(
    '07b92a69-4504-44e2-ab64-ab6596730a87',
    'bed4b800-d125-453b-9d57-dd3634c7fc42',
    1),
(
    '07b92a69-4504-44e2-ab64-ab6596730a87',
    'ca62191f-9bdc-453f-b4cf-0c5b9875ba05',
    1),
(
    '07b92a69-4504-44e2-ab64-ab6596730a87',
    '7bc64778-0eb4-453a-837c-f6545d72e1f7',
    1),
(
    '07b92a69-4504-44e2-ab64-ab6596730a87',
    'd3423859-9091-4b5d-a753-7685dbafbe12',
    1),
(
    '07b92a69-4504-44e2-ab64-ab6596730a87',
    'b28a3fdb-80fc-47d5-8bb1-724be9b11f50',
    1),
(
    '07b92a69-4504-44e2-ab64-ab6596730a87',
    'be3a9fc5-d0e5-4c34-949e-d81f93506b9a',
    1);
--;;
COMMIT;

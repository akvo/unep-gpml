BEGIN;
--;;
CREATE TABLE plastic_strategy (
    id SERIAL PRIMARY KEY,
    country_id INTEGER UNIQUE NOT NULL REFERENCES country (id),
    steps JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    last_updated_at TIMESTAMP WITHOUT TIME ZONE
);
--;;
CREATE TYPE plastic_strategy_team_type AS ENUM (
    'steering-committee',
    'project-team'
);
--;;
CREATE TYPE plastic_strategy_team_role AS ENUM (
    'admin',
    'editor',
    'viewer'
);
--;;
CREATE TABLE plastic_strategy_team_member (
    plastic_strategy_id INTEGER NOT NULL REFERENCES plastic_strategy (id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES stakeholder (id) ON DELETE CASCADE,
    teams PLASTIC_STRATEGY_TEAM_TYPE[] NOT NULL,
    role PLASTIC_STRATEGY_TEAM_ROLE NOT NULL,
    last_updated_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT plastic_strategy_team_pkey PRIMARY KEY (plastic_strategy_id, user_id)
);
--;;
CREATE TABLE plastic_strategy_initiative_bookmark (
    plastic_strategy_id INTEGER NOT NULL REFERENCES plastic_strategy (id),
    initiative_id INTEGER NOT NULL REFERENCES initiative (id),
    CONSTRAINT plastic_strategy_initiative_bookmark_pkey PRIMARY KEY (plastic_strategy_id, initiative_id)
);
--;;
CREATE TABLE plastic_strategy_case_study_bookmark (
    plastic_strategy_id INTEGER NOT NULL REFERENCES plastic_strategy (id),
    case_study_id INTEGER NOT NULL REFERENCES case_study (id),
    CONSTRAINT plastic_strategy_case_study_bookmark_pkey PRIMARY KEY (plastic_strategy_id, case_study_id)
);
--;;
CREATE TABLE plastic_strategy_technology_bookmark (
    plastic_strategy_id INTEGER NOT NULL REFERENCES plastic_strategy (id),
    technology_id INTEGER NOT NULL REFERENCES technology (id),
    CONSTRAINT plastic_strategy_technology_bookmark_pkey PRIMARY KEY (plastic_strategy_id, technology_id)
);
--;;
CREATE TABLE plastic_strategy_policy_bookmark (
    plastic_strategy_id INTEGER NOT NULL REFERENCES plastic_strategy (id),
    policy_id INTEGER NOT NULL REFERENCES POLICY (id), CONSTRAINT plastic_strategy_policy_bookmark_pkey PRIMARY KEY (plastic_strategy_id, policy_id));
--;;
CREATE TABLE plastic_strategy_event_bookmark (
    plastic_strategy_id INTEGER NOT NULL REFERENCES plastic_strategy (id),
    event_id INTEGER NOT NULL REFERENCES event (id),
    CONSTRAINT plastic_strategy_event_bookmark_pkey PRIMARY KEY (plastic_strategy_id, event_id)
);
--;;
CREATE TABLE plastic_strategy_resource_bookmark (
    plastic_strategy_id INTEGER NOT NULL REFERENCES plastic_strategy (id),
    resource_id INTEGER NOT NULL REFERENCES resource (id),
    CONSTRAINT plastic_strategy_resource_bookmark_pkey PRIMARY KEY (plastic_strategy_id, resource_id)
);
--;;
CREATE TABLE plastic_strategy_organisation_bookmark (
    plastic_strategy_id INTEGER NOT NULL REFERENCES plastic_strategy (id),
    organisation_id INTEGER NOT NULL REFERENCES organisation (id),
    CONSTRAINT plastic_strategy_organisation_bookmark_pkey PRIMARY KEY (plastic_strategy_id, organisation_id)
);
--;;
INSERT INTO rbac_context_type (
    name,
    description)
VALUES (
    'plastic-strategy',
    'Plastic strategy-level context type');
--;;
INSERT INTO rbac_permission (
    id,
    name,
    description,
    context_type_name)
VALUES (
    'd7bb3d25-e8b7-4311-a6a1-c96855b35081',
    'application/list-plastic-strategies',
    'Allows listing plastic strategies',
    'application'),
(
    '7298e9b0-8632-475b-b116-7ab26969d1a0',
    'plastic-strategy/read',
    'Allows viewing a plastic strategy',
    'plastic-strategy'),
(
    'b0e1db85-96d7-440f-a374-fd76f4088cb3',
    'plastic-strategy/bookmark',
    'Allows bookmarking platform resource for a plastic strategy',
    'plastic-strategy'),
(
    '4a841fba-ebb1-41a8-85d8-b02e77708e8e',
    'plastic-strategy/mark-step-as-completed',
    'Allows marking a step as completed',
    'plastic-strategy'),
(
    'fe3afc8c-5db6-4ab6-9223-f74a9fee906e',
    'plastic-strategy/edit-group',
    'Allows editing plastic strategy groups',
    'plastic-strategy');
--;;
INSERT INTO rbac_role (
    id,
    name,
    description)
VALUES (
    '5422d5a9-89b4-494d-97a1-894657047803',
    'plastic-strategy-admin',
    'Plastic strategy admin'),
(
    '982889c1-368c-489c-b8f4-234802e0781d',
    'plastic-strategy-editor',
    'Plastic strategy editor'),
(
    '4c953c83-bc6e-41a0-bde7-d25a6a938a3c',
    'plastic-strategy-viewer',
    'Plastic strategy viewer');
--;;
INSERT INTO rbac_role_permission (
    role_id,
    permission_id,
    permission_value)
VALUES (
    '5422d5a9-89b4-494d-97a1-894657047803',
    'd7bb3d25-e8b7-4311-a6a1-c96855b35081',
    1),
(
    '5422d5a9-89b4-494d-97a1-894657047803',
    '7298e9b0-8632-475b-b116-7ab26969d1a0',
    1),
(
    '5422d5a9-89b4-494d-97a1-894657047803',
    'b0e1db85-96d7-440f-a374-fd76f4088cb3',
    1),
(
    '5422d5a9-89b4-494d-97a1-894657047803',
    '4a841fba-ebb1-41a8-85d8-b02e77708e8e',
    1),
(
    '5422d5a9-89b4-494d-97a1-894657047803',
    'fe3afc8c-5db6-4ab6-9223-f74a9fee906e',
    1),
(
    '982889c1-368c-489c-b8f4-234802e0781d',
    'd7bb3d25-e8b7-4311-a6a1-c96855b35081',
    1),
(
    '982889c1-368c-489c-b8f4-234802e0781d',
    '7298e9b0-8632-475b-b116-7ab26969d1a0',
    1),
(
    '982889c1-368c-489c-b8f4-234802e0781d',
    'b0e1db85-96d7-440f-a374-fd76f4088cb3',
    1),
(
    '982889c1-368c-489c-b8f4-234802e0781d',
    '4a841fba-ebb1-41a8-85d8-b02e77708e8e',
    1),
(
    '982889c1-368c-489c-b8f4-234802e0781d',
    'fe3afc8c-5db6-4ab6-9223-f74a9fee906e',
    1),
(
    '4c953c83-bc6e-41a0-bde7-d25a6a938a3c',
    '7298e9b0-8632-475b-b116-7ab26969d1a0',
    1);
--;;
COMMIT;

BEGIN;
--;;
CREATE TABLE plastic_strategy_file (
    plastic_strategy_id INTEGER NOT NULL REFERENCES plastic_strategy (id),
    file_id UUID NOT NULL REFERENCES file (id),
    section_key TEXT NOT NULL,
    CONSTRAINT plastic_strategy_file_pkey PRIMARY KEY (plastic_strategy_id, file_id, section_key)
);
--;;
INSERT INTO rbac_permission (
    id,
    name,
    description,
    context_type_name)
VALUES (
    'c61a269f-68fc-4386-b354-a66b9b921650',
    'plastic-strategy/create-file',
    'Allows creating a plastic strategy file',
    'plastic-strategy'),
(
    'bd5c06a0-43a9-4708-b744-8798024b8ad4',
    'plastic-strategy/delete-file',
    'Allows deleting a plastic strategy file',
    'plastic-strategy'),
(
    '49f91a23-d338-40e6-8cdd-e89065bce617',
    'plastic-strategy/list-files',
    'Allows listing a plastic strategy files',
    'plastic-strategy');
--;;
INSERT INTO rbac_role_permission (
    role_id,
    permission_id,
    permission_value)
VALUES (
    '5422d5a9-89b4-494d-97a1-894657047803',
    'c61a269f-68fc-4386-b354-a66b9b921650',
    1),
(
    '5422d5a9-89b4-494d-97a1-894657047803',
    'bd5c06a0-43a9-4708-b744-8798024b8ad4',
    1),
(
    '5422d5a9-89b4-494d-97a1-894657047803',
    '49f91a23-d338-40e6-8cdd-e89065bce617',
    1),
(
    '982889c1-368c-489c-b8f4-234802e0781d',
    'c61a269f-68fc-4386-b354-a66b9b921650',
    1),
(
    '982889c1-368c-489c-b8f4-234802e0781d',
    'bd5c06a0-43a9-4708-b744-8798024b8ad4',
    1),
(
    '982889c1-368c-489c-b8f4-234802e0781d',
    '49f91a23-d338-40e6-8cdd-e89065bce617',
    1),
(
    '4c953c83-bc6e-41a0-bde7-d25a6a938a3c',
    '49f91a23-d338-40e6-8cdd-e89065bce617',
    1);
--;;
COMMIT;

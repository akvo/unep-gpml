BEGIN;
--;;
INSERT INTO rbac_permission (
    id,
    name,
    description,
    context_type_name)
VALUES (
    'b7ee0890-b9e0-432e-9453-366cf6b66dff',
    'plastic-strategy/delete-team-member',
    'Allows deleting a plastic strategy team member',
    'plastic-strategy');
--;;
INSERT INTO rbac_role_permission (
    role_id,
    permission_id,
    permission_value)
VALUES (
    '5422d5a9-89b4-494d-97a1-894657047803',
    'b7ee0890-b9e0-432e-9453-366cf6b66dff',
    1);
--;;
COMMIT;

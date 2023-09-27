BEGIN;
--;;
CREATE TYPE USER_CHAT_ACCOUNT_STATUS AS ENUM (
    'pending-activation',
    'active',
    'inactive'
);
--;;
ALTER TABLE stakeholder
    ADD COLUMN chat_account_id TEXT UNIQUE,
    ADD COLUMN chat_account_status USER_CHAT_ACCOUNT_STATUS;
--;;
CREATE TABLE chat_curated_channel (
    id TEXT PRIMARY KEY
);
--;;
INSERT INTO rbac_permission (
    id,
    name,
    description,
    context_type_name)
VALUES (
    'b4ef03da-40d8-41fb-bfa0-36ae941aca3e',
    'application/list-chat-public-channels',
    'Allows listing all chat server public channels',
    'application'),
(
    '31a9cfbd-d819-4faf-9251-43f2cdd773e2',
    'application/list-chat-private-channels',
    'Allows listing all chat server private channels',
    'application'),
(
    '95f23b64-00b3-4e31-b2f3-d56ae3d46972',
    'application/list-chat-channels',
    'Allows listing all chat server channels',
    'application'),
(
    '3661e240-97ba-4c05-8a94-1b86b2091f0d',
    'application/list-chat-curated-channels',
    'Allows listing all chat server curated channels',
    'application'),
(
    '2b72ff47-ccd8-4748-b14c-b36dd8854e2a',
    'application/send-private-chat-invitation-request',
    'Allows requesting an invitation to a private chat channel',
    'application');
--;;
INSERT INTO rbac_role_permission (
    role_id,
    permission_id,
    permission_value)
VALUES (
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    'b4ef03da-40d8-41fb-bfa0-36ae941aca3e',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    '31a9cfbd-d819-4faf-9251-43f2cdd773e2',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    '95f23b64-00b3-4e31-b2f3-d56ae3d46972',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    '3661e240-97ba-4c05-8a94-1b86b2091f0d',
    1),
(
    '2ecb82a5-5aff-47ba-8889-5cfdc3199550',
    '2b72ff47-ccd8-4748-b14c-b36dd8854e2a',
    1);
--;;
COMMIT;

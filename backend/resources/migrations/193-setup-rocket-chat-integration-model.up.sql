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
COMMIT;

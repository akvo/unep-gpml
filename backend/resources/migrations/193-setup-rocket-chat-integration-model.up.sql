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
    ADD COLUMN chat_account_username TEXT UNIQUE,
    ADD COLUMN chat_account_status USER_CHAT_ACCOUNT_STATUS DEFAULT 'pending-activation';
--;;
CREATE TABLE chat_curated_channel (
    id TEXT PRIMARY KEY
);
--;;
COMMIT;

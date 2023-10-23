BEGIN;
--;;
ALTER TABLE plastic_strategy
ADD COLUMN chat_channel_id TEXT UNIQUE;
--;;
COMMIT;

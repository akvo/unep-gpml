BEGIN;
--;;
ALTER TABLE tag
  ADD COLUMN IF NOT EXISTS private BOOLEAN DEFAULT false;
--;;
COMMIT;
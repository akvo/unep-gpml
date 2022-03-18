BEGIN;
--;;
ALTER TABLE tag
DROP COLUMN review_status,
DROP COLUMN reviewed_by,
DROP COLUMN reviewed_at;
--;;
COMMIT;

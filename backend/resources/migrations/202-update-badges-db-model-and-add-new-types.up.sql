BEGIN;
--;; Drop file-related column id that is not needed.
--;;
ALTER TABLE badge DROP COLUMN content_file_id;
--;; We need to delete related possibly existing files that could have been created already
--;;
DELETE from file where object_key ILIKE 'badge/%';
--;; Now we add the new type enum values
--;;
ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'verified';
--;;
ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'expert-verified';
--;;
ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'focal-point-verified';
--;;
ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'partner-verified';
--;;
ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'coe-verified';
--;;
COMMIT;
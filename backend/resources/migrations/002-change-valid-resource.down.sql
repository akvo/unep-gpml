ALTER TABLE resource
DROP COLUMN valid_from,
ADD COLUMN valid_from timestamptz,
DROP COLUMN valid_to,
ADD COLUMN valid_to timestamptz;

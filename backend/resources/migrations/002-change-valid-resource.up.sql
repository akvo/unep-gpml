ALTER TABLE resource
DROP COLUMN valid_from,
ADD COLUMN valid_from smallint,
DROP COLUMN valid_to,
ADD COLUMN valid_to smallint;

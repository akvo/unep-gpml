-- NOTE: same approach as https://github.com/akvo/unep-gpml/blob/main/backend/resources/migrations/090-add-transnational-country-group-type.down.sql

UPDATE country_group SET
  type = 'region'
    WHERE type = 'featured';

ALTER TABLE country_group ALTER COLUMN type set DEFAULT NULL;

CREATE TYPE country_group_type_old AS ENUM ('region', 'mea', 'transnational');

ALTER TABLE country_group
  ALTER COLUMN type TYPE country_group_type_old
    USING (type::text::country_group_type_old);

ALTER TABLE country_group ALTER COLUMN type set DEFAULT 'region';

DROP TYPE country_group_type;

ALTER TYPE country_group_type_old RENAME TO country_group_type;

-- NOTE: same approach as https://github.com/akvo/unep-gpml/blob/main/backend/resources/migrations/079-add-reviewer-role.down.sql#L1

UPDATE country_group SET
  type = 'mea'
    WHERE type = 'transnational';

ALTER TABLE country_group ALTER COLUMN type set DEFAULT NULL;

CREATE TYPE country_group_type_old AS ENUM ('region', 'mea');

ALTER TABLE country_group
  ALTER COLUMN type TYPE country_group_type_old
    USING (type::text::country_group_type_old);

ALTER TABLE country_group ALTER COLUMN type set DEFAULT 'region';

DROP TYPE country_group_type;

ALTER TYPE country_group_type_old RENAME TO country_group_type;

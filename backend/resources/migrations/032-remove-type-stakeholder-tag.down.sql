CREATE TYPE stakeholder_tag_type AS
ENUM ('offering', 'seeking', 'tag');

ALTER TABLE stakeholder_tag ADD COLUMN type stakeholder_tag_type DEFAULT 'tag';

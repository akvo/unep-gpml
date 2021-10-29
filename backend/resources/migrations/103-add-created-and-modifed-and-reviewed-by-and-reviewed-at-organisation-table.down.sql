DROP TRIGGER organisation_modified ON organisation;
ALTER TABLE organisation DROP COLUMN created;
ALTER TABLE organisation DROP COLUMN modified;
ALTER TABLE organisation DROP COLUMN reviewed_at;
ALTER TABLE organisation DROP COLUMN reviewed_by;

ALTER TABLE event ADD COLUMN created_by integer REFERENCES stakeholder(id);
ALTER TABLE organisation ADD COLUMN created_by integer REFERENCES stakeholder(id);
ALTER TABLE policy ADD COLUMN created_by integer REFERENCES stakeholder(id);
ALTER TABLE resource ADD COLUMN created_by integer REFERENCES stakeholder(id);
ALTER TABLE technology ADD COLUMN created_by integer REFERENCES stakeholder(id);

ALTER TABLE organisation ADD COLUMN created timestamptz NOT NULL DEFAULT now();
ALTER TABLE organisation ADD COLUMN modified timestamptz NOT NULL DEFAULT now();
ALTER TABLE organisation ADD COLUMN reviewed_at timestamptz;
ALTER TABLE organisation ADD COLUMN reviewed_by integer REFERENCES stakeholder(id);

DO $$
BEGIN
PERFORM install_update_modified('organisation');
END$$;

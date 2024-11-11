BEGIN;

ALTER TABLE project ADD COLUMN reviewed_at timestamptz;
ALTER TABLE project ADD COLUMN reviewed_by integer REFERENCES stakeholder(id);
ALTER TABLE project ADD COLUMN review_status review_status DEFAULT 'SUBMITTED';

COMMIT;

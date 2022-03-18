BEGIN;
--;;
DO $$
BEGIN
    PERFORM pg_catalog.setval(pg_get_serial_sequence('tag', 'id'), (SELECT MAX(id) FROM tag));
END
$$;
--;;
ALTER TABLE tag
ADD COLUMN review_status review_status DEFAULT 'SUBMITTED',
ADD COLUMN reviewed_by integer REFERENCES stakeholder(id),
ADD COLUMN reviewed_at timestamptz;
--;;
UPDATE tag SET review_status = 'APPROVED', reviewed_at=NOW();
--;;
COMMIT;

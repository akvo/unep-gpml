DO $$
BEGIN
    PERFORM pg_catalog.setval(pg_get_serial_sequence('initiative', 'id'), 10000);
END
$$;

ALTER TABLE country ALTER COLUMN id SET DEFAULT nextval('country_id_seq');

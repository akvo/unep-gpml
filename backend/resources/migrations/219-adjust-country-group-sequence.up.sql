DO $$
BEGIN
    PERFORM pg_catalog.setval(pg_get_serial_sequence('country_group','id'), 10000);
END
$$;

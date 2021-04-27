DO $$
BEGIN
    PERFORM pg_catalog.setval(pg_get_serial_sequence('initiative', 'id'), 1);
END
$$;

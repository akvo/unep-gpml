DO $$
BEGIN
    PERFORM pg_catalog.setval(pg_get_serial_sequence('organisation', 'id'), 10000);
    PERFORM pg_catalog.setval(pg_get_serial_sequence('resource', 'id'), 10000);
    PERFORM pg_catalog.setval(pg_get_serial_sequence('policy', 'id'), 10000);
    PERFORM pg_catalog.setval(pg_get_serial_sequence('technology', 'id'), 10000);
    PERFORM pg_catalog.setval(pg_get_serial_sequence('project', 'id'), 10000);
    PERFORM pg_catalog.setval(pg_get_serial_sequence('stakeholder', 'id'), 10000);
    PERFORM pg_catalog.setval(pg_get_serial_sequence('event', 'id'), 10000);
END
$$;

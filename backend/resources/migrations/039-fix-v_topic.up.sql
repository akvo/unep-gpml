DROP VIEW IF EXISTS v_topic;
CREATE VIEW v_topic AS
    SELECT * FROM v_event
    UNION ALL
    SELECT * FROM v_policy
    UNION ALL
    SELECT * FROM v_resource
    UNION ALL
    SELECT * FROM v_technology
    UNION ALL
    SELECT * FROM v_project
    UNION ALL
    SELECT * FROM v_stakeholder
    UNION ALL
    SELECT * FROM v_organisation;
--;;

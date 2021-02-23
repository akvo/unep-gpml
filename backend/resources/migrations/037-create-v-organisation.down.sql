DROP VIEW IF EXISTS v_topic;

--- # Organisation
DROP VIEW IF EXISTS v_organisation_data CASCADE;
DROP VIEW IF EXISTS v_organisation CASCADE;
DROP VIEW IF EXISTS v_organisation_geo CASCADE;
DROP VIEW IF EXISTS v_organisation_search_text CASCADE;
--- # End Organisation

CREATE OR REPLACE VIEW v_topic
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
SELECT * FROM v_stakeholder;
--;;

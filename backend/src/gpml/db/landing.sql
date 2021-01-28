-- :name map-counts
-- :doc Get counts of entities

SELECT mc.geo_coverage_iso_code AS iso_code, json_object_agg(mc.topic, mc.count) AS counts
FROM (
    SELECT geo_coverage_iso_code, REPLACE(lower(json->>'type'),' ','_') AS topic, count(*)
    FROM v_resource
    WHERE geo_coverage_iso_code IS NOT NULL AND json->>'type' IS NOT NULL
    GROUP BY geo_coverage_iso_code, json->>'type'
    UNION
    SELECT geo_coverage_iso_code, topic, count(*) FROM v_topic
    WHERE topic <> 'resource'
    GROUP BY geo_coverage_iso_code, topic
) AS mc GROUP BY geo_coverage_iso_code;

-- :name summary
-- :doc Get summary of count of entities and number of countries
WITH
resource_countries AS (
    SELECT c.id FROM resource_geo_coverage r, country_group_country cgc
    JOIN country c ON cgc.country = c.id
    WHERE r.country_group = cgc.country_group
    UNION
    SELECT r.country AS id FROM resource_geo_coverage r
    WHERE r.country IS NOT NULL
),
event_countries AS (
    SELECT c.id FROM event_geo_coverage e, country_group_country cgc
    JOIN country c ON cgc.country = c.id
    WHERE e.country_group = cgc.country_group
    UNION
    SELECT e.country AS id FROM event_geo_coverage e
    WHERE e.country IS NOT NULL
),
policy_countries AS (
    SELECT c.id FROM policy_geo_coverage p, country_group_country cgc
    JOIN country c ON cgc.country = c.id
    WHERE p.country_group = cgc.country_group
    UNION
    SELECT p.country AS id FROM policy_geo_coverage p
    WHERE p.country IS NOT NULL
),
technology_countries AS (
    SELECT c.id FROM technology_geo_coverage t, country_group_country cgc
    JOIN country c ON cgc.country = c.id
    WHERE t.country_group = cgc.country_group
    UNION
    SELECT t.country AS id FROM technology_geo_coverage t
    WHERE t.country IS NOT NULL
)
SELECT
    (SELECT count(*) FROM resource_countries) AS resource_countries,
    (SELECT count(*) FROM resource) AS resource,
    (SELECT count(*) FROM event_countries) AS event_countries,
    (SELECT count(*) FROM event) AS event,
    (SELECT count(*) FROM policy_countries) AS policy_countries,
    (SELECT count(*) FROM policy) AS policy,
    (SELECT count(*) FROM technology_countries) AS technology_countries,
    (SELECT count(*) FROM technology) AS technology,
    -- NOTE: projects only have countries, no country groups
    (SELECT count(DISTINCT country) FROM project_country) AS project_countries,
    (SELECT count(*) FROM project) AS project

-- :name new-landing-test
-- :doc Get Test of output
WITH
resource_countries AS (
    SELECT c.id, r.type FROM resource_geo_coverage rg LEFT JOIN resource r ON rg.resource = r.id, country_group_country cgc
    JOIN country c ON cgc.country = c.id
    WHERE rg.country_group = cgc.country_group
    UNION
    SELECT rg.country AS id, r.type FROM resource_geo_coverage rg LEFT JOIN resource r ON rg.resource = r.id
    WHERE rg.country IS NOT NULL
),
event_countries AS (
    SELECT c.id FROM event_geo_coverage e, country_group_country cgc
    JOIN country c ON cgc.country = c.id
    WHERE e.country_group = cgc.country_group
    UNION
    SELECT e.country AS id FROM event_geo_coverage e
    WHERE e.country IS NOT NULL
),
policy_countries AS (
    SELECT c.id FROM policy_geo_coverage p, country_group_country cgc
    JOIN country c ON cgc.country = c.id
    WHERE p.country_group = cgc.country_group
    UNION
    SELECT p.country AS id FROM policy_geo_coverage p
    WHERE p.country IS NOT NULL
),
technology_countries AS (
    SELECT c.id FROM technology_geo_coverage t, country_group_country cgc
    JOIN country c ON cgc.country = c.id
    WHERE t.country_group = cgc.country_group
    UNION
    SELECT t.country AS id FROM technology_geo_coverage t
    WHERE t.country IS NOT NULL
),
counts AS (
    SELECT COUNT(*) as country ,'resource' as data ,1 as o FROM resource_countries
    UNION
    SELECT COUNT(*) as country,
    replace(lower(type),' ', '_') as data,2 as o
    FROM resource_countries WHERE type IS NOT NULL GROUP BY data
    UNION
    SELECT COUNT(*) as country,'event' as data,3 as o FROM event_countries
    UNION
    SELECT COUNT(*) as country,'policy' as data,4 as o FROM policy_countries
    UNION
    SELECT COUNT(*) as country,'technology' as data,5 as o FROM technology_countries
),
totals AS (
    SELECT COUNT(*) as total,'resource' as data,1 as o FROM resource
    UNION
    SELECT COUNT(*) as total,
    replace(lower(type),' ','_') as data,2 as o
    FROM resource WHERE type IS NOT NULL GROUP BY data
    UNION
    SELECT COUNT(*) as total,'event' as data,3 as o FROM event
    UNION
    SELECT COUNT(*) as total,'policy' as data,4 as o FROM policy
    UNION
    SELECT COUNT(*) as total,'technology' as data,5 as o FROM technology
)
SELECT t.o,t.total,t.data,c.country as countries FROM totals t LEFT JOIN counts c ON t.data = c.data ORDER BY o;

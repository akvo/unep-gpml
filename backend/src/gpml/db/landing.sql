-- :name map-counts
-- :doc Get counts of entities

select geo_coverage_iso_code, topic, COUNT(*) from v_topic GROUP BY geo_coverage_iso_code, topic

-- :name summary
-- :doc Get summary of count of entities and number of countries
WITH
resource_countries AS (
    SELECT c.id FROM resource_geo_coverage r, country_group_country cgc
    JOIN country c ON cgc.country = c.id
    WHERE r.country_group = cgc.country_group
    UNION
    SELECT r.country AS id from resource_geo_coverage r
    WHERE r.country IS NOT NULL
),
event_countries AS (
    SELECT c.id FROM event_geo_coverage e, country_group_country cgc
    JOIN country c ON cgc.country = c.id
    WHERE e.country_group = cgc.country_group
    UNION
    SELECT e.country AS id from event_geo_coverage e
    WHERE e.country IS NOT NULL
),
policy_countries AS (
    SELECT c.id FROM policy_geo_coverage p, country_group_country cgc
    JOIN country c ON cgc.country = c.id
    WHERE p.country_group = cgc.country_group
    UNION
    SELECT p.country AS id from policy_geo_coverage p
    WHERE p.country IS NOT NULL
),
technology_countries AS (
    SELECT c.id FROM technology_geo_coverage t, country_group_country cgc
    JOIN country c ON cgc.country = c.id
    WHERE t.country_group = cgc.country_group
    UNION
    SELECT t.country AS id from technology_geo_coverage t
    WHERE t.country IS NOT NULL
)
SELECT
    (SELECT COUNT(*) FROM resource_countries) AS resource_countries,
    (SELECT COUNT(*) FROM resource) AS resource,
    (SELECT COUNT(*) FROM event_countries) AS event_countries,
    (SELECT COUNT(*) FROM event) AS event,
    (SELECT COUNT(*) FROM policy_countries) AS policy_countries,
    (SELECT COUNT(*) FROM policy) AS policy,
    (SELECT COUNT(*) FROM technology_countries) AS technology_countries,
    (SELECT COUNT(*) FROM technology) AS technology

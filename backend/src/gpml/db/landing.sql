-- :name map-counts
-- :require [gpml.db.landing]
--~(#'gpml.db.landing/generate-entity-count-by-geo-coverage-query-cte {:cte-name "entity_counts_by_country"} {})
SELECT
    geo_coverage AS id,
    json_object_agg(entity, entity_count) AS counts
FROM
    entity_counts_by_country
WHERE
    geo_coverage IS NOT NULL
GROUP BY
    geo_coverage
ORDER BY
    geo_coverage;

-- :name map-transnational-counts-by-country
-- :require [gpml.db.landing]
--~(#'gpml.db.landing/generate-entity-count-by-geo-coverage-query-cte {:cte-name "entity_counts_by_country_group" :geo-coverage-type :transnational} {})
SELECT
    geo_coverage AS id,
    json_object_agg(entity, entity_count) AS transnational_counts
FROM
    entity_counts_by_country_group
WHERE
    geo_coverage IS NOT NULL
GROUP BY
    geo_coverage
ORDER BY
    geo_coverage;

-- :name entities-count-by-country-group
-- :doc Count the number of entities group by country group
-- :require [gpml.db.landing]
--~(#'gpml.db.landing/generate-entity-count-by-geo-coverage-query-cte {:cte-name "entity_counts_by_country_group" :geo-coverage-type :transnational :geo-coverage :country-group} {})
SELECT
    geo_coverage AS id,
    json_object_agg(entity, entity_count) AS counts
FROM
    entity_counts_by_country_group
WHERE
    geo_coverage IS NOT NULL
GROUP BY
    geo_coverage
ORDER BY
    geo_coverage;

-- :name summary
-- :doc Get summary of count of entities and number of countries
WITH initiative_countries AS (
    SELECT
        c.id
    FROM
        initiative_geo_coverage ig,
        country_group_country cgc
        JOIN country c ON cgc.country = c.id
    WHERE
        ig.country_group = cgc.country_group
    UNION
    SELECT
        ig.country AS id
    FROM
        initiative_geo_coverage ig
    WHERE
        ig.country IS NOT NULL
),
resource_countries AS (
    SELECT
        c.id,
        r.type
    FROM
        resource_geo_coverage rg
        LEFT JOIN resource r ON rg.resource = r.id,
        country_group_country cgc
        JOIN country c ON cgc.country = c.id
    WHERE
        rg.country_group = cgc.country_group
    UNION
    SELECT
        rg.country AS id,
        r.type
    FROM
        resource_geo_coverage rg
        LEFT JOIN resource r ON rg.resource = r.id
    WHERE
        rg.country IS NOT NULL
),
event_countries AS (
    SELECT
        c.id
    FROM
        event_geo_coverage e,
        country_group_country cgc
        JOIN country c ON cgc.country = c.id
    WHERE
        e.country_group = cgc.country_group
    UNION
    SELECT
        e.country AS id
    FROM
        event_geo_coverage e
    WHERE
        e.country IS NOT NULL
),
policy_countries AS (
    SELECT
        c.id
    FROM
        policy_geo_coverage p,
        country_group_country cgc
        JOIN country c ON cgc.country = c.id
    WHERE
        p.country_group = cgc.country_group
    UNION
    SELECT
        p.country AS id
    FROM
        policy_geo_coverage p
    WHERE
        p.country IS NOT NULL
),
technology_countries AS (
    SELECT
        c.id
    FROM
        technology_geo_coverage t,
        country_group_country cgc
        JOIN country c ON cgc.country = c.id
    WHERE
        t.country_group = cgc.country_group
    UNION
    SELECT
        t.country AS id
    FROM
        technology_geo_coverage t
    WHERE
        t.country IS NOT NULL
),
stakeholder_countries AS (
    SELECT
        country AS id
    FROM
        stakeholder
    WHERE
        country IS NOT NULL
        AND review_status = 'APPROVED'
),
organisation_countries AS (
    WITH approved_orgs AS (
        SELECT
            o.country,
            o.country_group
        FROM
            organisation_geo_coverage o
        LEFT JOIN organisation org ON o.organisation = org.id
    WHERE
        org.review_status = 'APPROVED'
)
    SELECT
        c.id
    FROM
        approved_orgs o,
        country_group_country cgc
        JOIN country c ON cgc.country = c.id
    WHERE
        o.country_group = cgc.country_group
    UNION
    SELECT
        o.country AS id
    FROM
        approved_orgs o
    WHERE
        o.country IS NOT NULL
),
country_counts AS (
    SELECT
        COUNT(*) AS country,
        'project' AS data
    FROM
        initiative_countries
    UNION
    SELECT
        COUNT(*) AS country,
        replace(lower(type), ' ', '_') AS data
    FROM
        resource_countries
    WHERE
        type IS NOT NULL
    GROUP BY
        data
    UNION
    SELECT
        COUNT(*) AS country,
        'event' AS data
    FROM
        event_countries
    UNION
    SELECT
        COUNT(*) AS country,
        'policy' AS data
    FROM
        policy_countries
    UNION
    SELECT
        COUNT(*) AS country,
        'technology' AS data
    FROM
        technology_countries
    UNION
    SELECT
        COUNT(*) AS country,
        'organisation' AS data
    FROM
        organisation_countries
    UNION
    SELECT
        COUNT(*) AS country,
        'stakeholder' AS data
    FROM
        stakeholder_countries
),
totals AS (
    SELECT
        COUNT(*) AS total,
        'project' AS data,
        1 AS o
    FROM
        initiative
    WHERE
        review_status = 'APPROVED'
    UNION
    SELECT
        COUNT(*) AS total,
        REPLACE(LOWER(type), ' ', '_') AS data,
        2 AS o
    FROM
        resource
    WHERE
        review_status = 'APPROVED'
        AND type IS NOT NULL
    GROUP BY
        data
    UNION
    SELECT
        COUNT(*) AS total,
        'event' AS data,
        3 AS o
    FROM
        event
    WHERE
        event.review_status = 'APPROVED'
    UNION
    SELECT
        COUNT(*) AS total,
        'policy' AS data,
        4 AS o
    FROM
        policy
    WHERE
        review_status = 'APPROVED'
    UNION
    SELECT
        COUNT(*) AS total,
        'technology' AS data,
        5 AS o
    FROM
        technology
    WHERE
        review_status = 'APPROVED'
    UNION
    SELECT
        COUNT(*) AS total,
        'organisation' AS data,
        6 AS o
    FROM
        organisation
    WHERE
        review_status = 'APPROVED'
    UNION
    SELECT
        COUNT(*) AS total,
        'stakeholder' AS data,
        7 AS o
    FROM
        stakeholder
    WHERE
    review_status = 'APPROVED'
)
SELECT
    t.total AS count,
    t.data AS resource_type,
    c.country AS country_count
FROM
    totals t
    JOIN country_counts c ON t.data = c.data
ORDER BY
    o;

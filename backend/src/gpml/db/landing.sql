-- :name map-counts
-- :doc Get counts of entities

WITH resource_count AS (
        select COUNT(*) AS resource, rgc.country from resource_geo_coverage rgc group by rgc.country
     ),
     -- NOTE: if a resource adds both country and a parent country group, it will get counted twice
     -- It may be easier to prevent this double counting with data, rather than fix this query?
     resource_count_group AS (
        select COUNT(*) AS resource_g, cgc.country
        from resource_geo_coverage rgc
        join country_group_countries cgc ON cgc.country_group = rgc.country_group
        group by cgc.country
     ),
     event_count AS (
        select COUNT(*) AS event, egc.country from event_geo_coverage egc group by egc.country
     ),
     event_count_group AS (
        select COUNT(*) AS event_g, cgc.country
        from event_geo_coverage egc
        join country_group_countries cgc ON cgc.country_group = egc.country_group
        group by cgc.country
     ),
     policy_count AS (
        select COUNT(*) AS policy, pgc.country from policy_geo_coverage pgc group by pgc.country
     ),
     policy_count_group AS (
        select COUNT(*) AS policy_g, cgc.country
        from policy_geo_coverage pgc
        join country_group_countries cgc ON cgc.country_group = pgc.country_group
        group by cgc.country
     ),
     technology_count AS (
        select COUNT(*) AS technology, tgc.country from technology_geo_coverage tgc group by tgc.country
     ),
     technology_count_group AS (
        select COUNT(*) AS technology_g, cgc.country
        from technology_geo_coverage tgc
        join country_group_countries cgc ON cgc.country_group = tgc.country_group
        group by cgc.country
     )
     -- FIXME: Add project when tables are created...
     SELECT c.id AS country, c.iso_code AS iso_code,
            COALESCE(resource, 0) + COALESCE(resource_g, 0) AS resource,
            COALESCE(event, 0) + COALESCE(event_g, 0) AS event,
            COALESCE(policy, 0) + COALESCE(policy_g, 0) AS policy,
            COALESCE(technology, 0) + COALESCE(technology_g, 0) AS technology
     FROM country c
     LEFT JOIN resource_count rc ON rc.country = c.id
     LEFT JOIN resource_count_group rcg ON rcg.country = c.id
     LEFT JOIN event_count ec ON ec.country = c.id
     LEFT JOIN event_count_group ecg ON ecg.country = c.id
     LEFT JOIN policy_count pc ON pc.country = c.id
     LEFT JOIN policy_count_group pcg ON pcg.country = c.id
     LEFT JOIN technology_count tc ON tc.country = c.id
     LEFT JOIN technology_count_group tcg ON tcg.country = c.id;

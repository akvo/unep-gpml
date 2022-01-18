-- :name get-topics :? :*
-- :doc Gets the list of topics. If count-only? parameter is provided, the query will only group and count the topics.
-- :require [gpml.sql-util]
WITH cte_event_data AS (
    SELECT
        e.id,
        e.title,
        e.start_date,
        e.end_date,
        e.description,
        e.image,
        e.country,
        e.city,
        e.geo_coverage_type,
        geo.geo_coverage_values,
        e.remarks,
        e.created,
        e.modified,
        e.reviewed_at,
        e.reviewed_by,
        e.review_status,
        e.url,
        e.info_docs,
        e.sub_content_type,
        e.capacity_building,
        e.event_type,
        e.recording,
        lang.languages,
        tag.tags
    FROM (((public.event e
            LEFT JOIN (
                SELECT
                    elu.event,
                    json_agg(json_build_object('url', elu.url, 'iso_code', l.iso_code)) AS languages
            FROM (public.event_language_url elu
                JOIN public.language l ON ((elu.language = l.id)))
        GROUP BY
            elu.event) lang ON ((e.id = lang.event)))
        LEFT JOIN (
            SELECT
                et.event,
                json_agg(json_build_object(t.id, t.tag)) AS tags
        FROM (public.event_tag et
            JOIN public.tag t ON ((et.tag = t.id)))
    GROUP BY
        et.event) tag ON ((e.id = tag.event)))
    LEFT JOIN (
        SELECT
            eg.event,
            json_agg(COALESCE(eg.country, eg.country_group, 0)) AS geo_coverage_values
    FROM
        public.event_geo_coverage eg
    GROUP BY
        eg.event) geo ON ((e.id = geo.event)))
ORDER BY
    e.created
),
cte_event_geo AS (
    SELECT
        e.id,
        COALESCE(cgc.country, egc.country) AS geo_coverage
FROM ((public.event e
        LEFT JOIN public.event_geo_coverage egc ON ((e.id = egc.event)))
        LEFT JOIN public.country_group_country cgc ON ((cgc.country_group = egc.country_group)))
    WHERE (e.geo_coverage_type <> 'global'::public.geo_coverage_type)
UNION ALL
SELECT
    e.id,
    0 AS geo_coverage
FROM
    public.event e
    WHERE (e.geo_coverage_type = 'global'::public.geo_coverage_type)
),
cte_event_search_text AS (
    SELECT
        event.id,
        to_tsvector('english'::regconfig, ((((COALESCE(event.title, ''::text) || ' '::text) || COALESCE(event.description, ''::text)) || ''::text) || COALESCE(event.remarks, ''::text))) AS search_text
    FROM
        public.event
    ORDER BY
        event.created
),
cte_event AS (
    SELECT
        'event'::text AS topic,
        geo.geo_coverage,
        st.search_text,
        row_to_json(e.*) AS json
    FROM ((cte_event_data e
        LEFT JOIN cte_event_geo geo ON ((e.id = geo.id)))
        LEFT JOIN cte_event_search_text st ON ((e.id = st.id)))
),
cte_technology_data AS (
    SELECT
        t.id,
        t.name,
        t.year_founded,
        t.country,
        t.organisation_type,
        t.development_stage,
        t.specifications_provided,
        t.email,
        t.geo_coverage_type,
        t.attachments,
        t.remarks,
        t.created,
        t.modified,
        t.reviewed_at,
        t.reviewed_by,
        t.review_status,
        t.url,
        t.image,
        t.logo,
        t.created_by,
        geo.geo_coverage_values,
        lang.languages,
        tag.tags,
        geo.geo_coverage_country_groups,
        geo.geo_coverage_countries
    FROM (((public.technology t
                LEFT JOIN (
                    SELECT
                        tlu.technology,
                        json_agg(json_build_object('url', tlu.url, 'iso_code', l.iso_code)) AS languages
                FROM (public.technology_language_url tlu
                    JOIN public.language l ON ((tlu.language = l.id)))
            GROUP BY
                tlu.technology) lang ON ((t.id = lang.technology)))
        LEFT JOIN (
            SELECT
                tt.technology,
                json_agg(json_build_object(t_1.id, t_1.tag)) AS tags
        FROM (public.technology_tag tt
            JOIN public.tag t_1 ON ((tt.tag = t_1.id)))
    GROUP BY
        tt.technology) tag ON ((t.id = tag.technology)))
    LEFT JOIN (
        SELECT
            tg.technology,
            json_agg(COALESCE(tg.country_group, 0)) FILTER (WHERE (tg.country_group IS NOT NULL)) AS geo_coverage_country_groups,
    json_agg(COALESCE(tg.country, 0)) FILTER (WHERE (tg.country IS NOT NULL)) AS geo_coverage_countries,
json_agg(COALESCE(tg.country, tg.country_group, 0)) AS geo_coverage_values
FROM
    public.technology_geo_coverage tg
GROUP BY
    tg.technology) geo ON ((t.id = geo.technology)))
ORDER BY
    t.created
),
cte_technology_geo AS (
    SELECT
        t.id,
        COALESCE(cgc.country, tgc.country) AS geo_coverage
    FROM ((public.technology t
        LEFT JOIN public.technology_geo_coverage tgc ON ((t.id = tgc.technology)))
        LEFT JOIN public.country_group_country cgc ON ((cgc.country_group = tgc.country_group)))
    WHERE (t.geo_coverage_type <> 'global'::public.geo_coverage_type)
UNION ALL
SELECT
    t.id,
    0 AS geo_coverage
FROM
    public.technology t
    WHERE (t.geo_coverage_type = 'global'::public.geo_coverage_type)
),
cte_technology_search_text AS (
    SELECT
        technology.id,
        to_tsvector('english'::regconfig, COALESCE(technology.name, ''::text)) AS search_text
    FROM
        public.technology
    ORDER BY
        technology.created
),
cte_technology AS (
    SELECT
        'technology'::text AS topic,
        geo.geo_coverage,
        st.search_text,
        row_to_json(t.*) AS json
    FROM ((cte_technology_data t
        LEFT JOIN cte_technology_geo geo ON ((t.id = geo.id)))
        LEFT JOIN cte_technology_search_text st ON ((t.id = st.id)))
),
cte_policy_data AS (
    SELECT
        p.id,
        p.title,
        p.original_title,
        p.data_source,
        p.country,
        p.abstract,
        p.type_of_law,
        p.record_number,
        p.first_publication_date,
        p.latest_amendment_date,
        p.status,
        p.geo_coverage_type,
        p.attachments,
        p.remarks,
        p.created,
        p.modified,
        p.implementing_mea,
        p.reviewed_at,
        p.reviewed_by,
        p.review_status,
        p.url,
        p.image,
        p.created_by,
        geo.geo_coverage_values,
        lang.languages,
        tag.tags,
        geo.geo_coverage_country_groups,
        geo.geo_coverage_countries
    FROM (((public.policy p
                LEFT JOIN (
                    SELECT
                        plu.policy,
                        json_agg(json_build_object('url', plu.url, 'iso_code', l.iso_code)) AS languages
                FROM (public.policy_language_url plu
                    JOIN public.language l ON ((plu.language = l.id)))
            GROUP BY
                plu.policy) lang ON ((p.id = lang.policy)))
        LEFT JOIN (
            SELECT
                pt.policy,
                json_agg(json_build_object(t.id, t.tag)) AS tags
        FROM (public.policy_tag pt
            JOIN public.tag t ON ((pt.tag = t.id)))
    GROUP BY
        pt.policy) tag ON ((p.id = tag.policy)))
    LEFT JOIN (
        SELECT
            pg.policy,
            json_agg(COALESCE(pg.country_group, 0)) FILTER (WHERE (pg.country_group IS NOT NULL)) AS geo_coverage_country_groups,
    json_agg(COALESCE(pg.country, 0)) FILTER (WHERE (pg.country IS NOT NULL)) AS geo_coverage_countries,
json_agg(COALESCE(pg.country, pg.country_group, 0)) AS geo_coverage_values
FROM
    public.policy_geo_coverage pg
GROUP BY
    pg.policy) geo ON ((p.id = geo.policy)))
ORDER BY
    p.created
),
cte_policy_geo AS (
    SELECT
        p.id,
        COALESCE(cgc.country, pgc.country) AS geo_coverage
    FROM ((public.policy p
        LEFT JOIN public.policy_geo_coverage pgc ON ((p.id = pgc.policy)))
        LEFT JOIN public.country_group_country cgc ON ((cgc.country_group = pgc.country_group)))
    WHERE (p.geo_coverage_type <> 'global'::public.geo_coverage_type)
UNION ALL
SELECT
    p.id,
    0 AS geo_coverage
FROM
    public.policy p
    WHERE (p.geo_coverage_type = 'global'::public.geo_coverage_type)
),
cte_policy_search_text AS (
    SELECT
        policy.id,
        to_tsvector('english'::regconfig, ((((((COALESCE(policy.title, ''::text) || ' '::text) || COALESCE(policy.original_title, ''::text)) || ''::text) || COALESCE(policy.abstract, ''::text)) || ' '::text) || COALESCE(policy.remarks, ''::text))) AS search_text
    FROM
        public.policy
    ORDER BY
        policy.created
),
cte_policy AS (
    SELECT
        'policy'::text AS topic,
        geo.geo_coverage,
        st.search_text,
        row_to_json(p.*) AS json
    FROM ((cte_policy_data p
        LEFT JOIN cte_policy_geo geo ON ((p.id = geo.id)))
        LEFT JOIN cte_policy_search_text st ON ((p.id = st.id)))
),
cte_resource_data AS (
    SELECT
        r.id,
        r.title,
        r.type,
        r.publish_year,
        r.summary,
        r.value,
        r.image,
        r.geo_coverage_type,
        r.attachments,
        r.remarks,
        r.created,
        r.modified,
        r.country,
        r.valid_from,
        r.valid_to,
        r.reviewed_at,
        r.reviewed_by,
        r.review_status,
        r.value_remarks,
        r.value_currency,
        r.url,
        r.info_docs,
        r.sub_content_type,
        r.capacity_building,
        r.created_by,
        geo.geo_coverage_values,
        lang.languages,
        tag.tags,
        orgs.organisations,
        geo.geo_coverage_country_groups,
        geo.geo_coverage_countries
    FROM ((((public.resource r
                    LEFT JOIN (
                        SELECT
                            rlu.resource,
                            json_agg(json_build_object('url', rlu.url, 'iso_code', l.iso_code)) AS languages
                    FROM (public.resource_language_url rlu
                        JOIN public.language l ON ((rlu.language = l.id)))
                GROUP BY
                    rlu.resource) lang ON ((r.id = lang.resource)))
            LEFT JOIN (
                SELECT
                    rt.resource,
                    json_agg(json_build_object(t.id, t.tag)) AS tags
            FROM (public.resource_tag rt
                JOIN public.tag t ON ((rt.tag = t.id)))
        GROUP BY
            rt.resource) tag ON ((r.id = tag.resource)))
        LEFT JOIN (
            SELECT
                rg.resource,
                json_agg(COALESCE(rg.country_group, 0)) FILTER (WHERE (rg.country_group IS NOT NULL)) AS geo_coverage_country_groups,
        json_agg(COALESCE(rg.country, 0)) FILTER (WHERE (rg.country IS NOT NULL)) AS geo_coverage_countries,
    json_agg(COALESCE(rg.country, rg.country_group, 0)) AS geo_coverage_values
FROM
    public.resource_geo_coverage rg
GROUP BY
    rg.resource) geo ON ((r.id = geo.resource)))
    LEFT JOIN (
        SELECT
            ro.resource,
            json_agg(json_build_object('id', o.id, 'name', o.name)) AS organisations
        FROM (public.resource_organisation ro
            LEFT JOIN public.organisation o ON ((ro.organisation = o.id)))
    GROUP BY
        ro.resource) orgs ON ((r.id = orgs.resource)))
ORDER BY
    r.created
),
cte_resource_geo AS (
    SELECT
        r.id,
        COALESCE(cgc.country, rgc.country) AS geo_coverage
    FROM ((public.resource r
        LEFT JOIN public.resource_geo_coverage rgc ON ((r.id = rgc.resource)))
        LEFT JOIN public.country_group_country cgc ON ((cgc.country_group = rgc.country_group)))
    WHERE (r.geo_coverage_type <> 'global'::public.geo_coverage_type)
UNION ALL
SELECT
    r.id,
    0 AS geo_coverage
FROM
    public.resource r
    WHERE (r.geo_coverage_type = 'global'::public.geo_coverage_type)
),
cte_resource_search_text AS (
    SELECT
        resource.id,
        to_tsvector('english'::regconfig, ((((COALESCE(resource.title, ''::text) || ' '::text) || COALESCE(resource.summary, ''::text)) || ' '::text) || COALESCE(resource.remarks, ''::text))) AS search_text
    FROM
        public.resource
    ORDER BY
        resource.created
),
cte_resource AS (
    SELECT
        replace(lower(r.type), ' '::text, '_'::text) AS topic,
        geo.geo_coverage,
        st.search_text,
        row_to_json(r.*) AS json
    FROM ((cte_resource_data r
        LEFT JOIN cte_resource_geo geo ON ((r.id = geo.id)))
        LEFT JOIN cte_resource_search_text st ON ((r.id = st.id)))
),
cte_initiative_data AS (
    SELECT
        i.id,
        NULL::text AS uuid,
        NULL::text AS phase,
        i.q36 AS funds,
        i.q37 AS contribution,
        i.created,
        i.modified,
        btrim((i.q2)::text, '"'::text) AS title,
        jsonb_object_keys(i.q24) AS geo_coverage_type,
        btrim((i.q3)::text, '"'::text) AS summary,
        i.reviewed_at,
        i.reviewed_by,
        i.review_status,
        i.url AS initiative_url,
        i.info_docs,
        i.sub_content_type,
        btrim((i.q41_1)::text, '"'::text) AS url,
        NULL::text AS image,
        v_t.tags,
        geo.geo_coverage_values,
        geo.geo_coverage_country_groups,
        geo.geo_coverage_countries
    FROM ((public.initiative i
            LEFT JOIN public.v_initiative_tag v_t ON ((i.id = v_t.id)))
        LEFT JOIN (
            SELECT
                ig.initiative,
                json_agg(COALESCE(ig.country_group, 0)) FILTER (WHERE (ig.country_group IS NOT NULL)) AS geo_coverage_country_groups,
            json_agg(COALESCE(ig.country, 0)) FILTER (WHERE (ig.country IS NOT NULL)) AS geo_coverage_countries,
        json_agg(COALESCE(ig.country, ig.country_group, 0)) AS geo_coverage_values
    FROM
        public.initiative_geo_coverage ig
    GROUP BY
        ig.initiative) geo ON ((i.id = geo.initiative)))
ORDER BY
    i.created
),
cte_initiative_geo AS (
    SELECT
        i.id,
        COALESCE(cgc.country, igc.country) AS geo_coverage
    FROM ((public.initiative i
        LEFT JOIN public.initiative_geo_coverage igc ON ((i.id = igc.initiative)))
        LEFT JOIN public.country_group_country cgc ON ((cgc.country_group = igc.country_group)))
    WHERE ((i.q24 ->> 'global'::text) IS NULL)
UNION ALL
SELECT
    i.id,
    0 AS geo_coverage
FROM
    public.initiative i
    WHERE ((i.q24 ->> 'global'::text) IS NOT NULL)
),
cte_initiative_search_text AS (
    SELECT
        i.id,
        to_tsvector('english'::regconfig, ((COALESCE(btrim((i.q2)::text, '"'::text), ''::text) || ' '::text) || COALESCE(btrim((i.q3)::text, '"'::text), ''::text))) AS search_text
    FROM
        public.initiative i
    ORDER BY
        i.created
),
cte_initiative AS (
    SELECT
        'project'::text AS topic,
        geo.geo_coverage,
        st.search_text,
        row_to_json(i.*) AS json
    FROM ((cte_initiative_data i
        LEFT JOIN cte_initiative_geo geo ON ((i.id = geo.id)))
        LEFT JOIN cte_initiative_search_text st ON ((i.id = st.id)))
),
cte_stakeholder_data AS (
    SELECT
        s.id,
        s.picture,
        s.title,
        s.first_name,
        s.last_name,
        CASE WHEN (s.public_email = TRUE) THEN
            s.email
        ELSE
            ''::text
        END AS email,
        s.linked_in,
        s.twitter,
        s.url,
        s.representation,
        s.about,
        s.geo_coverage_type,
        s.created,
        s.modified,
        s.reviewed_at,
        s.role,
        s.cv,
        s.reviewed_by,
        s.review_status,
        s.public_email,
        s.country,
        s.organisation_role,
        geo.geo_coverage_values,
        row_to_json(o.*) AS affiliation,
        tag.tags,
        geo.geo_coverage_country_groups,
        geo.geo_coverage_countries
    FROM (((public.stakeholder s
                LEFT JOIN (
                    SELECT
                        st.stakeholder,
                        json_agg(json_build_object(t.id, t.tag)) AS tags
                    FROM (public.stakeholder_tag st
                        JOIN public.tag t ON ((st.tag = t.id)))
                GROUP BY
                    st.stakeholder) tag ON ((s.id = tag.stakeholder)))
            LEFT JOIN (
                SELECT
                    sg.stakeholder,
                    json_agg(COALESCE(sg.country_group, 0)) FILTER (WHERE (sg.country_group IS NOT NULL)) AS geo_coverage_country_groups,
                json_agg(COALESCE(sg.country, 0)) FILTER (WHERE (sg.country IS NOT NULL)) AS geo_coverage_countries,
            json_agg(COALESCE(sg.country, sg.country_group, 0)) AS geo_coverage_values
        FROM
            public.stakeholder_geo_coverage sg
        GROUP BY
            sg.stakeholder) geo ON ((s.id = geo.stakeholder)))
        LEFT JOIN public.organisation o ON ((s.affiliation = o.id)))
ORDER BY
    s.created
),
cte_stakeholder_geo AS (
    SELECT
        s.id,
        COALESCE(cgc.country, sgc.country) AS geo_coverage
    FROM ((public.stakeholder s
        LEFT JOIN public.stakeholder_geo_coverage sgc ON ((s.id = sgc.stakeholder)))
        LEFT JOIN public.country_group_country cgc ON ((cgc.country_group = sgc.country_group)))
    WHERE (s.geo_coverage_type <> 'global'::public.geo_coverage_type)
UNION ALL
SELECT
    s.id,
    0 AS geo_coverage
FROM
    public.stakeholder s
    WHERE (s.geo_coverage_type = 'global'::public.geo_coverage_type)
),
cte_stakeholder_search_text AS (
    SELECT
        stakeholder.id,
        to_tsvector('english'::regconfig, ((((COALESCE(stakeholder.first_name, ''::text) || ' '::text) || COALESCE(stakeholder.last_name, ''::text)) || ' '::text) || (COALESCE(stakeholder.about, ''::text) || ' '::text))) AS search_text
    FROM
        public.stakeholder
    ORDER BY
        stakeholder.created
),
cte_stakeholder AS (
    SELECT
        'stakeholder'::text AS topic,
        geo.geo_coverage,
        st.search_text,
        row_to_json(s.*) AS json
    FROM ((cte_stakeholder_data s
        LEFT JOIN cte_stakeholder_geo geo ON ((s.id = geo.id)))
        LEFT JOIN cte_stakeholder_search_text st ON ((s.id = st.id)))
),
cte_organisation_data AS (
    SELECT
        o.id,
        o.name,
        o.url,
        o.logo,
        o.type,
        o.country,
        o.geo_coverage_type,
        o.program,
        o.contribution,
        o.expertise,
        o.review_status,
        o.created_by,
        o.is_member,
        geo.geo_coverage_values
    FROM (public.organisation o
        LEFT JOIN (
            SELECT
                og.organisation,
                json_agg(COALESCE(c.iso_code, (cg.name)::bpchar)) AS geo_coverage_values
        FROM ((public.organisation_geo_coverage og
                LEFT JOIN public.country c ON ((og.country = c.id)))
            LEFT JOIN public.country_group cg ON ((og.country_group = cg.id)))
    GROUP BY
        og.organisation) geo ON ((o.id = geo.organisation)))
),
cte_organisation_geo AS (
    SELECT
        o.id,
        COALESCE(cgc.country, ogc.country) AS geo_coverage
    FROM ((public.organisation o
        LEFT JOIN public.organisation_geo_coverage ogc ON ((o.id = ogc.organisation)))
        LEFT JOIN public.country_group_country cgc ON ((cgc.country_group = ogc.country_group)))
    WHERE (o.geo_coverage_type <> 'global'::public.geo_coverage_type)
UNION ALL
SELECT
    o.id,
    0 AS geo_coverage
FROM
    public.organisation o
    WHERE (o.geo_coverage_type = 'global'::public.geo_coverage_type)
),
cte_organisation_search_text AS (
    SELECT
        organisation.id,
        to_tsvector('english'::regconfig, ((((((COALESCE(organisation.name, ''::text) || ' '::text) || COALESCE(organisation.program, ''::text)) || ''::text) || COALESCE(organisation.contribution, ''::text)) || ''::text) || COALESCE(organisation.expertise, ''::text))) AS search_text
    FROM
        public.organisation
    WHERE (organisation.review_status = 'APPROVED'::public.review_status)
),
cte_organisation AS (
    SELECT
        'organisation'::text AS topic,
        geo.geo_coverage,
        ot.search_text,
        row_to_json(o.*) AS json
    FROM ((cte_organisation_data o
        LEFT JOIN cte_organisation_geo geo ON ((o.id = geo.id)))
        LEFT JOIN cte_organisation_search_text ot ON ((o.id = ot.id)))
),
cte_topic AS (
    SELECT
        cte_event.topic,
        cte_event.geo_coverage,
        cte_event.search_text,
        cte_event.json
    FROM
        cte_event
UNION ALL
SELECT
    cte_policy.topic,
    cte_policy.geo_coverage,
    cte_policy.search_text,
    cte_policy.json
FROM
    cte_policy
UNION ALL
SELECT
    cte_resource.topic,
    cte_resource.geo_coverage,
    cte_resource.search_text,
    cte_resource.json
FROM
    cte_resource
UNION ALL
SELECT
    cte_technology.topic,
    cte_technology.geo_coverage,
    cte_technology.search_text,
    cte_technology.json
FROM
    cte_technology
UNION ALL
SELECT
    cte_initiative.topic,
    cte_initiative.geo_coverage,
    cte_initiative.search_text,
    cte_initiative.json
FROM
    cte_initiative
UNION ALL
SELECT
    cte_stakeholder.topic,
    cte_stakeholder.geo_coverage,
    cte_stakeholder.search_text,
    cte_stakeholder.json
FROM
    cte_stakeholder
UNION ALL
SELECT
    cte_organisation.topic,
    cte_organisation.geo_coverage,
    cte_organisation.search_text,
    cte_organisation.json
FROM
    cte_organisation
),
cte_results AS (
--~ (#'gpml.sql-util/generate-filter-topic-snippet params)
)
--~ (#'gpml.sql-util/generate-get-topics params)
;

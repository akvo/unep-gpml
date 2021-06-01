DROP VIEW IF EXISTS v_topic;
-- EVENT
-- Drop V_EVENT_*

DROP VIEW IF EXISTS v_event;
DROP VIEW IF EXISTS v_event_data;
DROP VIEW IF EXISTS v_event_geo;
-- ;;

-- V_EVENT_DATA
CREATE VIEW v_event_data AS
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
    lang.languages,
    tag.tags
   FROM (((event e
     LEFT JOIN ( SELECT elu.event,
            json_agg(json_build_object('url', elu.url, 'iso_code', l.iso_code)) AS languages
           FROM (event_language_url elu
             JOIN language l ON ((elu.language = l.id)))
          GROUP BY elu.event) lang ON ((e.id = lang.event)))
     LEFT JOIN ( SELECT et.event,
            json_agg(t.tag) AS tags
           FROM (event_tag et
             JOIN tag t ON ((et.tag = t.id)))
          GROUP BY et.event) tag ON ((e.id = tag.event)))
     LEFT JOIN ( SELECT eg.event,
            json_agg(COALESCE(eg.country, eg.country_group, 0)) AS geo_coverage_values
           FROM event_geo_coverage eg
          GROUP BY eg.event) geo ON ((e.id = geo.event)))
  ORDER BY e.created;
-- ;;

-- V_EVENT_GEO
CREATE VIEW v_event_geo AS
SELECT e.id as id, coalesce(cgc.country,egc.country) AS geo_coverage
    FROM event e
    LEFT JOIN event_geo_coverage egc on e.id = egc.event
    LEFT JOIN country_group_country cgc ON cgc.country_group = egc.country_group
WHERE e.geo_coverage_type <> 'global'
UNION ALL
SELECT e.id as id, 0 AS geo_coverage
    FROM event e
    LEFT JOIN event_geo_coverage egc on e.id = egc.event
    LEFT JOIN country_group_country cgc ON cgc.country_group = egc.country_group
WHERE e.geo_coverage_type = 'global';
-- ;;

-- V_EVENT
CREATE VIEW v_event AS
SELECT 'event' AS topic, geo.geo_coverage, st.search_text, row_to_json(e) AS json
    FROM v_event_data e LEFT JOIN v_event_geo AS geo ON e.id = geo.id
    LEFT JOIN v_event_search_text st ON e.id = st.id
WHERE e.review_status = 'APPROVED'
ORDER BY e.created;
-- ;;

-- END EVENT

-- POLICY
-- Drop V_POLICY_*
DROP VIEW IF EXISTS v_policy;
DROP VIEW IF EXISTS v_policy_data;
DROP VIEW IF EXISTS v_policy_geo;

-- V_POLICY_DATA
CREATE VIEW v_policy_data AS
SELECT p.id,
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
    tag.tags
    FROM (((policy p
        LEFT JOIN (
            SELECT plu.policy,
            json_agg(json_build_object('url', plu.url, 'iso_code', l.iso_code)) AS languages
            FROM (policy_language_url plu
                JOIN language l ON ((plu.language = l.id)))
            GROUP BY plu.policy) lang ON ((p.id = lang.policy)))
        LEFT JOIN ( SELECT pt.policy,
            json_agg(t.tag) AS tags
            FROM (policy_tag pt
                JOIN tag t ON ((pt.tag = t.id)))
            GROUP BY pt.policy) tag ON ((p.id = tag.policy)))
        LEFT JOIN ( SELECT pg.policy,
            json_agg(COALESCE(pg.country, pg.country_group, 0)) AS geo_coverage_values
            FROM policy_geo_coverage pg
            GROUP BY pg.policy) geo ON ((p.id = geo.policy)))
    ORDER BY p.created;
-- ;;

-- V_POLICY_GEO
CREATE VIEW v_policy_geo AS
SELECT p.id as id, coalesce(cgc.country,pgc.country) AS geo_coverage
    FROM policy p
    LEFT JOIN policy_geo_coverage pgc on p.id = pgc.policy
    LEFT JOIN country_group_country cgc ON cgc.country_group = pgc.country_group
WHERE p.geo_coverage_type <> 'global'
UNION ALL
SELECT p.id as id, 0 AS geo_coverage
    FROM policy p
    LEFT JOIN policy_geo_coverage pgc on p.id = pgc.policy
    LEFT JOIN country_group_country cgc ON cgc.country_group = pgc.country_group
WHERE p.geo_coverage_type = 'global';
-- ;;

-- V_POLICY
CREATE VIEW v_policy AS
SELECT 'policy'::text AS topic,
    geo.geo_coverage,
    st.search_text,
    row_to_json(p.*) AS json
    FROM ((v_policy_data p
        LEFT JOIN v_policy_geo geo ON ((p.id = geo.id)))
        LEFT JOIN v_policy_search_text st ON ((p.id = st.id)))
    ORDER BY p.created;
-- ;;

-- END POLICY

-- INITIATIVE & PROJECT
-- Drop V_INIATIATIVE_* and V_PROJECT_*
DROP VIEW IF EXISTS v_project;
DROP VIEW IF EXISTS v_project_data;
DROP VIEW IF EXISTS v_project_geo;
DROP VIEW IF EXISTS v_initiative_data;
DROP VIEW IF EXISTS v_initiative_geo_coverage;

-- V_INITIATIVE_GEO
CREATE VIEW v_initiative_geo_coverage AS
SELECT i.id,
    lower(geo_cov_type.key) AS geo_coverage_type,
    NULL::json AS geo_coverage_values
    FROM (initiative i
        JOIN LATERAL jsonb_each_text(i.q24) geo_cov_type(key, value) ON (true))
    WHERE (geo_cov_type.key = 'Global'::text)
    GROUP BY i.id, geo_cov_type.value, geo_cov_type.key
UNION ALL
SELECT i.id,
    geo_cov_type.key AS geo_coverage_type,
    json_agg(cg.id) AS geo_coverage_values FROM (((initiative i
        JOIN LATERAL jsonb_each_text(i.q24) geo_cov_type(key, value) ON (true)
        JOIN LATERAL jsonb_array_elements(i.q24_1) regions(value) ON (true)
        JOIN LATERAL jsonb_each_text(regions.value) regions_text(key, value) ON (true)
        LEFT JOIN country_group cg ON regions_text.value = cg.name)))
    WHERE (geo_cov_type.key = 'regional'::text)
    OR (geo_cov_type.key = 'global with elements in specific areas'::text)
    GROUP BY i.id, geo_cov_type.value, geo_cov_type.key
UNION ALL
SELECT i.id,
    geo_cov_type.key AS geo_coverage_type,
    json_agg(c.id) AS geo_coverage_values
    FROM (((initiative i
        JOIN LATERAL jsonb_each_text(i.q24) geo_cov_type(key, value) ON (true))
        JOIN LATERAL jsonb_each_text(i.q24_2) countries(key, value) ON (true))
        LEFT JOIN country c ON ((c.id = (countries.key)::integer)))
    WHERE ((geo_cov_type.key = 'national'::text)
    OR (geo_cov_type.key = 'sub-national'::text))
    GROUP BY i.id, geo_cov_type.value, geo_cov_type.key
UNION ALL
SELECT i.id,
    geo_cov_type.key AS geo_coverage_type,
    json_agg(c.id) AS geo_coverage_values
    FROM ((((initiative i
        JOIN LATERAL jsonb_each_text(i.q24) geo_cov_type(key, value) ON (true))
        JOIN LATERAL jsonb_array_elements(i.q24_4) countries(value) ON (true))
        JOIN LATERAL jsonb_each_text(countries.value) countries_text(key, value) ON (true))
        LEFT JOIN country c ON ((c.id = (countries_text.key)::integer)))
    WHERE (geo_cov_type.key = 'transnational'::text)
    GROUP BY i.id, geo_cov_type.value, geo_cov_type.key;
-- ;;

-- V_INITIATIVE_DATA
CREATE VIEW v_initiative_data AS
SELECT i.id,
    NULL::text AS uuid,
    NULL::text AS phase,
    i.q36 AS funds,
    i.q37 AS contribution,
    i.created,
    i.modified,
    btrim((i.q2)::text, '"'::text) AS title,
    v_gc.geo_coverage_type,
    btrim((i.q3)::text, '"'::text) AS summary,
    i.reviewed_at,
    i.reviewed_by,
    i.review_status,
    btrim((i.q41_1)::text, '"'::text) AS url,
    NULL::text AS image,
    v_t.tags,
    v_gc.geo_coverage_values
    FROM ((initiative i
        LEFT JOIN v_initiative_tag v_t ON ((i.id = v_t.id)))
        LEFT JOIN v_initiative_geo_coverage v_gc ON ((i.id = v_gc.id)))
    ORDER BY i.created;
-- ;;

-- V_PROJECT_GEO
CREATE VIEW v_project_geo AS
SELECT p.id,
    geo.country AS geo_coverage
    FROM project p
    LEFT JOIN project_country geo ON (p.id = geo.project)
    WHERE ((p.geo_coverage_type = 'national'::geo_coverage_type)
        OR (p.geo_coverage_type = 'regional'::geo_coverage_type)
        OR (p.geo_coverage_type = 'transnational'::geo_coverage_type)
        OR (p.geo_coverage_type = 'sub-national'::geo_coverage_type))
UNION ALL
SELECT p.id, 0 AS geo_coverage
    FROM project p
    WHERE (p.geo_coverage_type = 'global'::geo_coverage_type);
-- ;;

-- V_PROJECT_DATA
CREATE VIEW v_project_data AS
SELECT p.id,
    p.uuid,
    p.phase,
    p.funds,
    p.contribution,
    p.created,
    p.modified,
    p.title,
    p.geo_coverage_type,
    p.summary,
    p.reviewed_at,
    p.reviewed_by,
    p.review_status,
    p.url,
    p.image,
    tag.tags,
    geo.geo_coverage_values
    FROM ((project p
        LEFT JOIN (SELECT pt.project, json_agg(t.tag) AS tags
            FROM (project_tag pt JOIN tag t ON ((pt.tag = t.id)))
            GROUP BY pt.project) tag ON ((p.id = tag.project)))
        LEFT JOIN ( SELECT pg.id,
            json_agg(pg.geo_coverage) AS geo_coverage_values
            FROM v_project_geo pg
            GROUP BY pg.id) geo ON ((p.id = geo.id)))
    ORDER BY p.created;
-- ;;

-- V_PROJECT
CREATE VIEW v_project AS
SELECT 'project'::text AS topic, geo_coverage, search_text, json
    FROM ((
        SELECT cgc.country AS geo_coverage,
            vst.search_text,
            to_json(i.*) AS json
        FROM v_initiative_data i
        JOIN LATERAL json_array_elements(i.geo_coverage_values) gid(value) ON (true)
        LEFT JOIN country_group cg ON cg.id = to_jsonb(gid.value)::int
        LEFT JOIN v_initiative_search_text vst ON vst.id = i.id
        JOIN country_group_country cgc ON cg.id = cgc.country_group
        WHERE ((i.geo_coverage_type = 'regional'::text)
            OR (i.geo_coverage_type = 'global with elements in specific areas'::text))
        ) UNION ALL (
        SELECT to_jsonb(gid.value)::int AS geo_coverage,
            vst.search_text,
            to_json(i.*) AS json
        FROM v_initiative_data i
        JOIN LATERAL json_array_elements(i.geo_coverage_values) gid(value) ON (true)
        LEFT JOIN v_initiative_search_text vst ON vst.id = i.id
        WHERE ((i.geo_coverage_type = 'national'::text)
            OR (i.geo_coverage_type = 'transnational'::text)
            OR (i.geo_coverage_type = 'sub-national'::text))
        ) UNION ALL (
        SELECT 0 AS geo_coverage,
        st.search_text, to_json(i.*) AS json
        FROM v_initiative_data i
        LEFT JOIN v_initiative_search_text st ON (i.id = st.id)
        WHERE i.geo_coverage_type = 'global'::text)) data
UNION ALL
SELECT 'project'::text AS topic, geo_coverage, search_text, json
    FROM ((
        SELECT vg.geo_coverage, vt.search_text, to_json(p.*) as json
        FROM v_project_data p
        LEFT JOIN v_project_search_text vt ON vt.id = p.id
        LEFT JOIN v_project_geo vg ON vg.id = p.id)) data;
-- ;;
-- END INITIATIVE & PROJECT

-- V_RESOURCE
-- Drop V_RESOURCE_*
DROP VIEW IF EXISTS v_resource;
DROP VIEW IF EXISTS v_resource_data;
DROP VIEW IF EXISTS v_resource_geo;

-- V_RESOURCE_GEO
CREATE VIEW v_resource_geo AS
SELECT r.id as id, coalesce(cgc.country,rgc.country) AS geo_coverage
    FROM resource r
    LEFT JOIN resource_geo_coverage rgc on r.id = rgc.resource
    LEFT JOIN country_group_country cgc ON cgc.country_group = rgc.country_group
WHERE r.geo_coverage_type <> 'global'
UNION ALL
SELECT r.id as id, 0 AS geo_coverage
    FROM resource r
WHERE r.geo_coverage_type = 'global';
-- ;;

-- V_RESOURCE_DATA
CREATE VIEW v_resource_data AS
SELECT r.id,
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
    r.created_by,
    geo.geo_coverage_values,
    lang.languages,
    tag.tags,
    orgs.organisations
FROM ((((resource r
    LEFT JOIN (
        SELECT rlu.resource,
            json_agg(json_build_object('url', rlu.url, 'iso_code', l.iso_code)) AS languages
        FROM (resource_language_url rlu JOIN language l ON ((rlu.language = l.id)))
        GROUP BY rlu.resource) lang ON ((r.id = lang.resource)))
    LEFT JOIN (
        SELECT rt.resource,
            json_agg(t.tag) AS tags
        FROM (resource_tag rt JOIN tag t ON ((rt.tag = t.id)))
        GROUP BY rt.resource) tag ON ((r.id = tag.resource)))
    LEFT JOIN (
        SELECT rg.resource,
            json_agg(COALESCE(rg.country, rg.country_group, 0)) AS geo_coverage_values
        FROM resource_geo_coverage rg
        GROUP BY rg.resource) geo ON ((r.id = geo.resource))
    )
    LEFT JOIN (
        SELECT ro.resource,
            json_agg(json_build_object('id', o.id, 'name', o.name)) AS organisations
        FROM (resource_organisation ro
            LEFT JOIN organisation o ON ((ro.organisation = o.id)))
            GROUP BY ro.resource) orgs ON ((r.id = orgs.resource)))
ORDER BY r.created;
-- ;;

-- V_RESOURCE
CREATE VIEW v_resource AS
SELECT replace(lower(r.type), ' '::text, '_'::text) AS topic,
    geo.geo_coverage,
    st.search_text,
    row_to_json(r.*) AS json
FROM ((v_resource_data r
LEFT JOIN v_resource_geo geo ON ((r.id = geo.id)))
LEFT JOIN v_resource_search_text st ON ((r.id = st.id)))
WHERE (r.type IS NOT NULL)
ORDER BY r.created;
--;;
-- END RESOURCE

-- TECHNOLOGY
-- Drop V_TECHNOLOGY_*
DROP VIEW IF EXISTS v_technology;
DROP VIEW IF EXISTS v_technology_data;
DROP VIEW IF EXISTS v_technology_geo;

-- V_TECHNOLOGY_GEO
CREATE VIEW v_technology_geo AS
SELECT t.id as id, coalesce(cgc.country,tgc.country) AS geo_coverage
    FROM technology t
    LEFT JOIN technology_geo_coverage tgc on t.id = tgc.technology
    LEFT JOIN country_group_country cgc ON cgc.country_group = tgc.country_group
WHERE t.geo_coverage_type <> 'global'
UNION ALL
SELECT t.id as id, 0 AS geo_coverage
    FROM technology t
WHERE t.geo_coverage_type = 'global';
--;;

-- V_TECHNOLOGY_DATA
CREATE VIEW v_technology_data AS
SELECT t.id,
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
    tag.tags
FROM (((technology t
    LEFT JOIN (
        SELECT tlu.technology,
        json_agg(json_build_object('url', tlu.url, 'iso_code', l.iso_code)) AS languages
        FROM ( technology_language_url tlu JOIN language l ON ((tlu.language = l.id)))
        GROUP BY tlu.technology) lang ON ((t.id = lang.technology)))
    LEFT JOIN (
        SELECT tt.technology,
        json_agg(t_1.tag) AS tags
        FROM (technology_tag tt JOIN tag t_1 ON ((tt.tag = t_1.id)))
        GROUP BY tt.technology) tag ON ((t.id = tag.technology)))
    LEFT JOIN ( SELECT tg.technology,
        json_agg(COALESCE(tg.country, tg.country_group, 0)) AS geo_coverage_values
        FROM technology_geo_coverage tg
        GROUP BY tg.technology) geo ON ((t.id = geo.technology)))
ORDER BY t.created;
-- ;;

-- V_TECHNOLOGY
CREATE VIEW v_technology AS
SELECT 'technology'::text AS topic,
    geo.geo_coverage,
    st.search_text,
    row_to_json(t.*) AS json
    FROM ((v_technology_data t
        LEFT JOIN v_technology_geo geo ON ((t.id = geo.id)))
        LEFT JOIN v_technology_search_text st ON ((t.id = st.id)))
ORDER BY t.created;
-- ;;
-- END TECHNOLOGY

-- STAKEHOLDER
-- Drop V_STAKEHOLDER_*
DROP VIEW IF EXISTS v_stakeholder;
DROP VIEW IF EXISTS v_stakeholder_data;
DROP VIEW IF EXISTS v_stakeholder_geo;

-- V_STAKEHOLDER_GEO
CREATE VIEW v_stakeholder_geo AS
SELECT s.id as id, coalesce(cgc.country,sgc.country) AS geo_coverage
    FROM stakeholder s
    LEFT JOIN stakeholder_geo_coverage sgc on s.id = sgc.stakeholder
    LEFT JOIN country_group_country cgc ON cgc.country_group = sgc.country_group
WHERE s.geo_coverage_type <> 'global'
UNION ALL
SELECT s.id as id, 0 AS geo_coverage
    FROM stakeholder s
WHERE s.geo_coverage_type = 'global';
-- ;;

-- V_STAKEHOLDER_DATA
CREATE VIEW v_stakeholder_data AS
SELECT s.id,
    s.picture,
    s.title,
    s.first_name,
    s.last_name,
        CASE
            WHEN (s.public_email = true) THEN s.email
            ELSE ''::text
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
    geo.geo_coverage_values,
    row_to_json(o.*) AS affiliation,
    tag.tags
FROM ((((stakeholder s
    LEFT JOIN (
        SELECT st.stakeholder,
        json_agg(t.tag) AS tags
        FROM (stakeholder_tag st JOIN tag t ON ((st.tag = t.id)))
        GROUP BY st.stakeholder) tag ON ((s.id = tag.stakeholder)))
    LEFT JOIN (
        SELECT sg.stakeholder,
        json_agg(COALESCE(sg.country, sg.country_group, 0)) AS geo_coverage_values
        FROM stakeholder_geo_coverage sg
        GROUP BY sg.stakeholder) geo ON ((s.id = geo.stakeholder))))
    LEFT JOIN organisation o ON ((s.affiliation = o.id)))
ORDER BY s.created;
-- ;;

-- V_STAKEHOLDER
CREATE VIEW v_stakeholder AS
SELECT 'stakeholder'::text AS topic,
    geo.geo_coverage,
    st.search_text,
    row_to_json(s.*) AS json
FROM ((v_stakeholder_data s
    LEFT JOIN v_stakeholder_geo geo ON ((s.id = geo.id)))
    LEFT JOIN v_stakeholder_search_text st ON ((s.id = st.id)))
WHERE (s.review_status = 'APPROVED'::review_status)
ORDER BY s.created;
-- ;;
-- END STAKEHOLDER

-- ORGANISATION
-- Drop V_ORGANISATION_*
DROP VIEW IF EXISTS v_organisation;
DROP VIEW IF EXISTS v_organisation_data;
DROP VIEW IF EXISTS v_organisation_geo;

-- V_ORGANISATION_GEO
CREATE VIEW v_organisation_geo AS
SELECT o.id as id, coalesce(cgc.country,ogc.country) AS geo_coverage
    FROM organisation o
    LEFT JOIN organisation_geo_coverage ogc on o.id = ogc.organisation
    LEFT JOIN country_group_country cgc ON cgc.country_group = ogc.country_group
WHERE o.geo_coverage_type <> 'global'
UNION ALL
SELECT o.id as id, 0 AS geo_coverage
    FROM organisation o
WHERE o.geo_coverage_type = 'global';
-- ;;

-- V_ORGANISATION_DATA
CREATE VIEW v_organisation_data AS
SELECT o.id,
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
    geo.geo_coverage_values
FROM (organisation o
    LEFT JOIN (
        SELECT og.organisation,
        json_agg(COALESCE(og.country, og.country_group, 0)) AS geo_coverage_values
        FROM organisation_geo_coverage og
        GROUP BY og.organisation) geo ON (o.id = geo.organisation));
-- ;;

-- V_ORGANISATION
CREATE VIEW v_organisation AS
SELECT 'organisation'::text AS topic,
    geo.geo_coverage,
    ot.search_text,
    row_to_json(o.*) AS json
FROM ((v_organisation_data o
    LEFT JOIN v_organisation_geo geo ON ((o.id = geo.id)))
    LEFT JOIN v_organisation_search_text ot ON ((o.id = ot.id)))
WHERE (o.review_status = 'APPROVED'::review_status);
-- ;;
-- END ORGANISATION




--- # ALL
CREATE VIEW v_topic AS
SELECT * FROM v_event
UNION ALL
SELECT * FROM v_policy
UNION ALL
SELECT * FROM v_project
UNION ALL
SELECT * FROM v_resource
UNION ALL
SELECT * FROM v_technology
UNION ALL
SELECT * FROM v_organisation
UNION ALL
SELECT * FROM v_stakeholder;
-- ;;

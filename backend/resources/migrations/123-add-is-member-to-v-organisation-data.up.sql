DROP VIEW v_organisation_data CASCADE;
--;;
CREATE VIEW v_organisation_data
 AS
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
    o.is_member,
    geo.geo_coverage_values
   FROM (organisation o
     LEFT JOIN ( SELECT og.organisation,
            json_agg(COALESCE(c.iso_code, (cg.name)::bpchar)) AS geo_coverage_values
           FROM ((organisation_geo_coverage og
             LEFT JOIN country c ON ((og.country = c.id)))
             LEFT JOIN country_group cg ON ((og.country_group = cg.id)))
          GROUP BY og.organisation) geo ON ((o.id = geo.organisation)));
-- ;;
CREATE VIEW v_organisation AS
 SELECT 'organisation'::text AS topic,
    geo.geo_coverage,
    ot.search_text,
    row_to_json(o.*) AS json
   FROM ((v_organisation_data o
     LEFT JOIN v_organisation_geo geo ON ((o.id = geo.id)))
     LEFT JOIN v_organisation_search_text ot ON ((o.id = ot.id)));
-- ;;
CREATE VIEW v_topic AS
 SELECT v_event.topic,
    v_event.geo_coverage,
    v_event.search_text,
    v_event.json
   FROM v_event
UNION ALL
 SELECT v_policy.topic,
    v_policy.geo_coverage,
    v_policy.search_text,
    v_policy.json
   FROM v_policy
UNION ALL
 SELECT v_resource.topic,
    v_resource.geo_coverage,
    v_resource.search_text,
    v_resource.json
   FROM v_resource
UNION ALL
 SELECT v_technology.topic,
    v_technology.geo_coverage,
    v_technology.search_text,
    v_technology.json
   FROM v_technology
UNION ALL
 SELECT v_project.topic,
    v_project.geo_coverage,
    v_project.search_text,
    v_project.json
   FROM v_project
UNION ALL
 SELECT v_stakeholder.topic,
    v_stakeholder.geo_coverage,
    v_stakeholder.search_text,
    v_stakeholder.json
   FROM v_stakeholder
UNION ALL
 SELECT v_organisation.topic,
    v_organisation.geo_coverage,
    v_organisation.search_text,
    v_organisation.json
   FROM v_organisation;
--;;
CREATE VIEW v_topic_all AS
 SELECT v_event.topic,
    v_event.geo_coverage,
    v_event.search_text,
    v_event.json
   FROM v_event
UNION ALL
 SELECT v_policy.topic,
    v_policy.geo_coverage,
    v_policy.search_text,
    v_policy.json
   FROM v_policy
UNION ALL
 SELECT v_project.topic,
    v_project.geo_coverage,
    v_project.search_text,
    v_project.json
   FROM v_project
UNION ALL
 SELECT v_resource.topic,
    v_resource.geo_coverage,
    v_resource.search_text,
    v_resource.json
   FROM v_resource
UNION ALL
 SELECT v_technology.topic,
    v_technology.geo_coverage,
    v_technology.search_text,
    v_technology.json
   FROM v_technology
UNION ALL
 SELECT v_organisation.topic,
    v_organisation.geo_coverage,
    v_organisation.search_text,
    v_organisation.json
   FROM v_organisation
UNION ALL
 SELECT v_stakeholder.topic,
    v_stakeholder.geo_coverage,
    v_stakeholder.search_text,
    v_stakeholder.json
   FROM v_stakeholder;

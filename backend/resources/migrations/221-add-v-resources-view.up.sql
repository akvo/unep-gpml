-- NOTE: `layers`, `files`, `files_related_morphs` are strapi tables. We query them using `postgres_fdw`

DROP FUNCTION IF EXISTS dataset_date_from (text) CASCADE;
--;;

DROP FUNCTION IF EXISTS dataset_date_to (text) CASCADE;
--;;

CREATE OR REPLACE FUNCTION dataset_date_from (time_period text)
  RETURNS date
  LANGUAGE plpgsql
  IMMUTABLE
  AS $function$
BEGIN
  -- `time_period` expected in format 'YYYY-YYYY', e.g. '2017-2021'
  IF length(trim(time_period)) = 0 THEN
    RETURN NULL;
  END IF;
  RETURN to_date(trim(split_part(trim(time_period), '-', 1)), 'YYYY');
END;
$function$;
--;;

CREATE OR REPLACE FUNCTION dataset_date_to (time_period text)
  RETURNS date
  LANGUAGE plpgsql
  IMMUTABLE
  AS $function$
DECLARE
  year_to text;
BEGIN
  -- `time_period` expected in format 'YYYY-YYYY', e.g. '2017-2021'
  -- We know that there are rows with only starting year 'YYYY'
  IF length(trim(time_period)) = 0 THEN
    RETURN NULL;
  END IF;
  year_to := trim(split_part(trim(time_period), '-', 2));
  IF length(year_to) = 0 THEN
    year_to := trim(split_part(trim(time_period), '-', 1));
  END IF;
  RETURN make_date(year_to::int, 12, 31);
END;
$function$;
--;;

DROP VIEW IF EXISTS v_resources;
--;;

CREATE VIEW v_resources AS
(
-- technical_resource, financing_resource, action_plan
WITH resource_publisher AS (
  SELECT
    or2.resource,
    string_agg(trim(o.name), ',') AS publisher
  FROM
    organisation_resource or2
    JOIN organisation o ON or2.organisation = o.id
  WHERE
    or2.association = 'owner'::resource_association
  GROUP BY
    or2.resource
),
resource_partner AS (
  SELECT
    or2.resource,
    string_agg(trim(o.name), ',') AS partner
  FROM
    organisation_resource or2
    JOIN organisation o ON or2.organisation = o.id
  WHERE
    or2.association = 'partner'::resource_association
  GROUP BY
    or2.resource
),
resource_tag AS (
  SELECT
    rt.resource,
    string_agg(t.tag, ',') AS tag
  FROM
    resource_tag rt,
    tag t
  WHERE
    rt.tag = t.id
    AND t.review_status = 'APPROVED'::review_status
  GROUP BY
    rt.resource
),
resource_country_group AS (
  SELECT
    rgc.resource,
    string_agg(cg.name, ',') AS country_group
  FROM
    resource_geo_coverage rgc
    LEFT JOIN country_group cg ON rgc.country_group = cg.id
  GROUP BY
    rgc.resource
),
resource_country AS (
  SELECT
    resource,
    string_agg(country, ',') AS country
  FROM (
    SELECT
      rgc.resource,
      coalesce(cg.country, c2.name) AS country
    FROM
      resource_geo_coverage rgc
    LEFT JOIN (
      SELECT
        cg.id AS id,
        c.name AS country
      FROM
        country_group cg,
        country_group_country cgc,
        country c
      WHERE
        cg.id = cgc.country_group
        AND cgc.country = c.id) cg ON rgc.country_group = cg.id
    LEFT JOIN country c2 ON rgc.country = c2.id) geo
GROUP BY
  resource
),
resource_json AS (
  SELECT
    r.id AS resource,
    jsonb_build_object('id', r.id, 'title', r.title, 'type', replace(lower(r.type), ' ', '_'), 'images', json_agg(DISTINCT jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility)) FILTER (WHERE f.id IS NOT NULL)) AS json
FROM
  resource r
  LEFT JOIN file f ON r.thumbnail_id = f.id
GROUP BY
  r.id
)
SELECT
  r.id,
  replace(lower(type), ' ', '_') AS type,
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '')) AS search_text,
  to_date(valid_from, 'YYYY-MM-DD') AS valid_from,
  to_date(
    CASE WHEN valid_to = 'Ongoing' THEN
      '9999-12-31'
    ELSE
      valid_to
    END, 'YYYY-MM-DD') AS valid_to,
  rt.tag,
  rc.country,
  rcg.country_group,
  rp.publisher,
  rpp.partner,
  rj.json
FROM
  resource r
  LEFT JOIN resource_tag rt ON r.id = rt.resource
  LEFT JOIN resource_publisher rp ON r.id = rp.resource
  LEFT JOIN resource_country rc ON r.id = rc.resource
  LEFT JOIN resource_country_group rcg ON r.id = rcg.resource
  LEFT JOIN resource_partner rpp ON r.id = rpp.resource
  LEFT JOIN resource_json rj ON r.id = rj.resource
WHERE
  r.review_status = 'APPROVED'::review_status
ORDER BY
  r.id
)
UNION ALL
(
-- stakeholder
WITH stakeholder_tag AS (
  SELECT
    st.stakeholder,
    string_agg(t.tag, ',') AS tag
  FROM
    stakeholder_tag st,
    tag t
  WHERE
    st.tag = t.id
    AND t.review_status = 'APPROVED'::review_status
  GROUP BY
    st.stakeholder
),
stakeholder_country_group AS (
  SELECT
    sgc.stakeholder,
    string_agg(cg.name, ',') AS country_group
  FROM
    stakeholder_geo_coverage sgc
    LEFT JOIN country_group cg ON sgc.country_group = cg.id
  GROUP BY
    sgc.stakeholder
),
stakeholder_country AS (
  SELECT
    stakeholder,
    string_agg(country, ',') AS country
  FROM (
    SELECT
      sgc.stakeholder,
      coalesce(cg.country, c2.name) AS country
    FROM
      stakeholder_geo_coverage sgc
    LEFT JOIN (
      SELECT
        cg.id AS id,
        c.name AS country
      FROM
        country_group cg,
        country_group_country cgc,
        country c
      WHERE
        cg.id = cgc.country_group
        AND cgc.country = c.id) cg ON sgc.country_group = cg.id
    LEFT JOIN country c2 ON sgc.country = c2.id) geo
GROUP BY
  stakeholder
),
stakeholder_json AS (
SELECT
  s.id AS stakeholder,
  jsonb_build_object('id', s.id, 'first_name', s.first_name, 'last_name', s.last_name, 'type', 'stakeholder', 'images', json_agg(DISTINCT jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility)) FILTER (WHERE f.id IS NOT NULL)) AS json
FROM
  stakeholder s
  LEFT JOIN file f ON s.picture_id = f.id
GROUP BY
  s.id
)
SELECT
  s.id,
  'stakeholder' AS type,
  to_tsvector('english', coalesce(s.about, '')) AS search_text,
  to_date('1970-01-01', 'YYYY-MM-DD') AS valid_from,
  to_date('9999-12-31', 'YYYY-MM-DD') AS valid_to,
  st.tag,
  sc.country,
  scg.country_group,
  NULL AS publisher,
  NULL AS partner,
  sj.json
FROM
  stakeholder s
  LEFT JOIN stakeholder_country sc ON s.id = sc.stakeholder
  LEFT JOIN stakeholder_tag st ON s.id = st.stakeholder
  LEFT JOIN stakeholder_country_group scg ON s.id = scg.stakeholder
  LEFT JOIN stakeholder_json sj ON s.id = sj.stakeholder
WHERE
  s.review_status = 'APPROVED'::review_status
ORDER BY
  s.id
)
UNION ALL
(
-- organisation
WITH organisation_country AS (
  SELECT
    organisation,
    string_agg(country, ',') AS country
  FROM (
    SELECT
      ogc.organisation,
      coalesce(cg.country, c2.name) AS country
    FROM
      organisation_geo_coverage ogc
    LEFT JOIN (
      SELECT
        cg.id AS id,
        c.name AS country
      FROM
        country_group cg,
        country_group_country cgc,
        country c
      WHERE
        cg.id = cgc.country_group
        AND cgc.country = c.id) cg ON ogc.country_group = cg.id
    LEFT JOIN country c2 ON ogc.country = c2.id) geo
GROUP BY
  organisation
),
organisation_country_group AS (
  SELECT
    ogc.organisation,
    string_agg(cg.name, ',') AS country_group
FROM
  organisation_geo_coverage ogc
  LEFT JOIN country_group cg ON ogc.country_group = cg.id
GROUP BY
  ogc.organisation
),
organisation_tag AS (
  SELECT
    ot.organisation,
    string_agg(t.tag, ',') AS tag
FROM
  organisation_tag ot,
  tag t
  WHERE
    ot.tag = t.id
    AND t.review_status = 'APPROVED'::review_status
  GROUP BY
    ot.organisation
),
organisation_json AS (
  SELECT
    o.id AS organisation,
    jsonb_build_object('id', o.id, 'name', o.name, 'type', 'organisation', 'images', json_agg(DISTINCT jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility)) FILTER (WHERE f.id IS NOT NULL)) AS json
FROM
  organisation o
  LEFT JOIN file f ON o.logo_id = f.id
GROUP BY
  o.id
)
SELECT
  o.id,
  'organisation' AS type,
  to_tsvector('english', o.name || ' ' || coalesce(o.program, '')) AS search_text,
  to_date('1970-01-01', 'YYYY-MM-DD') AS valid_from,
  to_date('9999-12-31', 'YYYY-MM-DD') AS valid_to,
  ot.tag,
  oc.country,
  ocg.country_group,
  NULL AS publisher,
  NULL AS partner,
  oj.json
FROM
  organisation o
  LEFT JOIN organisation_tag ot ON o.id = ot.organisation
  LEFT JOIN organisation_country oc ON o.id = oc.organisation
  LEFT JOIN organisation_country_group ocg ON o.id = ocg.organisation
  LEFT JOIN organisation_json oj ON o.id = oj.organisation
WHERE
  o.review_status = 'APPROVED'::review_status
ORDER BY
  o.id
)
UNION ALL
(
-- event
WITH event_publisher AS (
  SELECT
    or2.event,
    string_agg(trim(o.name), ',') AS publisher
  FROM
    organisation_event or2
    JOIN organisation o ON or2.organisation = o.id
  WHERE
    or2.association = 'owner'::event_association
  GROUP BY
    or2.event
),
event_partner AS (
  SELECT
    or2.event,
    string_agg(trim(o.name), ',') AS partner
  FROM
    organisation_event or2
    JOIN organisation o ON or2.organisation = o.id
  WHERE
    or2.association = 'partner'::event_association
  GROUP BY
    or2.event
),
event_tag AS (
  SELECT
    rt.event,
    string_agg(t.tag, ',') AS tag
  FROM
    event_tag rt,
    tag t
  WHERE
    rt.tag = t.id
    AND t.review_status = 'APPROVED'::review_status
  GROUP BY
    rt.event
),
event_country_group AS (
  SELECT
    rgc.event,
    string_agg(cg.name, ',') AS country_group
  FROM
    event_geo_coverage rgc
    LEFT JOIN country_group cg ON rgc.country_group = cg.id
  GROUP BY
    rgc.event
),
event_country AS (
  SELECT
    event,
    string_agg(country, ',') AS country
  FROM (
    SELECT
      rgc.event,
      coalesce(cg.country, c2.name) AS country
    FROM
      event_geo_coverage rgc
    LEFT JOIN (
      SELECT
        cg.id AS id,
        c.name AS country
      FROM
        country_group cg,
        country_group_country cgc,
        country c
      WHERE
        cg.id = cgc.country_group
        AND cgc.country = c.id) cg ON rgc.country_group = cg.id
    LEFT JOIN country c2 ON rgc.country = c2.id) geo
GROUP BY
  event
),
event_json AS (
SELECT
  e.id AS event,
  jsonb_build_object('id', e.id, 'title', e.title, 'type', 'event', 'images', json_agg(DISTINCT jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility)) FILTER (WHERE f.id IS NOT NULL)) AS json
FROM
  event e
  LEFT JOIN file f ON e.image_id = f.id
GROUP BY
  e.id
)
SELECT
  e.id,
  'event' AS type,
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')) AS search_text,
  start_date::date AS valid_from,
  end_date::date AS valid_to,
  et.tag,
  ec.country,
  ecg.country_group,
  ep.publisher,
  epp.partner,
  ej.json
FROM
  event e
  LEFT JOIN event_tag et ON e.id = et.event
  LEFT JOIN event_publisher ep ON e.id = ep.event
  LEFT JOIN event_country ec ON e.id = ec.event
  LEFT JOIN event_country_group ecg ON e.id = ecg.event
  LEFT JOIN event_partner epp ON e.id = epp.event
  LEFT JOIN event_json ej ON e.id = ej.event
WHERE
  e.review_status = 'APPROVED'::review_status
ORDER BY
  e.id
)
UNION ALL
(
-- technology
WITH technology_publisher AS (
  SELECT
    or2.technology,
    string_agg(trim(o.name), ',') AS publisher
  FROM
    organisation_technology or2
    JOIN organisation o ON or2.organisation = o.id
  WHERE
    or2.association = 'owner'::technology_association
  GROUP BY
    or2.technology
),
technology_partner AS (
  SELECT
    or2.technology,
    string_agg(trim(o.name), ',') AS partner
  FROM
    organisation_technology or2
    JOIN organisation o ON or2.organisation = o.id
  WHERE
    or2.association = 'partner'::technology_association
  GROUP BY
    or2.technology
),
technology_tag AS (
  SELECT
    rt.technology,
    string_agg(t.tag, ',') AS tag
  FROM
    technology_tag rt,
    tag t
  WHERE
    rt.tag = t.id
    AND t.review_status = 'APPROVED'::review_status
  GROUP BY
    rt.technology
),
technology_country_group AS (
  SELECT
    rgc.technology,
    string_agg(cg.name, ',') AS country_group
  FROM
    technology_geo_coverage rgc
    LEFT JOIN country_group cg ON rgc.country_group = cg.id
  GROUP BY
    rgc.technology
),
technology_country AS (
  SELECT
    technology,
    string_agg(country, ',') AS country
  FROM (
    SELECT
      rgc.technology,
      coalesce(cg.country, c2.name) AS country
    FROM
      technology_geo_coverage rgc
    LEFT JOIN (
      SELECT
        cg.id AS id,
        c.name AS country
      FROM
        country_group cg,
        country_group_country cgc,
        country c
      WHERE
        cg.id = cgc.country_group
        AND cgc.country = c.id) cg ON rgc.country_group = cg.id
    LEFT JOIN country c2 ON rgc.country = c2.id) geo
GROUP BY
  technology
),
technology_json AS (
SELECT
  t.id AS technology,
  jsonb_build_object('id', t.id, 'title', t.name, 'type', 'technology', 'images', json_agg(DISTINCT jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility)) FILTER (WHERE f.id IS NOT NULL)) AS json
FROM
  technology t
  LEFT JOIN file f ON t.image_id = f.id
GROUP BY
  t.id
)
SELECT
  t.id,
  'technology' AS type,
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(remarks, '')) AS search_text,
  to_date(to_char(year_founded, '9999'), 'YYYY') AS valid_from,
  to_date('9999-12-31', 'YYYY-MM-DD') AS valid_to,
  tt.tag,
  tc.country,
  tcg.country_group,
  tp.publisher,
  tpp.partner,
  tj.json
FROM
  technology t
  LEFT JOIN technology_tag tt ON t.id = tt.technology
  LEFT JOIN technology_publisher tp ON t.id = tp.technology
  LEFT JOIN technology_country tc ON t.id = tc.technology
  LEFT JOIN technology_country_group tcg ON t.id = tcg.technology
  LEFT JOIN technology_partner tpp ON t.id = tpp.technology
  LEFT JOIN technology_json tj ON t.id = tj.technology
WHERE
  t.review_status = 'APPROVED'::review_status
ORDER BY
  t.id
)
UNION ALL
(
-- policy
WITH policy_publisher AS (
  SELECT
    or2.policy,
    string_agg(trim(o.name), ',') AS publisher
  FROM
    organisation_policy or2
    JOIN organisation o ON or2.organisation = o.id
  WHERE
    or2.association = 'owner'::policy_association
  GROUP BY
    or2.policy
),
policy_partner AS (
  SELECT
    or2.policy,
    string_agg(trim(o.name), ',') AS partner
  FROM
    organisation_policy or2
    JOIN organisation o ON or2.organisation = o.id
  WHERE
    or2.association = 'partner'::policy_association
  GROUP BY
    or2.policy
),
policy_tag AS (
  SELECT
    rt.policy,
    string_agg(t.tag, ',') AS tag
  FROM
    policy_tag rt,
    tag t
  WHERE
    rt.tag = t.id
    AND t.review_status = 'APPROVED'::review_status
  GROUP BY
    rt.policy
),
policy_country_group AS (
  SELECT
    rgc.policy,
    string_agg(cg.name, ',') AS country_group
  FROM
    policy_geo_coverage rgc
    LEFT JOIN country_group cg ON rgc.country_group = cg.id
  GROUP BY
    rgc.policy
),
policy_country AS (
  SELECT
    policy,
    string_agg(country, ',') AS country
  FROM (
    SELECT
      rgc.policy,
      coalesce(cg.country, c2.name) AS country
    FROM
      policy_geo_coverage rgc
    LEFT JOIN (
      SELECT
        cg.id AS id,
        c.name AS country
      FROM
        country_group cg,
        country_group_country cgc,
        country c
      WHERE
        cg.id = cgc.country_group
        AND cgc.country = c.id) cg ON rgc.country_group = cg.id
    LEFT JOIN country c2 ON rgc.country = c2.id) geo
GROUP BY
  policy
),
policy_json AS (
SELECT
  p.id AS policy,
  jsonb_build_object('id', p.id, 'title', p.title, 'type', 'policy', 'images', json_agg(DISTINCT jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility)) FILTER (WHERE f.id IS NOT NULL)) AS json
  FROM policy p
  LEFT JOIN file f ON f.id IN (p.thumbnail_id, p.image_id)
  GROUP BY
    p.id
)
SELECT
  p.id,
  'policy' AS type,
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(abstract , '')) AS search_text,
  to_date('1970-01-01','YYYY-MM-DD') AS valid_from,
  to_date('9999-12-31','YYYY-MM-DD') AS valid_to,
  pt.tag,
  pc.country,
  pcg.country_group,
  pp.publisher,
  ppp.partner,
  pj.json
FROM
  policy p
  LEFT JOIN policy_tag pt ON p.id = pt.policy
  LEFT JOIN policy_publisher pp ON p.id = pp.policy
  LEFT JOIN policy_country pc ON p.id = pc.policy
  LEFT JOIN policy_country_group pcg ON p.id = pcg.policy
  LEFT JOIN policy_partner ppp ON p.id = ppp.policy
  LEFT JOIN policy_json pj ON p.id = pj.policy
WHERE
 p.review_status = 'APPROVED'::review_status
ORDER BY
  p.id
)
UNION ALL
(
-- initiative (a.k.a. projects)
WITH initiative_publisher AS (
  SELECT
    or2.initiative,
    string_agg(trim(o.name), ',') AS publisher
  FROM
    organisation_initiative or2
    JOIN organisation o ON or2.organisation = o.id
  WHERE
    or2.association = 'owner'::initiative_association
  GROUP BY
    or2.initiative
),
initiative_partner AS (
  SELECT
    or2.initiative,
    string_agg(trim(o.name), ',') AS partner
  FROM
    organisation_initiative or2
    JOIN organisation o ON or2.organisation = o.id
  WHERE
    or2.association = 'partner'::initiative_association
  GROUP BY
    or2.initiative
),
initiative_tag AS (
  SELECT
    rt.initiative,
    string_agg(t.tag, ',') AS tag
  FROM
    initiative_tag rt,
    tag t
  WHERE
    rt.tag = t.id
    AND t.review_status = 'APPROVED'::review_status
  GROUP BY
    rt.initiative
),
initiative_country_group AS (
  SELECT
    rgc.initiative,
    string_agg(cg.name, ',') AS country_group
  FROM
    initiative_geo_coverage rgc
    LEFT JOIN country_group cg ON rgc.country_group = cg.id
  GROUP BY
    rgc.initiative
),
initiative_country AS (
  SELECT
    initiative,
    string_agg(country, ',') AS country
  FROM (
    SELECT
      rgc.initiative,
      coalesce(cg.country, c2.name) AS country
    FROM
      initiative_geo_coverage rgc
    LEFT JOIN (
      SELECT
        cg.id AS id,
        c.name AS country
      FROM
        country_group cg,
        country_group_country cgc,
        country c
      WHERE
        cg.id = cgc.country_group
        AND cgc.country = c.id) cg ON rgc.country_group = cg.id
    LEFT JOIN country c2 ON rgc.country = c2.id) geo
GROUP BY
  initiative
),
initiative_json AS (
  SELECT
    i.id AS initiative,
    jsonb_build_object('id', i.id, 'title', btrim((i.q2)::text, '\"'::text), 'type', 'initiative', 'images', json_agg(DISTINCT jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility)) FILTER (WHERE f.id IS NOT NULL)) AS json
  FROM
    initiative i
    LEFT JOIN file f ON f.id IN (i.thumbnail_id, i.image_id)
  GROUP BY
    i.id
)
SELECT
  i.id,
  'initiative' AS type,
  to_tsvector('english', coalesce(btrim((i.q2)::text, '\"'::text), '') || ' ' || coalesce(btrim((i.q3)::text, '\"'::text), '')) AS search_text,
  to_date('1970-01-01', 'YYYY-MM-DD') AS valid_from,
  to_date('9999-12-31', 'YYYY-MM-DD') AS valid_to,
  it.tag,
  ic.country,
  icg.country_group,
  ip.publisher,
  ipp.partner,
  ij.json
FROM
  initiative i
  LEFT JOIN initiative_tag it ON i.id = it.initiative
  LEFT JOIN initiative_publisher ip ON i.id = ip.initiative
  LEFT JOIN initiative_country ic ON i.id = ic.initiative
  LEFT JOIN initiative_country_group icg ON i.id = icg.initiative
  LEFT JOIN initiative_partner ipp ON i.id = ipp.initiative
  LEFT JOIN initiative_json ij ON i.id = ij.initiative
WHERE
  i.review_status = 'APPROVED'::review_status
ORDER BY
  i.id
)
UNION ALL
(
-- case_study
WITH case_study_publisher AS (
  SELECT
    or2.case_study,
    string_agg(trim(o.name), ',') AS publisher
  FROM
    organisation_case_study or2
    JOIN organisation o ON or2.organisation = o.id
  WHERE
    or2.association = 'owner'::case_study_association
  GROUP BY
    or2.case_study
),
case_study_partner AS (
  SELECT
    or2.case_study,
    string_agg(trim(o.name), ',') AS partner
  FROM
    organisation_case_study or2
    JOIN organisation o ON or2.organisation = o.id
  WHERE
    or2.association = 'partner'::case_study_association
  GROUP BY
    or2.case_study
),
case_study_tag AS (
  SELECT
    rt.case_study,
    string_agg(t.tag, ',') AS tag
  FROM
    case_study_tag rt,
    tag t
  WHERE
    rt.tag = t.id
    AND t.review_status = 'APPROVED'::review_status
  GROUP BY
    rt.case_study
),
case_study_country_group AS (
  SELECT
    rgc.case_study,
    string_agg(cg.name, ',') AS country_group
  FROM
    case_study_geo_coverage rgc
    LEFT JOIN country_group cg ON rgc.country_group = cg.id
  GROUP BY
    rgc.case_study
),
case_study_country AS (
  SELECT
    case_study,
    string_agg(country, ',') AS country
  FROM (
    SELECT
      rgc.case_study,
      coalesce(cg.country, c2.name) AS country
    FROM
      case_study_geo_coverage rgc
    LEFT JOIN (
      SELECT
        cg.id AS id,
        c.name AS country
      FROM
        country_group cg,
        country_group_country cgc,
        country c
      WHERE
        cg.id = cgc.country_group
        AND cgc.country = c.id) cg ON rgc.country_group = cg.id
    LEFT JOIN country c2 ON rgc.country = c2.id) geo
GROUP BY
  case_study
),
case_study_json AS (
  SELECT
    cs.id AS case_study,
    jsonb_build_object('id', cs.id, 'title', cs.title, 'type', 'case_study', 'images', json_agg(DISTINCT jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility)) FILTER (WHERE f.id IS NOT NULL)) AS json
FROM
  case_study cs
  LEFT JOIN file f ON f.id IN (cs.thumbnail_id, cs.image_id)
GROUP BY
  cs.id
)
SELECT
  cs.id,
  'case_study' AS type,
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')) AS search_text,
  to_date(to_char(publish_year, '9999'), 'YYYY') AS valid_from,
  to_date('9999-12-31', 'YYYY-MM-DD') AS valid_to,
  cst.tag,
  csc.country,
  cscg.country_group,
  csp.publisher,
  cspp.partner,
  csj.json
FROM
  case_study cs
  LEFT JOIN case_study_tag cst ON cs.id = cst.case_study
  LEFT JOIN case_study_publisher csp ON cs.id = csp.case_study
  LEFT JOIN case_study_country csc ON cs.id = csc.case_study
  LEFT JOIN case_study_country_group cscg ON cs.id = cscg.case_study
  LEFT JOIN case_study_partner cspp ON cs.id = cspp.case_study
  LEFT JOIN case_study_json csj ON cs.id = csj.case_study
WHERE
  cs.review_status = 'APPROVED'::review_status
ORDER BY
  cs.id
)
UNION ALL
(
-- datasets
SELECT
  l.id,
  'dataset' AS type,
  to_tsvector(coalesce(l.title, '') || ' ' || coalesce(l.short_description, '') || ' ' || coalesce(l.metadata, '')) AS search_text,
  dataset_date_from (time_period) AS valid_from,
  dataset_date_to (time_period) AS valid_to,
  'dataset' AS tag,
  NULL AS country,
  NULL AS country_group,
  regexp_replace(data_source, '[\x00-\x1F\x7F]+', '', 'g') AS publisher, -- the data contains non-visible characters
  NULL AS partner,
  jsonb_build_object('id', l.id, 'title', l.title, 'type', 'case_study', 'images', t.formats) AS json
FROM
  layers l
  LEFT JOIN (
    SELECT
      m.related_id,
      f.formats
    FROM
      files f
      LEFT JOIN files_related_morphs m ON f.id = m.file_id
    WHERE
      m.field = 'thumbnail') t ON l.id = t.related_id
 where t.formats is not null
ORDER BY
  l.id
)

-- :name pages :query :one
-- :doc Get paginated submission contents
WITH
submission AS (
    SELECT s.id, 'stakeholder' AS type, 'stakeholder' AS topic, CONCAT(s.title, '. ', s.last_name,' ', s.first_name) as title, s.id as created_by, s.created, s.role, s.review_status, jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility) as image, NULL::boolean as featured,
    COALESCE(jsonb_agg(
      DISTINCT jsonb_build_object(
	'badge_id', sb.badge_id,
	'badge_name', b.name,
	'stakeholder_id', sb.stakeholder_id,
	'assigned_by', sb.assigned_by,
	'assigned_at', sb.assigned_at)
	) FILTER (WHERE sb.badge_id IS NOT NULL), '[]'::jsonb) AS assigned_badges
    FROM stakeholder s
    LEFT JOIN file f ON s.picture_id = f.id
    LEFT JOIN stakeholder_badge sb ON sb.stakeholder_id = s.id
    LEFT JOIN badge b ON b.id = sb.badge_id
--~ (when (= "experts" (:only params)) " JOIN stakeholder_tag st ON s.id = st.stakeholder AND st.tag_relation_category = 'expertise' ")
--~ (when (:review_status params) " WHERE review_status = :review_status::review_status ")
    GROUP BY s.id, f.id
    UNION
    SELECT o.id, 'organisation' AS type, 'organisation' AS topic, o.name as title, o.id as created_by, o.created, 'USER' as role, o.review_status, jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility) as image, NULL::boolean as featured,
     COALESCE(jsonb_agg(
      DISTINCT jsonb_build_object(
	'badge_id', ob.badge_id,
	'badge_name', b.name,
	'organisation_id', ob.organisation_id,
	'assigned_by', ob.assigned_by,
	'assigned_at', ob.assigned_at)
	) FILTER (WHERE ob.badge_id IS NOT NULL), '[]'::jsonb) AS assigned_badges
    FROM organisation o
    LEFT JOIN file f ON o.logo_id = f.id
    LEFT JOIN organisation_badge ob ON ob.organisation_id = o.id
    LEFT JOIN badge b ON b.id = ob.badge_id
    WHERE is_member = true
--~ (when (:review_status params) " AND review_status = :review_status::review_status ")
    GROUP BY o.id, f.id
    UNION
    SELECT o.id, 'organisation' AS type, 'non_member_organisation' AS topic, o.name as title, o.id as created_by, o.created, 'USER' as role, o.review_status, jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility) as image, NULL::boolean as featured,
    COALESCE(jsonb_agg(
      DISTINCT jsonb_build_object(
	'badge_id', ob.badge_id,
	'badge_name', b.name,
	'organisation_id', ob.organisation_id,
	'assigned_by', ob.assigned_by,
	'assigned_at', ob.assigned_at)
	) FILTER (WHERE ob.badge_id IS NOT NULL), '[]'::jsonb) AS assigned_badges
    FROM organisation o
    LEFT JOIN file f ON o.logo_id = f.id
    LEFT JOIN organisation_badge ob ON ob.organisation_id = o.id
    LEFT JOIN badge b ON b.id = ob.badge_id
    WHERE is_member = false
--~ (when (:review_status params) " AND review_status = :review_status::review_status ")
    GROUP BY o.id, f.id
    UNION
    SELECT id, 'tag' AS type, 'tag' AS topic, tag as title, NULL as created_by, NULL as created, NULL as role, review_status, NULL as image, NULL::boolean as featured, '[]'::jsonb AS assigned_badges
    FROM tag
--~ (when (:review_status params) " WHERE review_status = :review_status::review_status ")
    UNION
    SELECT e.id, 'event' AS type, 'event' AS topic, e.title, e.created_by, e.created, 'USER' as role, e.review_status, jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility) as image, e.featured,
    COALESCE(jsonb_agg(
      DISTINCT jsonb_build_object(
	'badge_id', eb.badge_id,
	'badge_name', b.name,
	'event_id', eb.event_id,
	'assigned_by', eb.assigned_by,
	'assigned_at', eb.assigned_at)
	) FILTER (WHERE eb.badge_id IS NOT NULL), '[]'::jsonb) AS assigned_badges
    FROM event e
    LEFT JOIN file f ON e.image_id = f.id
    LEFT JOIN event_badge eb ON eb.event_id = e.id
    LEFT JOIN badge b ON b.id = eb.badge_id
--~ (when (:review_status params) " WHERE review_status = :review_status::review_status ")
    GROUP BY e.id, f.id
    UNION
    SELECT t.id, 'technology' AS type, 'technology' AS topic, t.name as title, t.created_by, t.created, 'USER' as role, t.review_status, jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility) as image, t.featured,
    COALESCE(jsonb_agg(
      DISTINCT jsonb_build_object(
	'badge_id', tb.badge_id,
	'badge_name', b.name,
	'technology_id', tb.technology_id,
	'assigned_by', tb.assigned_by,
	'assigned_at', tb.assigned_at)
	) FILTER (WHERE tb.badge_id IS NOT NULL), '[]'::jsonb) AS assigned_badges
    FROM technology t
    LEFT JOIN file f ON t.image_id = f.id
    LEFT JOIN technology_badge tb ON tb.technology_id = t.id
    LEFT JOIN badge b ON b.id = tb.badge_id
--~ (when (:review_status params) " WHERE review_status = :review_status::review_status ")
    GROUP BY t.id, f.id
    UNION
    SELECT p.id, 'policy' AS type, 'policy' AS topic, p.title, p.created_by, p.created, 'USER' as role, p.review_status, jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility) as image, p.featured,
    COALESCE(jsonb_agg(
      DISTINCT jsonb_build_object(
	'badge_id', pb.badge_id,
	'badge_name', b.name,
	'policy_id', pb.policy_id,
	'assigned_by', pb.assigned_by,
	'assigned_at', pb.assigned_at)
	) FILTER (WHERE pb.badge_id IS NOT NULL), '[]'::jsonb) AS assigned_badges
    FROM policy p
    LEFT JOIN file f ON p.image_id = f.id
    LEFT JOIN policy_badge pb ON pb.policy_id = p.id
    LEFT JOIN badge b ON b.id = pb.badge_id
--~ (when (:review_status params) " WHERE review_status = :review_status::review_status ")
    GROUP BY p.id, f.id
    UNION
    SELECT r.id, REPLACE(LOWER(r.type), ' ', '_') AS type, 'resource' AS topic, r.title, r.created_by, r.created, 'USER' as role, r.review_status, jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility) AS image, r.featured,
    COALESCE(jsonb_agg(
      DISTINCT jsonb_build_object(
	'badge_id', rb.badge_id,
	'badge_name', b.name,
	'resource_id', rb.resource_id,
	'assigned_by', rb.assigned_by,
	'assigned_at', rb.assigned_at)
	) FILTER (WHERE rb.badge_id IS NOT NULL), '[]'::jsonb) AS assigned_badges
    FROM resource r
    LEFT JOIN file f ON r.image_id = f.id
    LEFT JOIN resource_badge rb ON rb.resource_id = r.id
    LEFT JOIN badge b ON b.id = rb.badge_id
--~ (when (:review_status params) " WHERE review_status = :review_status::review_status ")
    GROUP BY r.id, f.id
    UNION
    SELECT i.id, 'initiative' AS type, 'initiative' AS topic, replace(i.q2::text,'"','') as title, i.created_by, i.created, 'USER' as role, i.review_status, jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility) AS image, i.featured,
    COALESCE(jsonb_agg(
      DISTINCT jsonb_build_object(
	'badge_id', ib.badge_id,
	'badge_name', b.name,
	'initiative_id', ib.initiative_id,
	'assigned_by', ib.assigned_by,
	'assigned_at', ib.assigned_at)
	) FILTER (WHERE ib.badge_id IS NOT NULL), '[]'::jsonb) AS assigned_badges
    FROM initiative i
    LEFT JOIN file f ON i.image_id = f.id
    LEFT JOIN initiative_badge ib ON ib.initiative_id = i.id
    LEFT JOIN badge b ON b.id = ib.badge_id
--~ (when (:review_status params) " WHERE review_status = :review_status::review_status ")
    GROUP BY i.id, f.id
    UNION
    SELECT cs.id, 'case_study' AS type, 'case_study' AS topic, cs.title, cs.created_by, cs.created, 'USER' as role, cs.review_status, jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility) AS image, cs.featured,
    COALESCE(jsonb_agg(
      DISTINCT jsonb_build_object(
	'badge_id', csb.badge_id,
	'badge_name', b.name,
	'case_study_id', csb.case_study_id,
	'assigned_by', csb.assigned_by,
	'assigned_at', csb.assigned_at)
	) FILTER (WHERE csb.badge_id IS NOT NULL), '[]'::jsonb) AS assigned_badges
    FROM case_study cs
    LEFT JOIN file f ON cs.image_id = f.id
    LEFT JOIN case_study_badge csb ON csb.case_study_id = cs.id
    LEFT JOIN badge b ON b.id = csb.badge_id
--~ (when (:review_status params) " WHERE review_status = :review_status::review_status ")
    GROUP BY cs.id, f.id
    UNION
    SELECT p.id, 'project' AS type, 'project' AS topic, p.title, p.created_by, p.created, 'USER' as role, p.review_status, jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility) AS image, p.featured,
    COALESCE(jsonb_agg(
      DISTINCT jsonb_build_object(
	'badge_id', pb.badge_id,
	'badge_name', b.name,
	'project_id', pb.project_id,
	'assigned_by', pb.assigned_by,
	'assigned_at', pb.assigned_at)
	) FILTER (WHERE pb.badge_id IS NOT NULL), '[]'::jsonb) AS assigned_badges
    FROM project p
    LEFT JOIN file f ON p.image_id = f.id
    LEFT JOIN project_badge pb ON pb.project_id = p.id
    LEFT JOIN badge b ON b.id = pb.badge_id
--~ (when (:review_status params) " WHERE review_status = :review_status::review_status ")
    GROUP BY p.id, f.id
    ORDER BY created
),
authz AS (
    SELECT s.id, 'stakeholder' as type, '[]'::jsonb AS owners, '[]'::jsonb AS focal_points
    FROM submission s
    WHERE s.type = 'stakeholder'
    UNION
    SELECT s.id, 'organisation' as type, '[]'::jsonb AS owners,
    COALESCE(jsonb_agg(jsonb_build_object('id', st.id, 'email', st.email)), '[]'::jsonb) AS focal_points
    FROM submission s
    INNER JOIN stakeholder_organisation a ON a.organisation = s.id AND a.association = 'focal-point'
    INNER JOIN stakeholder st ON a.stakeholder = st.id
    WHERE s.type = 'organisation'
    GROUP BY s.id, s.type
    UNION
    SELECT s.id, 'organisation' as type, '[]'::jsonb AS owners,
    COALESCE(jsonb_agg(jsonb_build_object('id', st.id, 'email', st.email)), '[]'::jsonb) AS focal_points
    FROM submission s
    INNER JOIN stakeholder_organisation a ON a.organisation = s.id AND a.association = 'focal-point'
    INNER JOIN stakeholder st ON a.stakeholder = st.id
    WHERE s.topic = 'non_member_organisation'
    GROUP BY s.id, s.type
    UNION
    SELECT s.id, 'organisation' as type, '[]'::jsonb AS owners,
    COALESCE(jsonb_agg(jsonb_build_object('id', st.id, 'email', st.email)), '[]'::jsonb) AS focal_points
    FROM submission s
    INNER JOIN stakeholder_organisation a ON a.organisation = s.id AND a.association = 'focal-point'
    INNER JOIN stakeholder st ON a.stakeholder = st.id
    WHERE s.type = 'organisation' AND s.topic = 'non_member_organisation'
    GROUP BY s.id, s.type
    UNION
    SELECT s.id, 'tag' as type, '[]'::jsonb AS owners,'[]'::jsonb AS focal_points
    FROM submission s
    WHERE s.type = 'tag'
    UNION
    SELECT s.id, 'event' as type,
    COALESCE(jsonb_agg(jsonb_build_object('id', st.id, 'email', st.email)), '[]'::jsonb) AS owners,
    '[]'::jsonb AS focal_points
    FROM submission s
    INNER JOIN stakeholder_event a ON a.event = s.id AND a.association = 'owner'
    INNER JOIN stakeholder st ON a.stakeholder = st.id
    WHERE s.type = 'event'
    GROUP BY s.id, s.type
    UNION
    SELECT s.id, REPLACE(LOWER(s.type), ' ', '_') as type,
    COALESCE(jsonb_agg(jsonb_build_object('id', st.id, 'email', st.email)), '[]'::jsonb) AS owners,
    '[]'::jsonb AS focal_points
    FROM submission s
    INNER JOIN stakeholder_resource a ON a.resource = s.id AND a.association = 'owner'
    INNER JOIN stakeholder st ON a.stakeholder = st.id
    WHERE s.topic = 'resource'
    GROUP BY s.id, s.type
    UNION
    SELECT s.id, 'initiative' as type,
    COALESCE(jsonb_agg(jsonb_build_object('id', st.id, 'email', st.email)), '[]'::jsonb) AS owners,
    '[]'::jsonb AS focal_points
    FROM submission s
    INNER JOIN stakeholder_initiative a ON a.initiative = s.id AND a.association = 'owner'
    INNER JOIN stakeholder st ON a.stakeholder = st.id
    WHERE s.type = 'initiative'
    GROUP BY s.id, s.type
    UNION
    SELECT s.id, 'technology' as type,
    COALESCE(jsonb_agg(jsonb_build_object('id', st.id, 'email', st.email)), '[]'::jsonb) AS owners,
    '[]'::jsonb AS focal_points
    FROM submission s
    INNER JOIN stakeholder_technology a ON a.technology = s.id AND a.association = 'owner'
    INNER JOIN stakeholder st ON a.stakeholder = st.id
    WHERE s.type = 'technology'
    GROUP BY s.id, s.type
    UNION
    SELECT s.id, 'policy' as type,
    COALESCE(jsonb_agg(jsonb_build_object('id', st.id, 'email', st.email)), '[]'::jsonb) AS owners,
    '[]'::jsonb AS focal_points
    FROM submission s
    INNER JOIN stakeholder_policy a ON a.policy = s.id AND a.association = 'owner'
    INNER JOIN stakeholder st ON a.stakeholder = st.id
    WHERE s.type = 'policy'
    GROUP BY s.id, s.type
    UNION
    SELECT s.id, 'case_study' as type,
    COALESCE(jsonb_agg(jsonb_build_object('id', st.id, 'email', st.email)), '[]'::jsonb) AS owners,
    '[]'::jsonb AS focal_points
    FROM submission s
    INNER JOIN stakeholder_case_study a ON a.case_study = s.id AND a.association = 'owner'
    INNER JOIN stakeholder st ON a.stakeholder = st.id
    WHERE s.type = 'case_study'
    GROUP BY s.id, s.type
    UNION
    SELECT s.id, 'project' as type, COALESCE(jsonb_agg(jsonb_build_object('id', st.id, 'email', st.email)), '[]'::jsonb) AS owners, '[]'::jsonb AS focal_points
    FROM submission s
    INNER JOIN stakeholder_project a ON a.project = s.id AND a.association = 'owner'
    INNER JOIN stakeholder st ON a.stakeholder = st.id
    WHERE s.type = 'project'
    GROUP BY s.id, s.type
    ),
reviewers AS (
 SELECT s.id, s.type, s.review_status, COALESCE(json_agg(json_build_object ('id', r.reviewer, 'review_status', r.review_status)) FILTER (WHERE r.reviewer IS NOT NULL), '[]') as reviewers
 FROM submission s
    LEFT JOIN review r ON r.topic_type = s.topic::topic_type AND r.topic_id = s.id
    GROUP BY s.id, s.review_status, s.type),
data AS (
    SELECT s.id, s.type, s.topic, s.title, s.featured, TO_CHAR(s.created, 'DD/MM/YYYY HH12:MI pm') as created, c.email as created_by, '/submission/' || s.type || '/' || s.id as preview, COALESCE(s.review_status, 'SUBMITTED') AS review_status, s.role, COALESCE(a.owners, '[]') AS owners, COALESCE(a.focal_points, '[]') AS focal_points, s.image, r.reviewers, s.assigned_badges
    FROM submission s
    LEFT JOIN stakeholder c ON c.id = s.created_by
    LEFT JOIN authz a on s.id=a.id and s.type=a.type
    LEFT JOIN reviewers r on s.id=r.id and s.type=r.type
    WHERE 1=1
--~ (when (= "entities" (:only params)) " AND  s.type IN ( 'organisation') AND s.topic IN ('organisation')")
--~ (when (= "non-member-entities" (:only params)) " AND  s.type IN ( 'organisation') AND s.topic IN ('non_member_organisation')")
--~ (when (get #{"stakeholders" "experts"} (:only params)) " AND s.type IN ('stakeholder') ")
--~ (when (= "tags" (:only params)) " AND  s.type IN ('tag') ")
--~ (when (= "resources" (:only params)) " AND  s.type NOT IN ('stakeholder', 'organisation', 'tag') ")
--~ (when (:title params) (str " AND s.title ILIKE '%" (:title params) "%' ") )
    ORDER BY s.created
    LIMIT :limit
    OFFSET :limit * (:page - 1)
)
SELECT json_build_object(
    'data', (select json_agg(row_to_json(data)) from data),
    'count', (
    SELECT COUNT(*) FROM submission
    WHERE 1=1
--~ (when (= "entities" (:only params)) " AND type IN ('organisation') AND topic IN ('organisation')")
--~ (when (= "non-member-entities" (:only params)) " AND  type IN ( 'organisation') AND topic IN ('non_member_organisation')")
--~ (when (get #{"stakeholders" "experts"} (:only params)) " AND  type IN ('stakeholder') ")
--~ (when (= "resources" (:only params)) " AND type NOT IN ('stakeholder', 'organisation', 'tag') ")
--~ (when (= "tags" (:only params)) " AND type IN ('tag') ")
--~ (when (:title params) (str " AND title ILIKE '%" (:title params) "%' ") )
    ),
    'page', :page,
    'pages', (
    SELECT COUNT(*) FROM submission
    WHERE 1=1
--~ (when (= "entities" (:only params)) " AND type IN ( 'organisation') AND topic IN ('organisation')")
--~ (when (= "non-member-entities" (:only params)) " AND  type IN ( 'organisation') AND topic IN ('non_member_organisation')")
--~ (when (get #{"stakeholders" "experts"} (:only params)) " AND  type IN ('stakeholder') ")
--~ (when (= "resources" (:only params)) " AND type NOT IN ('stakeholder', 'organisation', 'tag') ")
--~ (when (= "tags" (:only params)) " AND type IN ('tag') ")
--~ (when (:title params) (str " AND title ILIKE '%" (:title params) "%' ") )
    ) / :limit,
    'limit', :limit) as result;

-- :name detail :query :one
-- :doc get detail of submission
SELECT *
FROM :i:table-name
WHERE id = :id::integer;

-- :name update-submission :execute :affected
-- :doc approve or reject submission
update :i:table-name
set reviewed_at = now(),
    review_status = :v:review_status::review_status
--~ (when (contains? params :reviewed_by) ",reviewed_by = :reviewed_by::integer")
where id = :id;

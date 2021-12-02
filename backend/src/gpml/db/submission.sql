-- :name pages :? :1
-- :doc Get paginated submission contents
WITH
submission AS (
    SELECT id, 'stakeholder' AS type, 'stakeholder' AS topic, CONCAT(title, '. ', last_name,' ', first_name) as title, id as created_by, created, role, review_status, picture as image
    FROM stakeholder
--~ (when (:review_status params) " WHERE review_status = :review_status::review_status ")
    UNION
    SELECT id, 'organisation' AS type, 'organisation' AS topic, name as title, id as created_by, created, 'USER' as role, review_status, logo as image
    FROM organisation
    WHERE is_member=true
--~ (when (:review_status params) " AND review_status = :review_status::review_status ")
    UNION
    SELECT id, 'event' AS type, 'event' AS topic, title, created_by, created, 'USER' as role, review_status, image
    FROM event
--~ (when (:review_status params) " WHERE review_status = :review_status::review_status ")
    UNION
    SELECT id, 'technology' AS type, 'technology' AS topic, name as title, created_by, created, 'USER' as role, review_status, image
    FROM technology
--~ (when (:review_status params) " WHERE review_status = :review_status::review_status ")
    UNION
    SELECT id, 'policy' AS type, 'policy' AS topic, title, created_by, created, 'USER' as role, review_status, image as picture
    FROM policy
--~ (when (:review_status params) " WHERE review_status = :review_status::review_status ")
    UNION
    SELECT id, REPLACE(LOWER(type), ' ', '_') AS type, 'resource' AS topic, title, created_by, created, 'USER' as role, review_status, image
    FROM resource
--~ (when (:review_status params) " WHERE review_status = :review_status::review_status ")
    UNION
    SELECT id, 'project' AS type, 'initiative' AS topic, replace(q2::text,'"','') as title, created_by, created, 'USER' as role, review_status, '' as image
    FROM initiative
--~ (when (:review_status params) " WHERE review_status = :review_status::review_status ")
    order by created
),
authz AS (
    select s.id, s.type,  COALESCE(json_agg(st.id) FILTER (WHERE st.email IS NOT NULL), '[]') as owners  from submission s
    LEFT JOIN topic_stakeholder_auth a ON a.topic_type = s.topic::topic_type AND a.topic_id = s.id and a.roles @>'["owner"]'
    LEFT JOIN stakeholder st ON a.stakeholder = st.id
    GROUP BY s.id, s.type),
reviewers AS (
 select s.id, s.type, s.review_status, COALESCE(json_agg(json_build_object ('id', r.reviewer, 'review_status', r.review_status)) FILTER (WHERE r.reviewer IS NOT NULL), '[]') as reviewers  from submission s
    LEFT JOIN review r ON r.topic_type = s.topic::topic_type AND r.topic_id = s.id
    GROUP BY s.id, s.review_status, s.type),
data AS (
    SELECT s.id, s.type, s.topic, s.title, TO_CHAR(s.created, 'DD/MM/YYYY HH12:MI pm') as created, c.email as created_by, '/submission/' || s.type || '/' || s.id as preview, COALESCE(s.review_status, 'SUBMITTED') AS review_status, s.role, a.owners, s.image, r.reviewers
    FROM submission s
    LEFT JOIN stakeholder c ON c.id = s.created_by
    LEFT JOIN authz a on s.id=a.id and s.type=a.type
    LEFT JOIN reviewers r on s.id=r.id and s.type=r.type
    WHERE 1=1
--~ (when (= "entities" (:only params)) " AND  s.type IN ( 'organisation') ")
--~ (when (= "stakeholders" (:only params)) " AND  s.type IN ('stakeholder') ")
--~ (when (= "resources" (:only params)) " AND  s.type NOT IN ('stakeholder', 'organisation') ")
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
--~ (when (= "entities" (:only params)) " AND type IN ('organisation') ")
--~ (when (= "stakeholders" (:only params)) " AND type IN ('stakeholder') ")
--~ (when (= "resources" (:only params)) " AND type NOT IN ('stakeholder', 'organisation') ")
--~ (when (:title params) (str " AND title ILIKE '%" (:title params) "%' ") )
    ),
    'page', :page,
    'pages', (
    SELECT COUNT(*) FROM submission
    WHERE 1=1
--~ (when (= "entities" (:only params)) " AND type IN ( 'organisation') ")
--~ (when (= "stakeholders" (:only params)) " AND type IN ('stakeholder') ")
--~ (when (= "resources" (:only params)) " AND type NOT IN ('stakeholder', 'organisation') ")
--~ (when (:title params) (str " AND title ILIKE '%" (:title params) "%' ") )
    ) / :limit,
    'limit', :limit) as result;

-- :name detail :? :1
-- :doc get detail of submission
SELECT *
from :i:table-name
where id = :id::integer;

-- :name update-submission :! :n
-- :doc approve or reject submission
update :i:table-name
set reviewed_at = now(),
    review_status = :v:review_status::review_status
--~ (when (contains? params :reviewed_by) ",reviewed_by = :reviewed_by::integer")
where id = :id;

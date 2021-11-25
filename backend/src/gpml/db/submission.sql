-- :name pages :? :1
-- :doc Get paginated submission contents
WITH
submission AS (
    SELECT id, 'stakeholder' AS type, 'stakeholder' AS topic, CONCAT(title, '. ', last_name,' ', first_name) as title, id as created_by, created, role, review_status
    FROM stakeholder
--~ (when (:review_status params) " WHERE review_status = :review_status::review_status ")
    UNION
    SELECT id, 'organisation' AS type, 'organisation' AS topic, name as title, id as created_by, created, 'USER' as role, review_status
    FROM organisation
    WHERE is_member=true
--~ (when (:review_status params) " AND review_status = :review_status::review_status ")
    UNION
    SELECT id, 'event' AS type, 'event' AS topic, title, created_by, created, 'USER' as role, review_status
    FROM event
--~ (when (:review_status params) " WHERE review_status = :review_status::review_status ")
    UNION
    SELECT id, 'technology' AS type, 'technology' AS topic, name as title, created_by, created, 'USER' as role, review_status
    FROM technology
--~ (when (:review_status params) " WHERE review_status = :review_status::review_status ")
    UNION
    SELECT id, 'policy' AS type, 'policy' AS topic, title, created_by, created, 'USER' as role, review_status
    FROM policy
--~ (when (:review_status params) " WHERE review_status = :review_status::review_status ")
    UNION
    SELECT id, REPLACE(LOWER(type), ' ', '_') AS type, 'resource' AS topic, title, created_by, created, 'USER' as role, review_status
    FROM resource
--~ (when (:review_status params) " WHERE review_status = :review_status::review_status ")
    UNION
    SELECT id, 'project' AS type, 'initiative' AS topic, replace(q2::text,'"','') as title, created_by, created, 'USER' as role, review_status
    FROM initiative
--~ (when (:review_status params) " WHERE review_status = :review_status::review_status ")
    order by created
),
authz AS (
    select s.id, s.type, COALESCE(json_agg(st.id) FILTER (WHERE st.email IS NOT NULL), '[]') as owners  from submission s
    LEFT JOIN topic_stakeholder_auth a ON a.topic_type = s.topic::topic_type AND a.topic_id = s.id and a.roles @>'["owner"]'
    LEFT JOIN stakeholder st ON a.stakeholder = st.id
    GROUP BY s.id, s.type),
data AS (
    SELECT s.id, s.type, s.topic, s.title, TO_CHAR(s.created, 'DD/MM/YYYY HH12:MI pm') as created, c.email as created_by, '/submission/' || s.type || '/' || s.id as preview, COALESCE(s.review_status, 'SUBMITTED') AS review_status, row_to_json(reviewer.*) AS reviewer, s.role, a.owners
    FROM submission s
    LEFT JOIN stakeholder c ON c.id = s.created_by
    LEFT JOIN review r ON r.topic_type = s.topic::topic_type AND r.topic_id = s.id
    LEFT JOIN stakeholder reviewer ON reviewer.id = r.reviewer
    LEFT JOIN authz a on s.id=a.id and s.type=a.type
    WHERE 1=1
--~ (when (= "stakeholders" (:only params)) " AND  s.type IN ('stakeholder', 'organisation') ")
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
--~ (when (= "stakeholders" (:only params)) " WHERE type IN ('stakeholder', 'organisation') ")
--~ (when (= "resources" (:only params)) " WHERE type NOT IN ('stakeholder', 'organisation') ")
    ),
    'page', :page,
    'pages', (
    SELECT COUNT(*) FROM submission
    WHERE 1=1
--~ (when (= "stakeholders" (:only params)) " AND type IN ('stakeholder', 'organisation') ")
--~ (when (= "resources" (:only params)) " AND type NOT IN ('stakeholder', 'organisation') ")
--~ (when (:title params) (str " AND s.title ILIKE '%" (:title params) "%' ") )
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

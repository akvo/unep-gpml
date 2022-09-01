-- :name pages :? :1
-- :doc Get paginated archived contents
WITH
archived AS (
    SELECT id, 'stakeholder' AS type, CONCAT(title, '. ', last_name,' ', first_name) as title, review_status, reviewed_at, reviewed_by, null as created_by, role
    FROM stakeholder where review_status <> 'SUBMITTED'
    UNION
    SELECT id, 'organisation' AS type, name as title, review_status, reviewed_at, reviewed_by, created_by, 'USER' as role
    FROM organisation
    WHERE review_status = 'SUBMITTED' and is_member=true
    UNION
    SELECT id, 'event' AS type, title, review_status, reviewed_at, reviewed_by, created_by, 'USER' as role
    FROM event where review_status <> 'SUBMITTED'
    UNION
    SELECT id, 'technology' as type, name as title, review_status, reviewed_at, reviewed_by, created_by, 'USER' as role
    FROM technology where review_status <> 'SUBMITTED'
    UNION
    SELECT id, 'policy' as type, original_title as title, review_status, reviewed_at, reviewed_by, created_by, 'USER' as role
    FROM policy where review_status <> 'SUBMITTED'
    UNION
    SELECT id, REPLACE(LOWER(type), ' ', '_'), title, review_status, reviewed_at, reviewed_by, created_by, 'USER' as role
    FROM resource where review_status <> 'SUBMITTED'
    UNION
    SELECT id, 'initiative' as type, replace(q2::text,'"','') as title, review_status, reviewed_at, reviewed_by, created_by, 'USER' as role
    FROM initiative where review_status <> 'SUBMITTED'
    ORDER BY reviewed_at DESC NULLS LAST
),
data AS (
    SELECT a.id, a.type, a.title, a.review_status, CONCAT(s.first_name,' ', s.last_name) AS reviewed_by, TO_CHAR(a.reviewed_at, 'DD/MM/YYYY HH12:MI pm') as reviewed_at, c.email as created_by, a.role
    FROM archived a
    LEFT JOIN stakeholder s ON s.id = a.reviewed_by
    LEFT JOIN stakeholder c ON c.id = a.created_by
--~ (when (= "stakeholders" (:only params)) "WHERE a.type IN ('stakeholder', 'organisation') ")
--~ (when (= "resources" (:only params)) "WHERE a.type NOT IN ('stakeholder', 'organisation') ")
    LIMIT :limit
    OFFSET :limit * (:page - 1)
)
SELECT json_build_object(
    'data', (select json_agg(row_to_json(data)) from data),
    'count', (SELECT COUNT(*) FROM archived),
    'page', :page,
    'pages', (SELECT COUNT(*) FROM archived) / :limit,
    'limit', :limit) as result;
